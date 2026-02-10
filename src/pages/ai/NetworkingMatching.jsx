import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import { networkingAPI } from '../../api';

const MATCH_DATA = [
  { name: 'Emily Watson', role: 'ML Engineer', company: 'Google', match: 98, interests: ['AI/ML', 'Python', 'Cloud'], online: true, bio: 'Building next-gen ML infrastructure' },
  { name: 'David Kim', role: 'CTO', company: 'StartupX', match: 94, interests: ['Architecture', 'Leadership', 'DevOps'], online: true, bio: 'Scaling engineering teams' },
  { name: 'Sofia Rodriguez', role: 'Product Manager', company: 'Meta', match: 89, interests: ['Product Strategy', 'UX', 'Analytics'], online: false, bio: 'User-centric product development' },
  { name: 'James Park', role: 'Senior Engineer', company: 'Netflix', match: 85, interests: ['Distributed Systems', 'Rust', 'Performance'], online: true, bio: 'Making streaming faster' },
  { name: 'Lisa Chen', role: 'Data Scientist', company: 'Spotify', match: 82, interests: ['RecSys', 'NLP', 'Python'], online: false, bio: 'Personalization at scale' },
  { name: 'Marcus Brown', role: 'VP Engineering', company: 'Stripe', match: 78, interests: ['FinTech', 'Team Building', 'Scale'], online: true, bio: 'Building payment infrastructure' },
];

export default function NetworkingMatching() {
  const [matches, setMatches] = useState(MATCH_DATA);
  const [filter, setFilter] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    networkingAPI.matches('all').then((res) => {
      if (res.data?.matches?.length) setMatches(res.data.matches);
    }).catch(() => {});
  }, []);

  const filtered = filter === 'online' ? matches.filter((m) => m.online) : matches;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-charcoal flex items-center gap-2">
              <span className="material-icons text-primary">auto_awesome</span>
              AI Networking & Matching
            </h1>
            <p className="text-sm text-gray-500">
              Intelligent connections based on your profile, interests, and goals
            </p>
          </div>
          <div className="flex gap-2">
            {['all', 'online'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                  filter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'online' && <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1.5" />}
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Network visualization placeholder */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-blue-500/5">
          <div className="text-center py-8">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
              <div className="absolute inset-4 border-2 border-dashed border-blue-500/20 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <span className="material-icons text-white">person</span>
                </div>
              </div>
              {/* Orbiting dots */}
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <div
                  key={deg}
                  className="absolute w-4 h-4 bg-primary/60 rounded-full"
                  style={{
                    top: `${50 + 45 * Math.sin((deg * Math.PI) / 180)}%`,
                    left: `${50 + 45 * Math.cos((deg * Math.PI) / 180)}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Analyzing <strong className="text-charcoal">1,248 attendees</strong> to find your best connections
            </p>
          </div>
        </Card>

        {/* Match cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((match) => (
            <Card
              key={match.name}
              className="p-5 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedMatch(match)}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="relative">
                  <Avatar name={match.name} size="md" />
                  {match.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-charcoal truncate">{match.name}</h3>
                  <p className="text-xs text-gray-500">{match.role} @ {match.company}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{match.bio}</p>
                </div>
                <Badge color="primary" className="shrink-0">{match.match}%</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {match.interests.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 text-xs">
                  <span className="material-icons text-xs mr-1">person_add</span>
                  Connect
                </Button>
                <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <span className="material-icons text-gray-400 text-base">chat_bubble_outline</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
