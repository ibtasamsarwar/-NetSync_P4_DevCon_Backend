import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import KPICard from '../../components/common/KPICard';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import { analyticsAPI, eventsAPI } from '../../api';

const CHART_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];

export default function AnalyticsDashboard() {
  const [kpis, setKpis] = useState({
    total_events: 24, registrations: 12450, revenue: 45200, attendance_rate: 88,
  });
  const [events, setEvents] = useState([
    { name: 'DevCon 2024', status: 'active', date: '2024-03-15', registrations: 2841, capacity: 3000, image: '' },
    { name: 'AI Summit', status: 'draft', date: '2024-04-22', registrations: 0, capacity: 500, image: '' },
    { name: 'Startup Mixer', status: 'completed', date: '2024-02-10', registrations: 189, capacity: 200, image: '' },
  ]);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    analyticsAPI.organizerOverview().then((res) => {
      if (res.data) setKpis(res.data);
    }).catch(() => {});
    eventsAPI.list({ limit: 5 }).then((res) => {
      if (res.data?.events?.length) setEvents(res.data.events);
    }).catch(() => {});
  }, []);

  const statusColor = (s) => ({ active: 'green', draft: 'gray', completed: 'blue' }[s] || 'gray');

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Analytics Dashboard</h1>
          <p className="text-gray-500">Overview of your event performance</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <KPICard title="Total Events" value={kpis.total_events} icon="event" trend={12} />
          <KPICard title="Registrations" value={kpis.registrations?.toLocaleString()} icon="how_to_reg" trend={18.2} />
          <KPICard title="Revenue" value={`$${(kpis.revenue / 1000).toFixed(1)}k`} icon="payments" trend={5.4} />
          <KPICard title="Attendance Rate" value={`${kpis.attendance_rate}%`} icon="groups" trend={2.1} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registration Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Registration Trends</CardTitle>
              <div className="flex gap-2">
                {['7d', '30d', '90d'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                      timeRange === r ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </CardHeader>
            <div className="h-48 relative mt-4">
              <svg viewBox="0 0 700 200" className="w-full h-full">
                <defs>
                  <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f47b25" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f47b25" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 150 Q100 120 200 100 T400 80 T600 60 L700 50 V200 H0Z" fill="url(#regGrad)" />
                <path d="M0 150 Q100 120 200 100 T400 80 T600 60 L700 50" fill="none" stroke="#f47b25" strokeWidth="2.5" />
                {CHART_DAYS.map((day, i) => (
                  <text key={day} x={i * 100 + 50} y="195" textAnchor="middle" className="text-[11px] fill-gray-400">{day}</text>
                ))}
              </svg>
            </div>
          </Card>

          {/* Ticket Sales */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Sales by Type</CardTitle>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-primary" />
                  <span className="text-gray-500">Standard</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-primary/40" />
                  <span className="text-gray-500">VIP</span>
                </div>
              </div>
            </CardHeader>
            <div className="h-48 flex items-end justify-between gap-4 mt-4 px-4">
              {MONTHS.map((month, i) => {
                const h1 = [60, 80, 70, 90, 75][i];
                const h2 = [30, 40, 35, 50, 40][i];
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col gap-1">
                      <div className="bg-primary rounded-t" style={{ height: `${h1}px` }} />
                      <div className="bg-primary/40 rounded-b" style={{ height: `${h2}px` }} />
                    </div>
                    <span className="text-xs text-gray-400 mt-2">{month}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Events table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <Button variant="outline" size="sm">View All</Button>
          </CardHeader>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Event Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Registrations</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((evt, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="material-icons-outlined text-primary text-lg">event</span>
                        </div>
                        <span className="font-medium text-charcoal">{evt.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge color={statusColor(evt.status)}>{evt.status}</Badge>
                    </td>
                    <td className="py-4 px-4 text-gray-500">{evt.date}</td>
                    <td className="py-4 px-4">
                      <div className="w-32">
                        <ProgressBar
                          value={evt.capacity ? (evt.registrations / evt.capacity) * 100 : 0}
                          size="sm"
                          color="primary"
                        />
                        <span className="text-xs text-gray-400 mt-1">
                          {evt.registrations}/{evt.capacity}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="material-icons-outlined text-gray-400 text-lg">more_horiz</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
