import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { aiAPI } from '../../api';

const CATEGORIES = ['All', 'Sessions', 'Speakers', 'Attendees', 'Venues', 'Resources'];

const SAMPLE_RESULTS = [
  { type: 'session', title: 'AI in Healthcare Panel', desc: 'Exploring AI applications in medical diagnostics', time: '1:00 PM', location: 'Main Stage', track: 'engineering' },
  { type: 'speaker', title: 'Dr. Sarah Chen', desc: 'AI Research Lead @ Google DeepMind', sessions: 3 },
  { type: 'attendee', title: 'David Kim', desc: 'CTO @ StartupX • 94% Match', online: true },
  { type: 'session', title: 'Building Scalable APIs', desc: 'Modern API architecture patterns', time: '3:00 PM', location: 'Workshop Room A', track: 'engineering' },
  { type: 'venue', title: 'Grand Ballroom', desc: 'Capacity: 500 • Floor 2', available: true },
];

const typeIcon = (t) => ({ session: 'event', speaker: 'mic', attendee: 'person', venue: 'location_on', resource: 'description' }[t] || 'search');

export default function SearchDiscovery() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [results, setResults] = useState(SAMPLE_RESULTS);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await aiAPI.search({ query, category: activeCategory });
      if (res.data?.results) setResults(res.data.results);
    } catch {
      // fallback to sample
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-charcoal mb-2">
            <span className="text-primary">AI-Powered</span> Search & Discovery
          </h1>
          <p className="text-gray-500">Find anything across your event with natural language</p>
        </div>

        {/* Search bar */}
        <div className="relative">
          <div className="glass border-2 border-gray-200 focus-within:border-primary rounded-2xl p-2 flex items-center gap-3 transition-colors shadow-lg shadow-primary/5">
            <span className="material-icons text-gray-400 text-xl ml-3">search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Try: 'AI sessions tomorrow afternoon' or 'speakers about machine learning'"
              className="flex-1 bg-transparent outline-none text-sm text-charcoal placeholder:text-gray-400"
            />
            <Button onClick={handleSearch} loading={loading} size="sm" className="px-6">
              <span className="material-icons text-sm mr-1">auto_awesome</span>
              Search
            </Button>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-3">
          {results.map((result, idx) => (
            <Card key={idx} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-icons text-primary">{typeIcon(result.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-charcoal">{result.title}</h3>
                    <Badge color="gray" className="text-[10px]">{result.type}</Badge>
                  </div>
                  <p className="text-xs text-gray-500">{result.desc}</p>
                  {result.time && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <span className="material-icons text-[12px]">schedule</span>
                        {result.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-icons text-[12px]">location_on</span>
                        {result.location}
                      </span>
                    </p>
                  )}
                </div>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="material-icons text-gray-400 text-lg">arrow_forward</span>
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* AI insight */}
        <Card className="p-5 bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/10">
          <div className="flex items-start gap-3">
            <span className="material-icons text-primary text-xl">lightbulb</span>
            <div>
              <h4 className="text-sm font-semibold text-charcoal mb-1">AI Insight</h4>
              <p className="text-xs text-gray-500">
                Based on your profile and interests, you might also be interested in the
                <strong className="text-charcoal"> "Cloud Native Patterns" workshop</strong> starting at 2:30 PM
                in Workshop Room B.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
