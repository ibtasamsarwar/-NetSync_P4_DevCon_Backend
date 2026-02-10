import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import KPICard from '../../components/common/KPICard';
import Avatar from '../../components/common/Avatar';

const DUTY_TIMELINE = [
  { time: '07:00 AM', title: 'Pre-Event Equipment Check', status: 'completed' },
  { time: '08:30 AM', title: 'Registration Desk Setup', status: 'completed' },
  { time: '09:00 AM', title: 'Door Management & Check-in', status: 'current' },
  { time: '12:00 PM', title: 'Lunch Break & Handover', status: 'upcoming' },
  { time: '01:30 PM', title: 'Afternoon Session Support', status: 'upcoming' },
];

const SUPPORT_REQUESTS = [
  { id: 1, type: 'CRITICAL', title: 'Badge Printing Failure', location: 'Registration Desk', time: '2m ago', color: 'red' },
  { id: 2, type: 'GENERAL', title: 'Accessibility Assistance', location: 'Hall B, Row 12', time: '5m ago', color: 'blue' },
  { id: 3, type: 'INFORMATION', title: 'Lost & Found Inquiry', location: 'Info Desk', time: '8m ago', color: 'gray' },
  { id: 4, type: 'HANDLED', title: 'AV Equipment Reset', location: 'Main Stage', time: '15m ago', color: 'green' },
];

export default function StaffDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with system status */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">Staff Operations</h1>
            <p className="text-sm text-gray-500">DevCon 2024 — Marcus Chen, Zone Lead - Hall B</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs font-bold text-green-700 uppercase">SYSTEM LIVE</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Checked-in</span>
              <span className="material-icons-outlined text-primary text-xl">how_to_reg</span>
            </div>
            <p className="text-2xl font-bold text-charcoal">1,248</p>
            <ProgressBar value={49.6} size="sm" color="primary" className="mt-2" />
          </Card>
          <KPICard title="Total Expected" value="2,500" icon="groups" />
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Active Support</span>
              <Badge color="red">URGENT</Badge>
            </div>
            <p className="text-2xl font-bold text-charcoal">08</p>
            <p className="text-xs text-gray-400 mt-1">Avg response: 2.4m</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Arrival Rate</span>
              <span className="material-icons-outlined text-primary text-xl">trending_up</span>
            </div>
            <p className="text-2xl font-bold text-charcoal">49.6%</p>
            <div className="flex gap-0.5 mt-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`h-2 flex-1 rounded-full ${i < 5 ? 'bg-primary' : 'bg-gray-200'}`} />
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left - QR Scanner & Duties */}
          <div className="lg:col-span-8 space-y-6">
            {/* QR Scanner */}
            <Card className="bg-gray-900 text-white p-8 text-center">
              <span className="material-icons text-6xl text-primary mb-4">qr_code_scanner</span>
              <h3 className="text-xl font-bold mb-2">Scan Attendee Badge</h3>
              <p className="text-gray-400 text-sm mb-4">Point camera at QR code or use manual entry</p>
              <div className="flex gap-3 justify-center">
                <Button size="sm" className="bg-primary/20 hover:bg-primary/30 border-none">
                  <span className="material-icons text-sm mr-1">keyboard</span>
                  Manual ID
                </Button>
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <span className="material-icons text-sm mr-1">person_add</span>
                  Guest Invitation
                </Button>
              </div>
            </Card>

            {/* Duty Timeline */}
            <Card className="p-5">
              <h3 className="font-bold text-charcoal mb-4">Daily Duty Agenda</h3>
              <div className="space-y-0">
                {DUTY_TIMELINE.map((item, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center ${
                        item.status === 'completed' ? 'bg-green-500' :
                        item.status === 'current' ? 'bg-primary ring-4 ring-primary/20' :
                        'bg-gray-200'
                      }`}>
                        {item.status === 'completed' && (
                          <span className="material-icons text-white text-[10px]">check</span>
                        )}
                        {item.status === 'current' && (
                          <span className="material-icons text-white text-[10px]">play_arrow</span>
                        )}
                      </div>
                      {idx < DUTY_TIMELINE.length - 1 && (
                        <div className={`w-px flex-1 min-h-[40px] ${
                          item.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                    <div className={`flex-1 pb-4 -mt-0.5 ${
                      item.status === 'current' ? 'bg-primary/5 rounded-xl p-3 border border-primary/20' : ''
                    }`}>
                      <span className="text-xs font-medium text-gray-400">{item.time}</span>
                      <p className={`text-sm font-medium ${
                        item.status === 'completed' ? 'text-gray-400' : 'text-charcoal'
                      }`}>
                        {item.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right - Support Requests */}
          <div className="lg:col-span-4">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-charcoal">Support Requests</h3>
                <Badge color="red">8</Badge>
              </div>
              <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin">
                {SUPPORT_REQUESTS.map((req) => (
                  <div
                    key={req.id}
                    className={`p-4 rounded-xl border ${
                      req.type === 'HANDLED' ? 'opacity-50 border-gray-100' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge color={req.color}>{req.type}</Badge>
                      <span className="text-[10px] text-gray-400">{req.time}</span>
                    </div>
                    <p className="text-sm font-medium text-charcoal mb-1">{req.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="material-icons text-[12px]">location_on</span>
                      {req.location}
                    </p>
                    {req.type !== 'HANDLED' && (
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1 text-xs py-1.5">
                          {req.type === 'CRITICAL' ? 'Acknowledge' : 'Claim'}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Floating buttons */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-3">
          <button className="w-12 h-12 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-500/30 flex items-center justify-center hover:bg-red-600 transition-colors">
            <span className="material-icons">priority_high</span>
          </button>
          <button className="w-12 h-12 bg-charcoal text-white rounded-2xl shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors">
            <span className="material-icons">headset_mic</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
