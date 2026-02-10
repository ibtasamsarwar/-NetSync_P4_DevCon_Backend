import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { clsx } from 'clsx';

const BADGE_FIELDS = [
  { id: 'name', label: 'Full Name', x: 50, y: 40, fontSize: 20, bold: true },
  { id: 'role', label: 'Role / Title', x: 50, y: 55, fontSize: 12, bold: false },
  { id: 'company', label: 'Company', x: 50, y: 65, fontSize: 11, bold: false },
  { id: 'qr', label: 'QR Code', x: 50, y: 82, fontSize: 10, bold: false },
];

const TEMPLATES = [
  { id: 'modern', name: 'Modern', color: '#f47b25' },
  { id: 'corporate', name: 'Corporate', color: '#3b82f6' },
  { id: 'creative', name: 'Creative', color: '#8b5cf6' },
  { id: 'minimal', name: 'Minimal', color: '#374151' },
];

export default function BadgeDesigner() {
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [orientation, setOrientation] = useState('portrait');
  const [fields, setFields] = useState(BADGE_FIELDS);
  const [badgeColor, setBadgeColor] = useState('#f47b25');

  const templateConfig = TEMPLATES.find((t) => t.id === selectedTemplate);
  const isPortrait = orientation === 'portrait';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">Badge Designer</h1>
            <p className="text-sm text-gray-500">Design and customize event badges</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <span className="material-icons text-sm mr-1">preview</span>
              Preview
            </Button>
            <Button size="sm">
              <span className="material-icons text-sm mr-1">save</span>
              Save Template
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel - controls */}
          <div className="lg:col-span-4 space-y-4">
            {/* Templates */}
            <Card className="p-4">
              <h3 className="text-sm font-bold text-charcoal mb-3">Templates</h3>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTemplate(t.id); setBadgeColor(t.color); }}
                    className={clsx(
                      'p-3 rounded-xl border-2 text-center transition-all',
                      selectedTemplate === t.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg mx-auto mb-2" style={{ backgroundColor: t.color }} />
                    <span className="text-xs font-medium text-charcoal">{t.name}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Orientation */}
            <Card className="p-4">
              <h3 className="text-sm font-bold text-charcoal mb-3">Orientation</h3>
              <div className="flex gap-2">
                {['portrait', 'landscape'].map((o) => (
                  <button
                    key={o}
                    onClick={() => setOrientation(o)}
                    className={clsx(
                      'flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all',
                      orientation === o ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </Card>

            {/* Fields */}
            <Card className="p-4">
              <h3 className="text-sm font-bold text-charcoal mb-3">Badge Fields</h3>
              <div className="space-y-2">
                {fields.map((field) => (
                  <div key={field.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-gray-400 text-sm cursor-grab">drag_indicator</span>
                      <span className="text-sm text-charcoal">{field.label}</span>
                    </div>
                    <button className="p-1 rounded hover:bg-gray-200 transition-colors">
                      <span className="material-icons text-gray-400 text-sm">settings</span>
                    </button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3">
                <span className="material-icons text-sm mr-1">add</span>
                Add Field
              </Button>
            </Card>

            {/* Colors */}
            <Card className="p-4">
              <h3 className="text-sm font-bold text-charcoal mb-3">Accent Color</h3>
              <div className="flex gap-2">
                {['#f47b25', '#3b82f6', '#22c55e', '#8b5cf6', '#ef4444', '#374151'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setBadgeColor(color)}
                    className={clsx(
                      'w-8 h-8 rounded-lg transition-transform',
                      badgeColor === color && 'ring-2 ring-offset-2 ring-primary scale-110'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* Center - Canvas */}
          <div className="lg:col-span-8">
            <Card className="p-8 flex items-center justify-center min-h-[600px] bg-[repeating-linear-gradient(0deg,transparent,transparent_19px,#f1f1f1_19px,#f1f1f1_20px),repeating-linear-gradient(90deg,transparent,transparent_19px,#f1f1f1_19px,#f1f1f1_20px)]">
              {/* Badge preview */}
              <div
                className={clsx(
                  'bg-white rounded-2xl shadow-2xl relative overflow-hidden transition-all',
                  isPortrait ? 'w-72 h-[420px]' : 'w-[420px] h-72'
                )}
              >
                {/* Top accent bar */}
                <div className="h-2 w-full" style={{ backgroundColor: badgeColor }} />

                {/* Logo area */}
                <div className="flex items-center justify-center gap-2 mt-6 mb-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: badgeColor }}>
                    <span className="text-white text-xs font-bold">N</span>
                  </div>
                  <span className="text-sm font-bold text-charcoal">NetSync</span>
                </div>

                {/* Badge content */}
                <div className="text-center px-6 mt-6">
                  {/* Avatar placeholder */}
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${badgeColor}20` }}>
                    <span className="material-icons text-2xl" style={{ color: badgeColor }}>person</span>
                  </div>

                  <h3 className="text-lg font-bold text-charcoal">John Doe</h3>
                  <p className="text-sm text-gray-500 mt-1">Senior Engineer</p>
                  <p className="text-xs text-gray-400 mt-0.5">Acme Corporation</p>

                  {/* Track badge */}
                  <div className="mt-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: badgeColor }}>
                      ENGINEERING
                    </span>
                  </div>

                  {/* QR placeholder */}
                  <div className="mt-6 mx-auto w-16 h-16 border-2 border-gray-200 rounded-lg flex items-center justify-center">
                    <span className="material-icons text-gray-300 text-2xl">qr_code_2</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 font-mono">NS-2024-0001</p>
                </div>

                {/* Bottom bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: badgeColor }} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
