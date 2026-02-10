import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { sessionsAPI } from '../../api';
import { clsx } from 'clsx';

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
const ROOMS = [
  { name: 'Grand Ballroom', capacity: 500 },
  { name: 'Workshop Room A', capacity: 45 },
  { name: 'Main Stage South', capacity: 250 },
  { name: 'Demo Lounge', capacity: 120 },
];
const TRACKS = [
  { id: 'all', label: 'All Tracks', color: 'gray' },
  { id: 'engineering', label: 'Engineering', color: 'primary' },
  { id: 'design', label: 'Design', color: 'blue' },
  { id: 'product', label: 'Product', color: 'green' },
];
const DAYS = ['Oct 12', 'Oct 13', 'Oct 14'];

const SAMPLE_SESSIONS = [
  { id: 1, title: 'Opening Keynote', track: 'engineering', room: 0, startSlot: 0, duration: 2, speaker: 'Dr. Sarah Chen', conflict: null },
  { id: 2, title: 'Design Systems Workshop', track: 'design', room: 1, startSlot: 1, duration: 2, speaker: 'Maria Lopez', conflict: 'warning' },
  { id: 3, title: 'API Architecture', track: 'engineering', room: 2, startSlot: 2, duration: 1, speaker: 'James Park', conflict: null },
  { id: 4, title: 'Product Strategy', track: 'product', room: 3, startSlot: 3, duration: 2, speaker: 'Alex Kim', conflict: 'critical' },
];
const UNSCHEDULED = [
  { id: 5, title: 'Cloud Native Patterns', track: 'engineering', duration: '45m', speaker: 'R. Patel' },
  { id: 6, title: 'UX Research Methods', track: 'design', duration: '60m', speaker: 'L. Torres' },
  { id: 7, title: 'Growth Hacking Panel', track: 'product', duration: '90m', speaker: 'M. Zhang' },
  { id: 8, title: 'Lightning Talks', track: 'engineering', duration: '30m', speaker: 'Various' },
];

const trackColor = (track) => ({ engineering: '#f47b25', design: '#3b82f6', product: '#22c55e' }[track] || '#9ca3af');

export default function SessionScheduler() {
  const [activeDay, setActiveDay] = useState(0);
  const [activeTrack, setActiveTrack] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = SAMPLE_SESSIONS.filter(
    (s) => activeTrack === 'all' || s.track === activeTrack
  );

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">Session Scheduler</h1>
            <p className="text-sm text-gray-500">DevCon 2024 — Timeline View</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Day tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(i)}
                  className={clsx(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                    activeDay === i
                      ? 'bg-white text-charcoal shadow-sm'
                      : 'text-gray-500 hover:text-charcoal'
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
            <Button size="sm">
              <span className="material-icons text-sm mr-1">save</span>
              Save Changes
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Left sidebar - unscheduled sessions */}
          <div className="w-72 shrink-0 hidden lg:block space-y-4">
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
                    activeTrack === t.id
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Unscheduled bin */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Unscheduled ({UNSCHEDULED.length})
              </h3>
              <div className="space-y-2">
                {UNSCHEDULED.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 bg-white border-2 border-dashed border-gray-200 rounded-xl cursor-grab hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-icons text-gray-300 text-sm">drag_indicator</span>
                      <span className="text-sm font-medium text-charcoal">{s.title}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-6">
                      <span className="text-xs text-gray-400">{s.speaker}</span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-400">{s.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline grid */}
          <Card className="flex-1 overflow-x-auto p-0">
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
              {ROOMS.map((room, roomIdx) => (
                <div key={room.name} className="flex border-b border-gray-50 relative min-h-[80px]">
                  <div className="w-48 p-3 shrink-0 border-r border-gray-100 sticky left-0 bg-white z-5">
                    <p className="text-sm font-medium text-charcoal">{room.name}</p>
                    <p className="text-xs text-gray-400">Cap: {room.capacity}</p>
                  </div>
                  <div className="flex-1 relative">
                    {/* Session cards */}
                    {filtered
                      .filter((s) => s.room === roomIdx)
                      .map((session) => (
                        <div
                          key={session.id}
                          className={clsx(
                            'absolute top-2 bottom-2 rounded-lg p-2 cursor-pointer transition-shadow hover:shadow-md',
                            session.conflict === 'critical' && 'ring-2 ring-red-400',
                            session.conflict === 'warning' && 'ring-2 ring-amber-400'
                          )}
                          style={{
                            left: `${session.startSlot * 160}px`,
                            width: `${session.duration * 160 - 8}px`,
                            backgroundColor: `${trackColor(session.track)}15`,
                            borderLeft: `3px solid ${trackColor(session.track)}`,
                          }}
                        >
                          <p className="text-xs font-semibold text-charcoal truncate">{session.title}</p>
                          <p className="text-[10px] text-gray-500 truncate">{session.speaker}</p>
                          {session.conflict && (
                            <span className={clsx(
                              'material-icons text-xs mt-1',
                              session.conflict === 'critical' ? 'text-red-500' : 'text-amber-500'
                            )}>
                              {session.conflict === 'critical' ? 'error' : 'warning'}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-gray-500">1 Critical</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-gray-500">1 Warning</span>
                </div>
              </div>
              <span className="text-xs text-gray-400">View: 8 Hours</span>
            </div>
          </Card>
        </div>

        {/* FAB */}
        <button className="fixed bottom-16 right-8 w-14 h-14 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary-600 transition-colors">
          <span className="material-icons text-2xl">add</span>
        </button>
      </div>
    </DashboardLayout>
  );
}
