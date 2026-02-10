import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card, { CardTitle } from '../../components/common/Card';
import Toggle from '../../components/common/Toggle';
import Button from '../../components/common/Button';
import { clsx } from 'clsx';

const FONT_SIZES = ['Small', 'Medium', 'Large', 'Extra Large'];
const COLOR_SCHEMES = [
  { id: 'default', label: 'Default', colors: ['#f47b25', '#f8f7f5'] },
  { id: 'high-contrast', label: 'High Contrast', colors: ['#000000', '#ffffff'] },
  { id: 'blue', label: 'Blue Calm', colors: ['#3b82f6', '#f0f9ff'] },
  { id: 'warm', label: 'Warm Tones', colors: ['#ef4444', '#fff7ed'] },
];

export default function AccessibilitySettings() {
  const [fontSize, setFontSize] = useState('Medium');
  const [colorScheme, setColorScheme] = useState('default');
  const [settings, setSettings] = useState({
    reduceMotion: false,
    screenReader: false,
    captions: true,
    highContrast: false,
    keyboardNav: true,
    focusIndicators: true,
  });

  const toggle = (key) => setSettings({ ...settings, [key]: !settings[key] });

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Accessibility Settings</h1>
          <p className="text-sm text-gray-500">Customize your experience for better accessibility</p>
        </div>

        {/* Font size */}
        <Card className="p-6">
          <CardTitle className="mb-4">Text Size</CardTitle>
          <div className="flex gap-2">
            {FONT_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={clsx(
                  'flex-1 py-3 rounded-xl text-sm font-medium transition-all',
                  fontSize === size ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {size}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Preview: The quick brown fox jumps over the lazy dog.</p>
        </Card>

        {/* Color schemes */}
        <Card className="p-6">
          <CardTitle className="mb-4">Color Scheme</CardTitle>
          <div className="grid grid-cols-2 gap-3">
            {COLOR_SCHEMES.map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => setColorScheme(scheme.id)}
                className={clsx(
                  'p-4 rounded-xl border-2 text-left transition-all',
                  colorScheme === scheme.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="flex gap-2 mb-2">
                  {scheme.colors.map((c, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-sm font-medium text-charcoal">{scheme.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Toggles */}
        <Card className="p-6">
          <CardTitle className="mb-4">Accessibility Features</CardTitle>
          <div className="space-y-4">
            {[
              { key: 'reduceMotion', icon: 'animation', title: 'Reduce Motion', desc: 'Minimize animations and transitions' },
              { key: 'screenReader', icon: 'record_voice_over', title: 'Screen Reader Optimized', desc: 'Enhanced ARIA labels and landmarks' },
              { key: 'captions', icon: 'closed_caption', title: 'Closed Captions', desc: 'Show captions for video and audio content' },
              { key: 'highContrast', icon: 'contrast', title: 'High Contrast Mode', desc: 'Increase visual distinction between elements' },
              { key: 'keyboardNav', icon: 'keyboard', title: 'Keyboard Navigation', desc: 'Enhanced keyboard shortcuts and tab navigation' },
              { key: 'focusIndicators', icon: 'center_focus_strong', title: 'Focus Indicators', desc: 'Prominent focus outlines for interactive elements' },
            ].map(({ key, icon, title, desc }) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span className="material-icons-outlined text-primary text-xl">{icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-charcoal">{title}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </div>
                <Toggle checked={settings[key]} onChange={() => toggle(key)} />
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline">Reset to Defaults</Button>
          <Button>Save Preferences</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
