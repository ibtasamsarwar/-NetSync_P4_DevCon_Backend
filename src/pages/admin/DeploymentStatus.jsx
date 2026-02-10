import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card, { CardTitle } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import StatusIndicator from '../../components/common/StatusIndicator';
import ProgressBar from '../../components/common/ProgressBar';

const SERVICES = [
  { name: 'API Gateway', status: 'online', uptime: '99.99%', latency: '12ms', version: 'v3.2.1' },
  { name: 'MongoDB Atlas', status: 'online', uptime: '99.97%', latency: '8ms', version: 'v7.0' },
  { name: 'Redis Cache', status: 'online', uptime: '99.99%', latency: '2ms', version: 'v7.2' },
  { name: 'WebSocket Server', status: 'online', uptime: '99.95%', latency: '15ms', version: 'v2.1' },
  { name: 'Email Service', status: 'warning', uptime: '99.80%', latency: '340ms', version: 'v1.4' },
  { name: 'S3 Storage', status: 'online', uptime: '99.99%', latency: '45ms', version: 'n/a' },
  { name: 'OpenAI Integration', status: 'online', uptime: '99.90%', latency: '890ms', version: 'GPT-4' },
  { name: 'Stripe Payments', status: 'warning', uptime: '99.85%', latency: '220ms', version: 'v2024-01' },
];

const DEPLOYMENTS = [
  { env: 'Production', branch: 'main', commit: 'a8f3c2d', time: '2h ago', status: 'success' },
  { env: 'Staging', branch: 'develop', commit: 'b7e1d4f', time: '45m ago', status: 'success' },
  { env: 'Preview', branch: 'feat/ai-matching', commit: 'c9a2e5b', time: '15m ago', status: 'building' },
];

export default function DeploymentStatus() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">Admin & Deployment Status</h1>
            <p className="text-sm text-gray-500">Infrastructure health and deployments</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl">
            <StatusIndicator status="online" pulse />
            <span className="text-sm font-semibold text-green-700">All Systems Operational</span>
          </div>
        </div>

        {/* Services grid */}
        <div>
          <CardTitle className="mb-4">Service Health</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICES.map((svc) => (
              <Card key={svc.name} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-charcoal">{svc.name}</span>
                  <StatusIndicator
                    status={svc.status}
                    pulse={svc.status === 'online'}
                  />
                </div>
                <div className="space-y-1.5 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Uptime</span>
                    <span className="font-medium text-charcoal">{svc.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Latency</span>
                    <span className="font-medium text-charcoal">{svc.latency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Version</span>
                    <span className="font-mono text-charcoal">{svc.version}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Deployments */}
        <Card className="p-5">
          <CardTitle className="mb-4">Recent Deployments</CardTitle>
          <div className="space-y-3">
            {DEPLOYMENTS.map((dep) => (
              <div key={dep.env} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    dep.status === 'success' ? 'bg-green-500' :
                    dep.status === 'building' ? 'bg-amber-500 animate-pulse' :
                    'bg-red-500'
                  }`} />
                  <div>
                    <p className="text-sm font-semibold text-charcoal">{dep.env}</p>
                    <p className="text-xs text-gray-500">
                      <span className="font-mono">{dep.branch}</span> •{' '}
                      <span className="font-mono">{dep.commit}</span> •{' '}
                      {dep.time}
                    </p>
                  </div>
                </div>
                <Badge color={dep.status === 'success' ? 'green' : dep.status === 'building' ? 'yellow' : 'red'}>
                  {dep.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* System metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'CPU Usage', value: 42, color: 'primary' },
            { label: 'Memory Usage', value: 68, color: 'blue' },
            { label: 'Disk Usage', value: 31, color: 'green' },
          ].map((m) => (
            <Card key={m.label} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">{m.label}</span>
                <span className="text-lg font-bold text-charcoal">{m.value}%</span>
              </div>
              <ProgressBar value={m.value} color={m.color} />
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
