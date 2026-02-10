import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { sessionsAPI, eventsAPI } from '../../api';
import toast from 'react-hot-toast';

const TRACK_COLORS = {
  engineering: '#f47b25',
  design: '#3b82f6',
  product: '#22c55e',
  marketing: '#8b5cf6',
  general: '#9ca3af',
};

export default function PersonalizedAgenda() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRecommended, setShowRecommended] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const evRes = await eventsAPI.list({ limit: 10 });
      const events = evRes.data.events || [];
      const allSessions = [];
      for (const event of events) {
        try {
          const sesRes = await sessionsAPI.list(event._id);
          const eventSessions = (sesRes.data.sessions || []).map((s) => ({
            ...s,
            event_title: event.title,
            time: s.start_time ? new Date(s.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
            sortTime: s.start_time ? new Date(s.start_time).getTime() : 0,
            trackColor: TRACK_COLORS[s.track] || TRACK_COLORS.general,
          }));
          allSessions.push(...eventSessions);
        } catch {}
      }
      allSessions.sort((a, b) => a.sortTime - b.sortTime);
      setSessions(allSessions);
    } catch {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const displayed = showRecommended ? sessions.filter((s) => s.is_recommended) : sessions;

  const handleExport = () => {
    if (displayed.length === 0) {
      toast.error('No sessions to export');
      return;
    }
    const icsLines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//NetSync//Agenda//EN', 'CALSCALE:GREGORIAN',
    ];
    displayed.forEach((session) => {
      const start = session.start_time ? new Date(session.start_time) : null;
      const end = session.end_time ? new Date(session.end_time) : null;
      if (!start) return;
      const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      icsLines.push('BEGIN:VEVENT', `DTSTART:${fmt(start)}`);
      if (end) icsLines.push(`DTEND:${fmt(end)}`);
      icsLines.push(`SUMMARY:${session.title || 'Session'}`);
      if (session.speaker) icsLines.push(`DESCRIPTION:Speaker: ${session.speaker}`);
      if (session.location || session.room) icsLines.push(`LOCATION:${session.location || session.room}`);
      icsLines.push('END:VEVENT');
    });
    icsLines.push('END:VCALENDAR');
    const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'netsync_agenda.ics';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Agenda exported as calendar file!');
  };

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
            <p className="text-sm text-gray-500">Your curated schedule across all events</p>
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
            <Button variant="outline" size="sm" onClick={handleExport}>
              <span className="material-icons text-sm mr-1">download</span>
              Export
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="material-icons text-primary text-4xl animate-spin">refresh</span>
          </div>
        ) : displayed.length === 0 ? (
          <Card className="p-12 text-center">
            <span className="material-icons text-gray-300 text-5xl mb-3">event_busy</span>
            <p className="text-gray-500">No sessions found. Events with sessions will appear here.</p>
          </Card>
        ) : (
        <div className="space-y-0">
          {displayed.map((session, idx) => (
            <div key={session._id || idx} className="flex gap-4 relative">
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
              <div className="flex-1 pb-6">
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-charcoal">{session.title}</h3>
                        {session.is_recommended && (
                          <Badge color="primary" className="text-[10px]">
                            <span className="material-icons text-[10px] mr-0.5">star</span>
                            AI Pick
                          </Badge>
                        )}
                      </div>
                      {session.speaker && (
                        <p className="text-xs text-gray-500">{session.speaker}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <span className="material-icons text-[12px]">location_on</span>
                        {session.location || session.room || 'TBD'}
                      </p>
                      {session.event_title && (
                        <p className="text-[10px] text-primary/70 mt-1 flex items-center gap-1">
                          <span className="material-icons text-[10px]">event</span>
                          {session.event_title}
                        </p>
                      )}
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
                </Card>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </DashboardLayout>
  );
}
