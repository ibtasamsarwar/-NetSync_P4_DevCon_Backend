import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { sessionsAPI, eventsAPI } from '../../api';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
const TRACKS = [
  { id: 'all', label: 'All Tracks' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'design', label: 'Design' },
  { id: 'product', label: 'Product' },
];
const trackColor = (t) => ({ engineering: '#f47b25', design: '#3b82f6', product: '#22c55e' }[t] || '#9ca3af');

export default function SessionScheduler() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [sessions, setSessions] = useState([]);
  const [activeTrack, setActiveTrack] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '', description: '', track: 'engineering', room: '',
    start_time: '', end_time: '', speaker_name: '', speaker_title: '',
  });

  // Load organizer's events on mount
  useEffect(() => {
    eventsAPI.list({ limit: 50 }).then((res) => {
      const list = res.data?.events || [];
      setEvents(list);
      if (list.length > 0) setSelectedEvent(list[0]._id);
    }).catch(() => {});
  }, []);

  // Load sessions when event changes
  useEffect(() => {
    if (!selectedEvent) return;
    setLoading(true);
    sessionsAPI.list(selectedEvent).then((res) => {
      setSessions(res.data?.sessions || []);
    }).catch(() => {
      setSessions([]);
    }).finally(() => setLoading(false));
  }, [selectedEvent]);

  // Filter sessions
  const filtered = sessions.filter((s) => {
    const matchTrack = activeTrack === 'all' || s.track === activeTrack;
    const matchSearch = !searchQuery ||
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.speakers?.some((sp) => sp.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchTrack && matchSearch;
  });

  // Group sessions by room
  const rooms = [...new Set(filtered.map((s) => s.room || 'Unassigned'))];

  const getSlotIndex = (timeStr) => {
    if (!timeStr) return 0;
    const d = new Date(timeStr);
    const hour = d.getHours();
    return Math.max(0, hour - 9);
  };

  const getDurationSlots = (start, end) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    return Math.max(1, Math.round((e - s) / (60 * 60 * 1000)));
  };

  const handleAddSession = async () => {
    if (!newSession.title || !newSession.start_time || !newSession.end_time) {
      toast.error('Title, start time and end time are required');
      return;
    }
    try {
      const payload = {
        event_id: selectedEvent,
        title: newSession.title,
        description: newSession.description || null,
        track: newSession.track,
        room: newSession.room || null,
        start_time: new Date(newSession.start_time).toISOString(),
        end_time: new Date(newSession.end_time).toISOString(),
        speakers: newSession.speaker_name ? [{
          name: newSession.speaker_name,
          title: newSession.speaker_title || null,
        }] : [],
      };
      const res = await sessionsAPI.create(payload);
      setSessions([...sessions, res.data]);
      setShowAddModal(false);
      setNewSession({ title: '', description: '', track: 'engineering', room: '', start_time: '', end_time: '', speaker_name: '', speaker_title: '' });
      toast.success('Session created!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create session');
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm('Delete this session?')) return;
    try {
      await sessionsAPI.delete(id);
      setSessions(sessions.filter((s) => s._id !== id));
      toast.success('Session deleted');
    } catch {
      toast.error('Failed to delete session');
    }
  };

  const eventTitle = events.find((e) => e._id === selectedEvent)?.title || 'Select Event';

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">Session Scheduler</h1>
            <p className="text-sm text-gray-500">{eventTitle} — Timeline View</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Event selector */}
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary bg-white"
            >
              {events.length === 0 && <option value="">No events</option>}
              {events.map((evt) => (
                <option key={evt._id} value={evt._id}>{evt.title}</option>
              ))}
            </select>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <span className="material-icons text-sm mr-1">add</span> Add Session
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Left sidebar */}
          <div className="w-72 shrink-0 hidden lg:block space-y-4">
            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-gray-400 text-lg">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sessions..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Track filters */}
            <div className="flex flex-wrap gap-2">
              {TRACKS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTrack(t.id)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    activeTrack === t.id ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Session list */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Sessions ({filtered.length})
              </h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
                {filtered.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No sessions found</p>
                )}
                {filtered.map((s) => (
                  <div key={s._id} className="p-3 bg-white border border-gray-200 rounded-xl hover:border-primary/40 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-charcoal">{s.title}</span>
                      <button onClick={() => handleDeleteSession(s._id)} className="p-0.5 rounded hover:bg-red-50">
                        <span className="material-icons text-gray-300 hover:text-red-400 text-sm">close</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: trackColor(s.track) }} />
                      <span className="capitalize">{s.track}</span>
                      <span>•</span>
                      <span>{s.room || 'No room'}</span>
                    </div>
                    {s.speakers?.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">{s.speakers.map((sp) => sp.name).join(', ')}</p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">
                      {s.start_time ? new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '?'}
                      {' → '}
                      {s.end_time ? new Date(s.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '?'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline grid */}
          <Card className="flex-1 overflow-x-auto p-0">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-20">
                <span className="material-icons text-gray-300 text-5xl">calendar_month</span>
                <p className="text-gray-500 mt-3">No sessions yet</p>
                <Button className="mt-4" onClick={() => setShowAddModal(true)}>Add First Session</Button>
              </div>
            ) : (
              <div className="min-w-[900px]">
                {/* Time header */}
                <div className="flex border-b border-gray-100 sticky top-0 bg-white z-10">
                  <div className="w-48 p-3 text-xs font-semibold text-gray-400 shrink-0 border-r border-gray-100">
                    Rooms / Time
                  </div>
                  {TIME_SLOTS.map((time) => (
                    <div key={time} className="w-40 p-3 text-xs font-semibold text-gray-400 text-center border-r border-gray-50">
                      {time}
                    </div>
                  ))}
                </div>

                {/* Room rows */}
                {rooms.map((room) => (
                  <div key={room} className="flex border-b border-gray-50 relative min-h-[80px]">
                    <div className="w-48 p-3 shrink-0 border-r border-gray-100 sticky left-0 bg-white z-[5]">
                      <p className="text-sm font-medium text-charcoal">{room}</p>
                    </div>
                    <div className="flex-1 relative">
                      {filtered
                        .filter((s) => (s.room || 'Unassigned') === room)
                        .map((session) => {
                          const slotIdx = getSlotIndex(session.start_time);
                          const dur = getDurationSlots(session.start_time, session.end_time);
                          return (
                            <div
                              key={session._id}
                              className="absolute top-2 bottom-2 rounded-lg p-2 cursor-pointer transition-shadow hover:shadow-md"
                              style={{
                                left: `${slotIdx * 160}px`,
                                width: `${dur * 160 - 8}px`,
                                backgroundColor: `${trackColor(session.track)}15`,
                                borderLeft: `3px solid ${trackColor(session.track)}`,
                              }}
                              title={session.title}
                            >
                              <p className="text-xs font-semibold text-charcoal truncate">{session.title}</p>
                              <p className="text-[10px] text-gray-500 truncate">
                                {session.speakers?.map((sp) => sp.name).join(', ') || 'No speaker'}
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-4 text-xs">
                {TRACKS.filter((t) => t.id !== 'all').map((t) => (
                  <div key={t.id} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: trackColor(t.id) }} />
                    <span className="text-gray-500">{t.label}</span>
                  </div>
                ))}
              </div>
              <span className="text-xs text-gray-400">{filtered.length} sessions</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Session Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-charcoal">Add Session</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <span className="material-icons text-gray-400">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <Input label="Session Title" value={newSession.title}
                onChange={(e) => setNewSession({ ...newSession, title: e.target.value })} placeholder="e.g., Opening Keynote" required />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  rows={3} placeholder="Session description..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Track</label>
                  <select value={newSession.track}
                    onChange={(e) => setNewSession({ ...newSession, track: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary bg-white">
                    <option value="engineering">Engineering</option>
                    <option value="design">Design</option>
                    <option value="product">Product</option>
                  </select>
                </div>
                <Input label="Room" value={newSession.room}
                  onChange={(e) => setNewSession({ ...newSession, room: e.target.value })} placeholder="e.g., Grand Ballroom" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Start Time" type="datetime-local" value={newSession.start_time}
                  onChange={(e) => setNewSession({ ...newSession, start_time: e.target.value })} required />
                <Input label="End Time" type="datetime-local" value={newSession.end_time}
                  onChange={(e) => setNewSession({ ...newSession, end_time: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Speaker Name" value={newSession.speaker_name}
                  onChange={(e) => setNewSession({ ...newSession, speaker_name: e.target.value })} placeholder="John Doe" />
                <Input label="Speaker Title" value={newSession.speaker_title}
                  onChange={(e) => setNewSession({ ...newSession, speaker_title: e.target.value })} placeholder="CTO" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
                <Button onClick={handleAddSession} className="flex-1">Create Session</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
