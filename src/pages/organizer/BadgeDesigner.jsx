import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { badgesAPI } from '../../api';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const DEFAULT_FIELDS = [
  { id: 'name', type: 'text', label: 'Full Name', fontSize: 20, bold: true },
  { id: 'role', type: 'text', label: 'Role / Title', fontSize: 12, bold: false },
  { id: 'company', type: 'text', label: 'Company', fontSize: 11, bold: false },
  { id: 'qr', type: 'qr', label: 'QR Code', fontSize: 10, bold: false },
];

const TEMPLATES = [
  { id: 'modern', name: 'Modern', color: '#f47b25' },
  { id: 'corporate', name: 'Corporate', color: '#3b82f6' },
  { id: 'creative', name: 'Creative', color: '#8b5cf6' },
  { id: 'minimal', name: 'Minimal', color: '#374151' },
];

const FIELD_TYPES = [
  { value: 'text', label: 'Text Field' },
  { value: 'qr', label: 'QR Code' },
  { value: 'image', label: 'Image / Logo' },
  { value: 'barcode', label: 'Barcode' },
];

const SAMPLE_DATA = {
  name: 'John Doe',
  role: 'Senior Engineer',
  company: 'Acme Corporation',
  track: 'ENGINEERING',
  code: 'NS-2024-0001',
};

