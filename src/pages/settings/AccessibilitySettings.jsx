import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Toggle from '../../components/common/Toggle';
import LoadingSpinner, { PageLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { usersAPI } from '../../api';

const FONT_SIZES = [
  { value: 14, label: 'Small' },
  { value: 16, label: 'Medium (Default)' },
  { value: 18, label: 'Large' },
  { value: 20, label: 'Extra Large' },
];

const DEFAULT_SETTINGS = {
  font_size: 16,
  high_contrast: false,
  screen_reader_mode: false,
  voice_navigation: false,
};

export default function AccessibilitySettings() {
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const [originalSettings, setOriginalSettings] = useState({ ...DEFAULT_SETTINGS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const changed =
      settings.font_size !== originalSettings.font_size ||
      settings.high_contrast !== originalSettings.high_contrast ||
      settings.screen_reader_mode !== originalSettings.screen_reader_mode ||
      settings.voice_navigation !== originalSettings.voice_navigation;
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getProfile();
      const user = res.data;
      const loaded = {
        font_size: user.font_size || DEFAULT_SETTINGS.font_size,
        high_contrast: user.high_contrast || DEFAULT_SETTINGS.high_contrast,
        screen_reader_mode: user.screen_reader_mode || DEFAULT_SETTINGS.screen_reader_mode,
        voice_navigation: user.voice_navigation || DEFAULT_SETTINGS.voice_navigation,
      };
      setSettings(loaded);
      setOriginalSettings(loaded);
    } catch {
      toast.error('Failed to load accessibility settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await usersAPI.updateAccessibility(settings);
      setOriginalSettings({ ...settings });
      toast.success('Accessibility settings saved');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({ ...DEFAULT_SETTINGS });
    toast('Settings reset to defaults — click Save to apply', { icon: '↩️' });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">Accessibility Settings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Customize your experience to make NetSync more accessible
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={resetToDefaults} icon="restart_alt" size="sm">
              Reset
            </Button>
            <Button onClick={saveSettings} loading={saving} disabled={!hasChanges} icon="save" size="sm">
              Save
            </Button>
          </div>
        </div>

        {/* Font Size */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-icons text-charcoal text-[20px]">text_fields</span>
            <h2 className="text-lg font-semibold text-charcoal">Font Size</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Adjust the base font size across the application
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FONT_SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => setSettings((prev) => ({ ...prev, font_size: size.value }))}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                  settings.font_size === size.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span
                  className="font-semibold text-charcoal"
                  style={{ fontSize: `${size.value}px` }}
                >
                  Aa
                </span>
                <span className="text-xs text-gray-500">{size.label}</span>
                <span className="text-xs text-gray-400">{size.value}px</span>
              </button>
            ))}
          </div>
          {/* Preview */}
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Preview:</p>
            <p className="text-charcoal" style={{ fontSize: `${settings.font_size}px` }}>
              This is how text will appear at {settings.font_size}px.
            </p>
          </div>
        </Card>

        {/* Toggle Settings */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-charcoal mb-2">Display &amp; Interaction</h2>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <Toggle
              checked={settings.high_contrast}
              onChange={(v) => setSettings((prev) => ({ ...prev, high_contrast: v }))}
              label="High Contrast Mode"
              description="Increase contrast for better visibility"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <Toggle
              checked={settings.screen_reader_mode}
              onChange={(v) => setSettings((prev) => ({ ...prev, screen_reader_mode: v }))}
              label="Screen Reader Mode"
              description="Optimize the interface for screen readers with enhanced ARIA labels"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <Toggle
              checked={settings.voice_navigation}
              onChange={(v) => setSettings((prev) => ({ ...prev, voice_navigation: v }))}
              label="Voice Navigation"
              description="Enable voice commands for hands-free navigation"
            />
          </div>
        </Card>

        {/* Unsaved changes indicator */}
        {hasChanges && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-charcoal text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-50">
            <span className="text-sm">You have unsaved changes</span>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-3 py-1 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-600 transition"
            >
              {saving ? 'Saving...' : 'Save Now'}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
