import { useState, useRef, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { aiAPI, eventsAPI } from '../../api';

const SUGGESTIONS = [
  'What sessions are happening today?',
  'Help me find networking events',
  'Summarize the keynote schedule',
  'Who are the speakers on the AI track?',
];

export default function ChatbotAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I'm the NetSync AI Assistant. I can help you with event info, schedules, networking, and more. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [showEventPicker, setShowEventPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadEvents = async () => {
    try {
      const res = await eventsAPI.list();
      setEvents(res.data?.events || res.data || []);
    } catch {
      /* ignore */
    }
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const readDocumentText = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }
      const isImage = file.type.startsWith('image/');
      const isDocument =
        ['application/pdf', 'text/plain', 'text/csv', 'application/json'].includes(file.type) ||
        file.name.endsWith('.md');

      if (!isImage && !isDocument) {
        toast.error(`Unsupported file type: ${file.type || file.name}`);
        continue;
      }

      try {
        if (isImage) {
          const base64 = await fileToBase64(file);
          setAttachments((prev) => [
            ...prev,
            { type: 'image', data: base64, filename: file.name, mime_type: file.type, preview: URL.createObjectURL(file) },
          ]);
        } else {
          const text = await readDocumentText(file);
          setAttachments((prev) => [
            ...prev,
            { type: 'document', data: text, filename: file.name, mime_type: file.type },
          ]);
        }
      } catch {
        toast.error(`Failed to read ${file.name}`);
      }
    }
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => {
      const att = prev[index];
      if (att?.preview) URL.revokeObjectURL(att.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const sendMessage = useCallback(
    async (text) => {
      const messageText = text || input.trim();
      if (!messageText && attachments.length === 0) return;

      const userMsg = { role: 'user', content: messageText || '(attached file)' };
      if (attachments.length > 0) {
        userMsg.attachments = attachments.map((a) => ({
          type: a.type,
          filename: a.filename,
          preview: a.preview,
        }));
      }

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput('');
      setLoading(true);

      const apiMessages = updatedMessages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      const apiAttachments =
        attachments.length > 0
          ? attachments.map((a) => ({
              type: a.type,
              data: a.data,
              filename: a.filename,
              mime_type: a.mime_type,
            }))
          : undefined;

      setAttachments([]);

      try {
        const res = await aiAPI.chat({
          messages: apiMessages,
          event_id: selectedEvent || undefined,
          attachments: apiAttachments,
        });
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.data?.response || 'No response received.' },
        ]);
      } catch (err) {
        const errorText = err.response?.data?.detail || 'Failed to get a response. Please try again.';
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${errorText}` },
        ]);
        toast.error('AI request failed');
      } finally {
        setLoading(false);
      }
    },
    [input, messages, attachments, selectedEvent]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      { role: 'assistant', content: "Chat cleared! I'm ready to help — what can I do for you?" },
    ]);
    setAttachments([]);
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-6rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center">
              <span className="material-icons text-white text-[20px]">smart_toy</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-charcoal">NetSync AI Assistant</h2>
              <p className="text-xs text-gray-400">
                Powered by NetSync AI &bull; Supports images &amp; documents
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Event context picker */}
            <div className="relative">
              <button
                onClick={() => setShowEventPicker(!showEventPicker)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition"
              >
                <span className="material-icons text-[16px]">event</span>
                {selectedEvent
                  ? (
                      events.find((e) => (e._id || e.id) === selectedEvent)?.title || 'Event'
                    ).slice(0, 20)
                  : 'No event context'}
                <span className="material-icons text-[16px]">expand_more</span>
              </button>
              {showEventPicker && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedEvent('');
                      setShowEventPicker(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-t-xl"
                  >
                    No event context
                  </button>
                  {events.map((ev) => (
                    <button
                      key={ev._id || ev.id}
                      onClick={() => {
                        setSelectedEvent(ev._id || ev.id);
                        setShowEventPicker(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        selectedEvent === (ev._id || ev.id)
                          ? 'bg-primary/5 text-primary font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      {ev.title || ev.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={clearChat}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition"
              title="Clear chat"
            >
              <span className="material-icons text-gray-400 text-[20px]">delete_outline</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-gray-50 text-charcoal border border-gray-100 rounded-bl-md'
                }`}
              >
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {msg.attachments.map((att, j) =>
                      att.type === 'image' && att.preview ? (
                        <img
                          key={j}
                          src={att.preview}
                          alt={att.filename}
                          className="w-20 h-20 object-cover rounded-lg border border-white/30"
                        />
                      ) : (
                        <div
                          key={j}
                          className="flex items-center gap-1 bg-white/20 rounded px-2 py-1 text-xs"
                        >
                          <span className="material-icons text-[14px]">description</span>
                          {att.filename}
                        </div>
                      )
                    )}
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="material-icons animate-spin text-[18px]">refresh</span>
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-6 pb-2">
            <p className="text-xs text-gray-400 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-full text-gray-600 hover:bg-primary/5 hover:border-primary/30 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="px-6 pb-2">
            <div className="flex flex-wrap gap-2">
              {attachments.map((att, i) => (
                <div
                  key={i}
                  className="relative group flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2"
                >
                  {att.type === 'image' && att.preview ? (
                    <img src={att.preview} alt={att.filename} className="w-10 h-10 object-cover rounded" />
                  ) : (
                    <span className="material-icons text-gray-400 text-[20px]">description</span>
                  )}
                  <span className="text-xs text-gray-600 max-w-[100px] truncate">
                    {att.filename}
                  </span>
                  <button
                    onClick={() => removeAttachment(i)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs leading-none"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.txt,.csv,.json,.md"
              multiple
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/30 transition"
              title="Attach image or document"
            >
              <span className="material-icons text-[20px]">attach_file</span>
            </button>
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your event..."
                rows={1}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 text-charcoal px-4 py-3 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                style={{ maxHeight: '120px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={loading || (!input.trim() && attachments.length === 0)}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <span className="material-icons text-[20px]">send</span>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Supports images (PNG, JPG, GIF) and documents (PDF, TXT, CSV, JSON, MD)
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
