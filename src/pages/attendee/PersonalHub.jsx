import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { sessionsAPI, networkingAPI, ticketsAPI, eventsAPI } from '../../api';
import toast from 'react-hot-toast';

const TIMELINE = [
  { time: '09:00 AM', title: 'Registration & Coffee', location: 'Lobby', status: 'completed', track: null },
  { time: '10:00 AM', title: 'Opening Keynote: The Future of AI', location: 'Grand Ballroom', speaker: 'Dr. Sarah Chen', status: 'completed', track: 'engineering' },
  { time: '11:30 AM', title: 'Networking Lunch', location: 'Garden Terrace', status: 'live', track: null },
  { time: '01:00 PM', title: 'Workshop: Building Scalable APIs', location: 'Workshop Room A', speaker: 'James Park', status: 'upcoming', track: 'engineering' },
  { time: '03:00 PM', title: 'Panel: Product-Led Growth', location: 'Main Stage', speaker: 'Multiple Speakers', status: 'upcoming', track: 'product' },
];

const AI_MATCHES = [
  { name: 'Emily Watson', role: 'ML Engineer @ Google', match: 98, online: true },
  { name: 'David Kim', role: 'CTO @ StartupX', match: 94, online: true },
  { name: 'Sofia Rodriguez', role: 'Product Manager @ Meta', match: 89, online: false },
];

export default function PersonalHub() {
  const { user } = useAuth();
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 12, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) return { hours: 0, minutes: 0, seconds: 0 };
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => n.toString().padStart(2, '0');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">
              Good morning, {user?.first_name || 'Alex'}!
            </h1>
            <p className="text-gray-500">Day 1 of DevCon 2024</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center text-xs font-bold text-primary">
                  {i}
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">124 people you know are here</span>
          </div>
        </div>

        {/* Next session banner */}
        <div className="bg-gradient-to-r from-primary to-orange-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <p className="text-sm text-white/80 mb-1">NEXT SESSION STARTS IN</p>
            <div className="flex gap-3 mb-4">
              {[
                { val: pad(countdown.hours), label: 'HRS' },
                { val: pad(countdown.minutes), label: 'MIN' },
                { val: pad(countdown.seconds), label: 'SEC' },
              ].map((c) => (
                <div key={c.label} className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 text-center">
                  <span className="text-2xl font-bold">{c.val}</span>
                  <p className="text-[10px] text-white/60">{c.label}</p>
                </div>
              ))}
            </div>
            <h3 className="text-xl font-bold mb-1">Workshop: Building Scalable APIs</h3>
            <div className="flex items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <span className="material-icons text-sm">location_on</span>
                Workshop Room A
              </span>
              <span className="flex items-center gap-1">
                <span className="material-icons text-sm">person</span>
                James Park
              </span>
            </div>
            <Button variant="secondary" size="sm" className="mt-4 bg-white/20 hover:bg-white/30 text-white border-none">
              <span className="material-icons text-sm mr-1">directions</span>
              Get Directions
            </Button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Matches & Saved */}
          <div className="lg:col-span-4 space-y-6">
            {/* AI Matches */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-charcoal flex items-center gap-2">
                  <span className="material-icons text-primary text-lg">auto_awesome</span>
                  AI Matches
                </h3>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              <div className="space-y-3">
                {AI_MATCHES.map((match) => (
                  <div key={match.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="relative">
                      <Avatar name={match.name} size="sm" />
                      {match.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal truncate">{match.name}</p>
                      <p className="text-xs text-gray-500 truncate">{match.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge color="primary">{match.match}%</Badge>
                      <button className="p-1 rounded-lg hover:bg-primary/10 transition-colors">
                        <span className="material-icons text-primary text-lg">person_add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Saved Items */}
            <Card className="p-5">
              <h3 className="font-bold text-charcoal mb-4">Saved Items</h3>
              <div className="space-y-2">
                {['ML Workshop Notes', 'Speaker Contact List'].map((item) => (
                  <div key={item} className="flex items-center gap-3 p-3 border border-dashed border-gray-200 rounded-xl">
                    <span className="material-icons text-gray-400 text-lg">bookmark</span>
                    <span className="text-sm text-charcoal">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right column - Timeline */}
          <div className="lg:col-span-8">
            <Card className="p-5">
              <h3 className="font-bold text-charcoal mb-6">Today's Agenda</h3>
              <div className="space-y-0">
                {TIMELINE.map((item, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${
                        item.status === 'completed' ? 'bg-green-500' :
                        item.status === 'live' ? 'bg-primary' :
                        'bg-gray-300'
                      }`}>
                        {item.status === 'completed' && (
                          <span className="material-icons text-white text-[10px] flex items-center justify-center w-3 h-3">check</span>
                        )}
                      </div>
                      {idx < TIMELINE.length - 1 && (
                        <div className={`w-px flex-1 min-h-[60px] ${
                          item.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`flex-1 pb-6 ${
                      item.status === 'live' ? 'border-2 border-primary rounded-xl p-4 -mt-2 mb-4' : ''
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-400">{item.time}</span>
                        {item.status === 'live' && (
                          <Badge color="red">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse mr-1" />
                            LIVE
                          </Badge>
                        )}
                      </div>
                      <h4 className={`text-sm font-semibold ${
                        item.status === 'completed' ? 'text-gray-400 line-through' : 'text-charcoal'
                      }`}>
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.location}
                        {item.speaker && ` • ${item.speaker}`}
                      </p>
                      {item.status === 'live' && (
                        <Button size="sm" className="mt-3">Join Session</Button>
                      )}
                      {item.status === 'upcoming' && (
                        <button className="mt-2 text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                          <span className="material-icons text-xs">notification_add</span>
                          Add Reminder
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Floating QR button */}
        <button className="fixed bottom-8 right-8 bg-primary text-white px-5 py-3 rounded-2xl shadow-lg shadow-primary/30 flex items-center gap-2 hover:bg-primary-600 transition-colors">
          <span className="material-icons">qr_code</span>
          <span className="text-sm font-semibold">My QR Ticket</span>
        </button>
      </div>
    </DashboardLayout>
  );
}
