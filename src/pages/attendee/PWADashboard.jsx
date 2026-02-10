import { useState } from 'react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';

const SCHEDULE = [
  { time: '14:30', title: 'Design Systems Deep Dive', type: 'Workshop', typeColor: 'blue', speaker: 'Maria Lopez', location: 'Room 204' },
  { time: '16:00', title: 'Closing Keynote', type: 'Keynote', typeColor: 'green', speaker: 'Dr. Sarah Chen', location: 'Main Stage' },
  { time: '17:30', title: 'Networking Social', type: 'Social', typeColor: 'purple', speaker: '', location: 'Rooftop Lounge' },
];

export default function PWADashboard() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="max-w-[450px] w-full mx-auto shadow-2xl rounded-3xl overflow-hidden bg-white min-h-[800px] flex flex-col">
        {/* Offline banner */}
        <div className="bg-primary/10 px-4 py-2 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-xs text-primary font-medium">Offline Mode Active — Local Syncing</span>
        </div>

        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">NETSYNC EVENT</p>
            <h1 className="text-lg font-bold text-charcoal">Hello, Alex!</h1>
          </div>
          <div className="relative">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="material-icons text-primary">person</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
        </div>

        {/* QR Pass */}
        <div className="mx-5 bg-primary rounded-2xl p-5 text-white text-center">
          <p className="text-xs text-white/70 mb-3 uppercase tracking-wider">EVENT ENTRY PASS</p>
          <div className="bg-white rounded-xl p-4 mx-auto w-40 h-40 flex items-center justify-center mb-3">
            <span className="material-icons text-charcoal text-7xl">qr_code_2</span>
          </div>
          <p className="font-mono text-sm tracking-widest">NS-2024-8849-X</p>
          <button className="mt-3 text-xs text-white/70 flex items-center justify-center gap-1 mx-auto hover:text-white">
            <span className="material-icons text-xs">fullscreen</span>
            Tap to Enlarge
          </button>
        </div>

        {/* Live Now */}
        <div className="px-5 pt-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <h2 className="text-sm font-bold text-charcoal">Live Now</h2>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="material-icons text-primary text-xl">mic</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-charcoal">AI in Healthcare Panel</p>
                <p className="text-xs text-gray-500">Dr. James Lee • Main Stage</p>
              </div>
            </div>
            <ProgressBar value={65} size="sm" color="primary" />
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="flex-1 text-xs">Join Chat</Button>
              <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <span className="material-icons text-gray-400 text-lg">share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Next on schedule */}
        <div className="px-5 pt-5 flex-1">
          <h2 className="text-sm font-bold text-charcoal mb-3">Next on Schedule</h2>
          <div className="space-y-0">
            {SCHEDULE.map((item, idx) => (
              <div key={idx} className="flex gap-3 relative">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-semibold text-gray-400">{item.time}</span>
                  {idx < SCHEDULE.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="bg-white border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge color={item.typeColor} className="text-[10px]">{item.type}</Badge>
                    </div>
                    <p className="text-sm font-medium text-charcoal">{item.title}</p>
                    {item.speaker && <p className="text-xs text-gray-500">{item.speaker}</p>}
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <span className="material-icons text-[12px]">location_on</span>
                      {item.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="glass border-t border-gray-100 flex items-center justify-around px-4 py-2 relative">
          {[
            { icon: 'home', label: 'Home', active: true },
            { icon: 'calendar_today', label: 'Schedule' },
            { icon: 'qr_code_scanner', label: 'Scan', fab: true },
            { icon: 'people', label: 'Network' },
            { icon: 'person', label: 'Profile' },
          ].map((tab) =>
            tab.fab ? (
              <button
                key={tab.label}
                className="w-14 h-14 bg-primary rounded-full flex items-center justify-center -mt-12 border-4 border-white shadow-lg shadow-primary/30"
              >
                <span className="material-icons text-white text-2xl">{tab.icon}</span>
              </button>
            ) : (
              <button
                key={tab.label}
                className={`flex flex-col items-center gap-0.5 py-1 ${
                  tab.active ? 'text-primary' : 'text-gray-400'
                }`}
              >
                <span className="material-icons text-xl">{tab.icon}</span>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