export default function BadgeDesigner() {
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [orientation, setOrientation] = useState('portrait');
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [badgeColor, setBadgeColor] = useState('#f47b25');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [showAddField, setShowAddField] = useState(false);
  const [newField, setNewField] = useState({ label: '', type: 'text', fontSize: 14, bold: false });
  const [badgeName, setBadgeName] = useState('My Badge Template');

  const isPortrait = orientation === 'portrait';

  const handleAddField = () => {
    if (!newField.label.trim()) { toast.error('Field label is required'); return; }
    setFields([...fields, {
      id: `field_${Date.now()}`,
      type: newField.type,
      label: newField.label,
      fontSize: newField.fontSize,
      bold: newField.bold,
    }]);
    setNewField({ label: '', type: 'text', fontSize: 14, bold: false });
    setShowAddField(false);
    toast.success('Field added!');
  };

  const handleRemoveField = (fieldId) => {
    setFields(fields.filter((f) => f.id !== fieldId));
    if (editingField === fieldId) setEditingField(null);
    toast.success('Field removed');
  };

  const handleFieldUpdate = (fieldId, key, value) => {
    setFields(fields.map((f) => (f.id === fieldId ? { ...f, [key]: value } : f)));
  };

  const moveField = (index, direction) => {
    const arr = [...fields];
    const target = index + direction;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    setFields(arr);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await badgesAPI.create({
        event_id: 'default',
        name: badgeName,
        orientation: isPortrait ? 'vertical' : 'horizontal',
        accent_color: badgeColor,
        fields: fields.map((f) => ({
          id: f.id, type: f.type, label: f.label,
          x: 0, y: 0, width: 100, height: 30,
          font_size: f.fontSize, font_weight: f.bold ? 'bold' : 'normal',
          color: '#000000', alignment: 'center',
        })),
        style: { template: selectedTemplate, badgeColor },
      });
      toast.success('Badge template saved!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const BadgeCanvas = () => (
    <div className={clsx(
      'bg-white rounded-2xl shadow-2xl relative overflow-hidden transition-all',
      isPortrait ? 'w-72 h-[420px]' : 'w-[420px] h-72'
    )}>
      <div className="h-2 w-full" style={{ backgroundColor: badgeColor }} />
      <div className="flex items-center justify-center gap-2 mt-6 mb-2">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: badgeColor }}>
          <span className="text-white text-xs font-bold">N</span>
        </div>
        <span className="text-sm font-bold text-charcoal">NetSync</span>
      </div>
      <div className="text-center px-6 mt-6">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${badgeColor}20` }}>
          <span className="material-icons text-2xl" style={{ color: badgeColor }}>person</span>
        </div>
        {fields.map((field) => {
          if (field.type === 'qr') {
            return (
              <div key={field.id} className="mt-4 mx-auto w-16 h-16 border-2 border-gray-200 rounded-lg flex items-center justify-center">
                <span className="material-icons text-gray-300 text-2xl">qr_code_2</span>
              </div>
            );
          }
          return (
            <p key={field.id} className={clsx('text-charcoal', field.bold && 'font-bold')}
              style={{ fontSize: `${field.fontSize}px`, marginTop: '4px' }}>
              {SAMPLE_DATA[field.id] || field.label}
            </p>
          );
        })}
        <div className="mt-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: badgeColor }}>
            {SAMPLE_DATA.track}
          </span>
        </div>
        <p className="text-[10px] text-gray-400 mt-3 font-mono">{SAMPLE_DATA.code}</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: badgeColor }} />
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">Badge Designer</h1>
            <p className="text-sm text-gray-500">Design and customize event badges</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
              <span className="material-icons text-sm mr-1">preview</span> Preview
            </Button>
            <Button size="sm" onClick={handleSave} loading={saving}>
              <span className="material-icons text-sm mr-1">save</span> Save Template
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-4">
              <h3 className="text-sm font-bold text-charcoal mb-3">Badge Name</h3>
              <Input value={badgeName} onChange={(e) => setBadgeName(e.target.value)} placeholder="Template name" />
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-bold text-charcoal mb-3">Templates</h3>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map((t) => (
                  <button key={t.id} onClick={() => { setSelectedTemplate(t.id); setBadgeColor(t.color); }}
                    className={clsx('p-3 rounded-xl border-2 text-center transition-all',
                      selectedTemplate === t.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300')}>
                    <div className="w-8 h-8 rounded-lg mx-auto mb-2" style={{ backgroundColor: t.color }} />
                    <span className="text-xs font-medium text-charcoal">{t.name}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-bold text-charcoal mb-3">Orientation</h3>
              <div className="flex gap-2">
                {['portrait', 'landscape'].map((o) => (
                  <button key={o} onClick={() => setOrientation(o)}
                    className={clsx('flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all',
                      orientation === o ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600')}>
                    {o}
                  </button>
                ))}
              </div>
            </Card>

            {/* Fields */}
            <Card className="p-4">
              <h3 className="text-sm font-bold text-charcoal mb-3">Badge Fields</h3>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id}>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <button onClick={() => moveField(index, -1)} disabled={index === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                            <span className="material-icons text-xs">arrow_drop_up</span>
                          </button>
                          <button onClick={() => moveField(index, 1)} disabled={index === fields.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                            <span className="material-icons text-xs">arrow_drop_down</span>
                          </button>
                        </div>
                        <span className="text-sm text-charcoal">{field.label}</span>
                        <span className="text-[10px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">{field.type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditingField(editingField === field.id ? null : field.id)} className="p-1 rounded hover:bg-gray-200">
                          <span className="material-icons text-gray-400 text-sm">settings</span>
                        </button>
                        <button onClick={() => handleRemoveField(field.id)} className="p-1 rounded hover:bg-red-100">
                          <span className="material-icons text-red-400 text-sm">close</span>
                        </button>
                      </div>
                    </div>
                    {editingField === field.id && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                        <Input label="Label" value={field.label} onChange={(e) => handleFieldUpdate(field.id, 'label', e.target.value)} />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Font Size</label>
                            <input type="number" value={field.fontSize} min={8} max={48}
                              onChange={(e) => handleFieldUpdate(field.id, 'fontSize', parseInt(e.target.value) || 12)}
                              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary" />
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={field.bold}
                                onChange={(e) => handleFieldUpdate(field.id, 'bold', e.target.checked)}
                                className="rounded border-gray-300" />
                              <span className="text-sm text-gray-600 font-bold">Bold</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {showAddField ? (
                <div className="mt-3 p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
                  <Input label="Field Label" value={newField.label}
                    onChange={(e) => setNewField({ ...newField, label: e.target.value })} placeholder="e.g., Department" />
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Field Type</label>
                    <select value={newField.type} onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary">
                      {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddField} className="flex-1">Add</Button>
                    <Button variant="outline" size="sm" onClick={() => setShowAddField(false)} className="flex-1">Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => setShowAddField(true)}>
                  <span className="material-icons text-sm mr-1">add</span> Add Field
                </Button>
              )}
            </Card>

            {/* Colors */}
            <Card className="p-4">
              <h3 className="text-sm font-bold text-charcoal mb-3">Accent Color</h3>
              <div className="flex gap-2 flex-wrap">
                {['#f47b25', '#3b82f6', '#22c55e', '#8b5cf6', '#ef4444', '#374151'].map((color) => (
                  <button key={color} onClick={() => setBadgeColor(color)}
                    className={clsx('w-8 h-8 rounded-lg transition-transform',
                      badgeColor === color && 'ring-2 ring-offset-2 ring-primary scale-110')}
                    style={{ backgroundColor: color }} />
                ))}
                <label className="w-8 h-8 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary">
                  <span className="material-icons text-gray-400 text-sm">colorize</span>
                  <input type="color" value={badgeColor} onChange={(e) => setBadgeColor(e.target.value)} className="sr-only" />
                </label>
              </div>
            </Card>
          </div>

          {/* Canvas */}
          <div className="lg:col-span-8">
            <Card className="p-8 flex items-center justify-center min-h-[600px] bg-[repeating-linear-gradient(0deg,transparent,transparent_19px,#f1f1f1_19px,#f1f1f1_20px),repeating-linear-gradient(90deg,transparent,transparent_19px,#f1f1f1_19px,#f1f1f1_20px)]">
              <BadgeCanvas />
            </Card>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-charcoal">Badge Preview</h2>
              <button onClick={() => setShowPreview(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <span className="material-icons text-gray-400">close</span>
              </button>
            </div>
            <div className="flex justify-center"><BadgeCanvas /></div>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" onClick={() => setShowPreview(false)}>Close</Button>
              <Button onClick={() => { setShowPreview(false); handleSave(); }}>
                <span className="material-icons text-sm mr-1">save</span> Save Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
