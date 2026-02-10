import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import { pollsAPI } from '../../api';

const SAMPLE_POLL = {
  question: 'Which technology trend excites you the most for 2025?',
  options: [
    { id: 1, text: 'Generative AI & LLMs', votes: 345, percentage: 42 },
    { id: 2, text: 'Quantum Computing', votes: 178, percentage: 22 },
    { id: 3, text: 'Edge Computing & IoT', votes: 156, percentage: 19 },
    { id: 4, text: 'Web3 & Blockchain', votes: 139, percentage: 17 },
  ],
  totalVotes: 818,
  status: 'live',
};

const QUESTIONS = [
  { id: 1, text: 'How does the new GPT-4 architecture handle multimodal inputs differently from GPT-3?', author: 'Emily W.', upvotes: 24, time: '2m ago', answered: false },
  { id: 2, text: 'What are the practical limitations of using AI in healthcare diagnostics?', author: 'David K.', upvotes: 18, time: '5m ago', answered: false },
  { id: 3, text: 'Can you elaborate on the ethical considerations of AI-powered recruitment?', author: 'Sofia R.', upvotes: 12, time: '8m ago', answered: true },
];

export default function LivePollsQA() {
  const [poll] = useState(SAMPLE_POLL);
  const [questions, setQuestions] = useState(QUESTIONS);
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [voted, setVoted] = useState(false);
  const [activeTab, setActiveTab] = useState('polls');

  const handleVote = (optionId) => {
    if (voted) return;
    setSelectedOption(optionId);
    setVoted(true);
  };

  const handleUpvote = (id) => {
    setQuestions(questions.map((q) =>
      q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q
    ));
  };

  const handleSubmitQuestion = () => {
    if (!newQuestion.trim()) return;
    setQuestions([
      { id: Date.now(), text: newQuestion, author: 'You', upvotes: 0, time: 'Just now', answered: false },
      ...questions,
    ]);
    setNewQuestion('');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">Live Polls & Q&A</h1>
            <p className="text-sm text-gray-500">Real-time audience engagement</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge color="red">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1.5" />
              LIVE
            </Badge>
            <span className="text-sm text-gray-400">818 participants</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {['polls', 'q&a'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'polls' && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-icons text-primary text-xl">poll</span>
              <h2 className="text-lg font-bold text-charcoal">{poll.question}</h2>
            </div>

            <div className="space-y-3 mb-6">
              {poll.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleVote(opt.id)}
                  disabled={voted}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedOption === opt.id
                      ? 'border-primary bg-primary/5'
                      : voted
                        ? 'border-gray-100 bg-gray-50'
                        : 'border-gray-200 hover:border-primary/40 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-charcoal">{opt.text}</span>
                    {voted && (
                      <span className="text-sm font-bold text-primary">{opt.percentage}%</span>
                    )}
                  </div>
                  {voted && (
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${opt.percentage}%` }}
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>{poll.totalVotes} total votes</span>
              {voted && <span className="text-green-600 font-medium">✓ Vote recorded</span>}
            </div>
          </Card>
        )}

        {activeTab === 'q&a' && (
          <div className="space-y-4">
            {/* Submit question */}
            <Card className="p-4">
              <div className="flex gap-3">
                <input
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitQuestion()}
                  placeholder="Ask a question..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <Button onClick={handleSubmitQuestion} size="sm">
                  <span className="material-icons text-sm">send</span>
                </Button>
              </div>
            </Card>

            {/* Questions list */}
            {questions.map((q) => (
              <Card key={q.id} className={`p-4 ${q.answered ? 'opacity-60' : ''}`}>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleUpvote(q.id)}
                    className="flex flex-col items-center gap-1 py-1"
                  >
                    <span className="material-icons text-primary text-xl">arrow_upward</span>
                    <span className="text-sm font-bold text-charcoal">{q.upvotes}</span>
                  </button>
                  <div className="flex-1">
                    <p className="text-sm text-charcoal mb-2">{q.text}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{q.author}</span>
                      <span>•</span>
                      <span>{q.time}</span>
                      {q.answered && (
                        <Badge color="green" className="text-[10px]">Answered</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
