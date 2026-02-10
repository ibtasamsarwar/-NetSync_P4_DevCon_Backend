import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import { eventsAPI } from '../../api';
import toast from 'react-hot-toast';

export default function EventsList() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await eventsAPI.list({ limit: 50 });
      if (res.data?.events) {
        setEvents(res.data.events);
      }
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventsAPI.delete(id);
      toast.success('Event deleted');
      setEvents(events.filter((e) => e._id !== id));
    } catch {
      toast.error('Failed to delete event');
    }
  };

  const statusColor = (s) => ({ published: 'green', draft: 'gray', live: 'blue', completed: 'purple', cancelled: 'red' }[s] || 'gray');

  const filtered = events.filter((evt) => {
    const matchSearch = !search || evt.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || evt.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">All Events</h1>
            <p className="text-gray-500">{events.length} events total</p>
          </div>
          <Button onClick={() => navigate('/organizer/events/create')}>
            <span className="material-icons text-sm mr-1">add</span> Create Event
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-gray-400 text-lg">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'draft', 'published', 'live', 'completed'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                  statusFilter === s ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Events grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <span className="material-icons text-gray-300 text-5xl">event_busy</span>
            <p className="text-gray-500 mt-3">No events found</p>
            <Button className="mt-4" onClick={() => navigate('/organizer/events/create')}>Create Your First Event</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((evt) => (
              <Card key={evt._id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span className="material-icons-outlined text-primary">event</span>
                  </div>
                  <Badge color={statusColor(evt.status)}>{evt.status}</Badge>
                </div>
                <h3 className="font-bold text-charcoal mb-1">{evt.title}</h3>
                <p className="text-xs text-gray-500 mb-3">
                  {evt.start_date ? new Date(evt.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date'}
                </p>
                {evt.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{evt.description}</p>
                )}
                <div className="mb-3">
                  <ProgressBar
                    value={evt.max_attendees ? (evt.total_registrations / evt.max_attendees) * 100 : 0}
                    size="sm"
                    color="primary"
                  />
                  <span className="text-xs text-gray-400 mt-1">
                    {evt.total_registrations || 0}/{evt.max_attendees || '∞'} registrations
                  </span>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => toast('Edit coming soon!')}>Edit</Button>
                  <button onClick={() => handleDelete(evt._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors">
                    <span className="material-icons text-sm">delete</span>
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
