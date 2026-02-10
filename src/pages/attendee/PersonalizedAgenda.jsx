import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { aiAPI } from '../../api';

const SESSIONS = [
  { time: '10:00 AM', title: 'Opening Keynote: Future of AI', speaker: 'Dr. Sarah Chen', location: 'Grand Ballroom', track: 'engineering', trackColor: '#f47b25', recommended: true },
  { time: '11:30 AM', title: 'Design Systems Workshop', speaker: 'Maria Lopez', location: 'Workshop Room A', track: 'design', trackColor: '#3b82f6', recommended: true },
  { time: '11:30 AM', title: 'Cloud Migration Strategies', speaker: 'Alex Kim', location: 'Room 204', track: 'engineering', trackColor: '#f47b25', recommended: false, conflict: true },
  { time: '01:00 PM', title: 'Networking Lunch', speaker: '', location: 'Garden Terrace', track: null, trackColor: '#9ca3af', recommended: false },
  { time: '02:30 PM', title: 'Product-Led Growth Panel', speaker: 'Multiple Speakers', location: 'Main Stage', track: 'product', trackColor: '#22c55e', recommended: true },
  { time: '04:00 PM', title: 'Lightning Talks', speaker: 'Various', location: 'Demo Lounge', track: 'engineering', trackColor: '#f47b25', recommended: false },
];

export default function PersonalizedAgenda() {
  const [agenda] = useState(SESSIONS);
  const [showRecommended, setShowRecommended] = useState(false);

  const displayed = showRecommended ? agenda.filter((s) => s.recommended) : agenda;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-charcoal flex items-center gap-2">
              <span className="material-icons text-primary">auto_awesome</span>
              Personalized Agenda
            </h1>
            <p className="text-sm text-gray-500">AI-curated schedule based on your interests</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRecommended(!showRecommended)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                showRecommended ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              <span className="material-icons text-sm">star</span>
              AI Picks Only
            </button>
            <Button variant="outline" size="sm">
              <span className="material-icons text-sm mr-1">download</span>
              Export
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-0">
          {displayed.map((session, idx) => (
            <div key={idx} className="flex gap-4 relative">
              {/* Time & line */}
              <div className="w-20 shrink-0 text-right">
                <span className="text-sm font-semibold text-gray-500">{session.time}</span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="w-3 h-3 rounded-full shrink-0 ring-4 ring-white"
                  style={{ backgroundColor: session.trackColor }}
                />
                {idx < displayed.length - 1 && <div className="w-px flex-1 bg-gray-200" />}
              </div>

              {/* Card */}
              <div className="flex-1 pb-6">
                <Card className={`p-4 ${session.conflict ? 'border-amber-300 bg-amber-50/50' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-charcoal">{session.title}</h3>
                        {session.recommended && (
                          <Badge color="primary" className="text-[10px]">
                            <span className="material-icons text-[10px] mr-0.5">star</span>
                            AI Pick
                          </Badge>
                        )}
                        {session.conflict && (
                          <Badge color="yellow" className="text-[10px]">
                            <span className="material-icons text-[10px] mr-0.5">warning</span>
                            Conflict
                          </Badge>
                        )}
                      </div>
                      {session.speaker && (
                        <p className="text-xs text-gray-500">{session.speaker}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <span className="material-icons text-[12px]">location_on</span>
                        {session.location}
                      </p>
                    </div>
                    {session.track && (
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                        style={{ backgroundColor: `${session.trackColor}15`, color: session.trackColor }}
                      >
                        {session.track}
                      </span>
                    )}
                  </div>
                  {session.conflict && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <span className="material-icons text-xs">info</span>
                      Conflicts with "Design Systems Workshop" — Choose one
                    </p>
                  )}
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
