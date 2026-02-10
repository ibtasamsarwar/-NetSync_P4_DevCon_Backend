import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import KPICard from '../../components/common/KPICard';
import StatusIndicator from '../../components/common/StatusIndicator';
import { adminAPI } from '../../api';

const ALERTS = [
  { type: 'Critical', message: 'Database CPU spike detected: 94% utilization', time: '2m ago', color: 'red', borderColor: 'border-l-red-500' },
  { type: 'Warning', message: 'Stripe webhook timeout: 3 consecutive failures', time: '12m ago', color: 'yellow', borderColor: 'border-l-amber-500' },
  { type: 'Info', message: 'New Admin Provisioned: Sarah Johnson', time: '1h ago', color: 'blue', borderColor: 'border-l-blue-500' },
];

const ORGS = [
  { name: 'Vertex Media', tier: 'Enterprise', date: 'Jan 15, 2024', status: 'Active' },
  { name: 'Nexus Global', tier: 'Professional', date: 'Jan 14, 2024', status: 'Pending' },
  { name: 'Quantum Events', tier: 'Enterprise', date: 'Jan 13, 2024', status: 'Active' },
];

export default function SuperAdminDashboard() {
  const [timeRange, setTimeRange] = useState('24H');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">Global Command Center</h1>
            <p className="text-sm text-gray-500">Platform-wide oversight and control</p>
          </div>
          <Button>
            <span className="material-icons text-sm mr-1">add</span>
            New Organization
          </Button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="p-5 border-t-4 border-t-primary">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Active Events</span>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="material-icons text-primary">event</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-charcoal">1,482</p>
            <p className="text-xs text-green-600 font-medium mt-1">+12% from last month</p>
          </Card>
          <Card className="p-5 border-t-4 border-t-blue-500">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Platform Users</span>
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <span className="material-icons text-blue-500">people</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-charcoal">245,091</p>
            <p className="text-xs text-blue-600 font-medium mt-1">8.2k new this month</p>
          </Card>
          <Card className="p-5 border-t-4 border-t-emerald-500">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Total Revenue</span>
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <span className="material-icons text-emerald-500">payments</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-charcoal">$4.2M</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">+5.4% from last month</p>
          </Card>
          <Card className="p-5 border-t-4 border-t-amber-500">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">System Health</span>
              <StatusIndicator status="online" pulse />
            </div>
            <p className="text-3xl font-bold text-charcoal">99.98%</p>
            <p className="text-xs text-amber-600 font-medium mt-1">Optimal Performance</p>
          </Card>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Performance */}
          <Card className="lg:col-span-2 p-5">
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <div className="flex gap-1">
                {['1H', '24H', '7D'].map((r) => (
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
            <div className="h-48 mt-4">
              <svg viewBox="0 0 800 200" className="w-full h-full">
                <defs>
                  <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 160 Q80 140 160 120 T320 80 T480 100 T640 60 L800 40 V200 H0Z" fill="url(#perfGrad)" />
                <path d="M0 160 Q80 140 160 120 T320 80 T480 100 T640 60 L800 40" fill="none" stroke="#3b82f6" strokeWidth="2" />
                {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'].map((t, i) => (
                  <text key={t} x={i * 160} y="195" className="text-[11px] fill-gray-400">{t}</text>
                ))}
              </svg>
            </div>
          </Card>

          {/* Activity map */}
          <Card className="p-5">
            <CardTitle>Platform Activity</CardTitle>
            <div className="mt-4 space-y-4">
              <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                <span className="material-icons text-gray-300 text-4xl">public</span>
                {/* Pulsing dots */}
                <div className="absolute top-8 left-12 w-2 h-2 bg-primary rounded-full animate-ping" />
                <div className="absolute top-14 right-16 w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                <div className="absolute bottom-10 left-20 w-2 h-2 bg-green-500 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
              </div>
              <div className="space-y-2">
                {[
                  { region: 'North America', pct: 42 },
                  { region: 'Europe', pct: 28 },
                  { region: 'Asia Pacific', pct: 20 },
                ].map((r) => (
                  <div key={r.region} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{r.region}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${r.pct}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-500">{r.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Organizations table */}
          <Card className="lg:col-span-2 p-5">
            <CardHeader>
              <CardTitle>Recent Organization Signups</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </CardHeader>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase">Organization</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase">Tier</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase">Signup Date</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ORGS.map((org) => (
                    <tr key={org.name} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-3 font-medium text-charcoal">{org.name}</td>
                      <td className="py-3 px-3">
                        <Badge color={org.tier === 'Enterprise' ? 'primary' : 'blue'}>{org.tier}</Badge>
                      </td>
                      <td className="py-3 px-3 text-gray-500">{org.date}</td>
                      <td className="py-3 px-3">
                        <Badge color={org.status === 'Active' ? 'green' : 'yellow'}>{org.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* System alerts */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <CardTitle>System Alerts</CardTitle>
              <Badge color="red">3</Badge>
            </div>
            <div className="space-y-3">
              {ALERTS.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border-l-4 ${alert.borderColor} bg-gray-50`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge color={alert.color}>{alert.type}</Badge>
                    <span className="text-[10px] text-gray-400">{alert.time}</span>
                  </div>
                  <p className="text-xs text-gray-600">{alert.message}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
