import { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import KPICard from '../../components/common/KPICard';
import { attendanceAPI, eventsAPI, ticketsAPI } from '../../api';
import toast from 'react-hot-toast';

// ─── Tabs ────────────────────────────────────────────────
const TABS = [
  { id: 'verify', label: 'Verify & Check-in', icon: 'face' },
  { id: 'enroll', label: 'Enroll Faces', icon: 'person_add' },
  { id: 'enrollments', label: 'Enrolled List', icon: 'groups' },
  { id: 'log', label: 'Attendance Log', icon: 'history' },
];

export default function FaceAttendance() {
  const [activeTab, setActiveTab] = useState('verify');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await eventsAPI.list({ limit: 100 });
        const evts = res.data.events || res.data || [];
        setEvents(evts);
        if (evts.length > 0 && !selectedEvent) {
          setSelectedEvent(evts[0]._id || evts[0].id);
        }
      } catch {
        toast.error('Failed to load events');
      }
    };
    loadEvents();
  }, []);

  // Load stats when event changes
  useEffect(() => {
    if (!selectedEvent) return;
    const loadStats = async () => {
      try {
        const res = await attendanceAPI.getStats(selectedEvent);
        setStats(res.data);
      } catch {
        setStats(null);
      }
    };
    loadStats();
  }, [selectedEvent, activeTab]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ── Header ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-charcoal flex items-center gap-2">
              <span className="material-icons text-primary">face</span>
              Face Recognition Attendance
            </h1>
            <p className="text-sm text-gray-500 mt-1">Enroll attendee faces & verify at entry using AI</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600">Event:</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="">Select Event</option>
              {events.map((ev) => (
                <option key={ev._id || ev.id} value={ev._id || ev.id}>
                  {ev.title || ev.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Stats ──────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
            <KPICard title="Enrolled Faces" value={stats.total_enrolled} icon="face" />
            <KPICard title="Verified" value={stats.total_verified} icon="verified" />
            <KPICard title="Failed Attempts" value={stats.total_failed} icon="error_outline" />
            <KPICard title="Checked In" value={stats.total_checked_in} icon="how_to_reg" />
            <KPICard title="Check-in Rate" value={`${stats.check_in_rate}%`} icon="trending_up" />
          </div>
        )}

        {/* ── Tab Navigation ─────────────────────── */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="material-icons text-[18px]">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab Content ────────────────────────── */}
        {!selectedEvent ? (
          <Card className="p-12 text-center">
            <span className="material-icons text-5xl text-gray-300 mb-3">event</span>
            <p className="text-gray-400 font-medium">Select an event to get started</p>
          </Card>
        ) : (
          <>
            {activeTab === 'verify' && <VerifyTab eventId={selectedEvent} />}
            {activeTab === 'enroll' && <EnrollTab eventId={selectedEvent} />}
            {activeTab === 'enrollments' && <EnrollmentsTab eventId={selectedEvent} />}
            {activeTab === 'log' && <LogTab eventId={selectedEvent} />}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}


// ═════════════════════════════════════════════════════════
// ─── VERIFY & CHECK-IN TAB ──────────────────────────────
// ═════════════════════════════════════════════════════════

function VerifyTab({ eventId }) {
  const [mode, setMode] = useState('upload'); // 'upload' | 'camera'
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setMode('camera');
      setResult(null);
      setPreviewUrl(null);
    } catch (err) {
      toast.error('Camera access denied. Please allow camera permission.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setPreviewUrl(URL.createObjectURL(blob));
      stopCamera();
      setMode('upload');
      await verifyFace(blob);
    }, 'image/jpeg', 0.9);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    await verifyFace(file);
  };

  const verifyFace = async (imageBlob) => {
    setVerifying(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', imageBlob, 'face.jpg');
      formData.append('event_id', eventId);
      formData.append('auto_checkin', 'true');
      const res = await attendanceAPI.verify(formData);
      setResult(res.data);
      if (res.data.matched) {
        if (res.data.already_checked_in) {
          toast('Attendee already checked in', { icon: 'ℹ️' });
        } else if (res.data.checked_in) {
          toast.success(`${res.data.first_name} ${res.data.last_name} checked in!`);
        }
      } else {
        toast.error('No match found');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Verification failed';
      toast.error(msg);
      setResult({ matched: false, error: msg });
    } finally {
      setVerifying(false);
    }
  };

  const reset = () => {
    setResult(null);
    setPreviewUrl(null);
    setMode('upload');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left - Capture / Upload */}
      <Card className="p-6">
        <h3 className="font-bold text-charcoal mb-4 flex items-center gap-2">
          <span className="material-icons text-primary">photo_camera</span>
          Capture Attendee Face
        </h3>

        {mode === 'camera' ? (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Face guide overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-60 border-2 border-white/50 rounded-[40%] shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]" />
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-3">
              <Button onClick={capturePhoto} icon="camera_alt" className="flex-1">
                Capture
              </Button>
              <Button
                variant="secondary"
                onClick={() => { stopCamera(); setMode('upload'); }}
                icon="close"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {previewUrl ? (
              <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-[4/3]">
                <img src={previewUrl} alt="Captured" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl aspect-[4/3] flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
              >
                <span className="material-icons text-5xl text-gray-300 mb-2">add_a_photo</span>
                <p className="text-sm text-gray-400 font-medium">Click to upload a photo</p>
                <p className="text-xs text-gray-300 mt-1">or use camera below</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                icon="upload"
                className="flex-1"
                loading={verifying}
              >
                Upload Photo
              </Button>
              <Button onClick={startCamera} icon="videocam" className="flex-1">
                Use Camera
              </Button>
            </div>
            {(result || previewUrl) && (
              <Button variant="ghost" onClick={reset} icon="refresh" className="w-full">
                Scan Another
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Right - Result */}
      <Card className="p-6">
        <h3 className="font-bold text-charcoal mb-4 flex items-center gap-2">
          <span className="material-icons text-primary">verified</span>
          Verification Result
        </h3>

        {verifying ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="material-icons text-5xl text-primary animate-spin mb-3">refresh</span>
            <p className="text-sm text-gray-500 font-medium">Analyzing face...</p>
            <p className="text-xs text-gray-400 mt-1">Comparing against enrolled attendees</p>
          </div>
        ) : result ? (
          result.matched ? (
            <div className="space-y-5">
              {/* Match success banner */}
              <div className={`rounded-xl p-4 ${result.already_checked_in ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
                <div className="flex items-center gap-3">
                  <span className={`material-icons text-3xl ${result.already_checked_in ? 'text-amber-500' : 'text-green-500'}`}>
                    {result.already_checked_in ? 'info' : 'check_circle'}
                  </span>
                  <div>
                    <p className={`font-bold ${result.already_checked_in ? 'text-amber-700' : 'text-green-700'}`}>
                      {result.already_checked_in ? 'Already Checked In' : 'Identity Verified & Checked In'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Confidence: {result.confidence_percent?.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Attendee details */}
              <div className="space-y-3">
                <DetailRow icon="person" label="Name" value={`${result.first_name || ''} ${result.last_name || ''}`} />
                <DetailRow icon="email" label="Email" value={result.email} />
                <DetailRow icon="percent" label="Confidence" value={`${result.confidence_percent?.toFixed(1)}%`} />
                {result.check_in_time && (
                  <DetailRow icon="schedule" label="Check-in Time" value={new Date(result.check_in_time).toLocaleTimeString()} />
                )}
                {result.warning && (
                  <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-700 flex items-start gap-2">
                    <span className="material-icons text-[18px] mt-0.5">warning</span>
                    {result.warning}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-12">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <span className="material-icons text-4xl text-red-400">person_off</span>
              </div>
              <p className="font-bold text-red-600 mb-1">No Match Found</p>
              <p className="text-sm text-gray-400 text-center max-w-xs">
                {result.error || `The face did not match any enrolled attendee for this event. Best similarity: ${result.confidence_percent?.toFixed(1) || 0}%`}
              </p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="material-icons text-5xl text-gray-300">face_retouching_natural</span>
            </div>
            <p className="text-gray-400 font-medium mb-1">Ready to Scan</p>
            <p className="text-xs text-gray-300 max-w-xs">
              Upload a photo or use the camera to verify an attendee's identity
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}


// ═════════════════════════════════════════════════════════
// ─── ENROLL TAB ─────────────────────────────────────────
// ═════════════════════════════════════════════════════════

function EnrollTab({ eventId }) {
  const [enrollMode, setEnrollMode] = useState('single'); // 'single' | 'bulk'
  const [form, setForm] = useState({ user_id: '', first_name: '', last_name: '', email: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  // Bulk state
  const [bulkFiles, setBulkFiles] = useState([]);
  const [bulkMeta, setBulkMeta] = useState('');
  const [bulkEnrolling, setBulkEnrolling] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);

  // Registrations for selection
  const [registrations, setRegistrations] = useState([]);
  const [searchReg, setSearchReg] = useState('');
  const [showRegDropdown, setShowRegDropdown] = useState(false);

  useEffect(() => {
    const loadRegs = async () => {
      try {
        const res = await ticketsAPI.eventRegistrations(eventId, { limit: 500 });
        setRegistrations(res.data.registrations || []);
      } catch {
        // ignore
      }
    };
    loadRegs();
  }, [eventId]);

  const filteredRegs = registrations.filter((r) => {
    const term = searchReg.toLowerCase();
    return (
      (r.first_name || '').toLowerCase().includes(term) ||
      (r.last_name || '').toLowerCase().includes(term) ||
      (r.email || '').toLowerCase().includes(term) ||
      (r.user_id || '').toLowerCase().includes(term)
    );
  });

  const selectRegistration = (reg) => {
    setForm({
      user_id: reg.user_id || '',
      first_name: reg.first_name || '',
      last_name: reg.last_name || '',
      email: reg.email || '',
    });
    setShowRegDropdown(false);
    setSearchReg(`${reg.first_name || ''} ${reg.last_name || ''}`);
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const enrollSingle = async () => {
    if (!form.user_id) return toast.error('Please select a registered attendee');
    if (!file) return toast.error('Please upload a face photo');

    setEnrolling(true);
    try {
      const formData = new FormData();
      formData.append('event_id', eventId);
      formData.append('user_id', form.user_id);
      formData.append('first_name', form.first_name);
      formData.append('last_name', form.last_name);
      formData.append('email', form.email);
      formData.append('file', file);
      await attendanceAPI.enroll(formData);
      toast.success(`${form.first_name} ${form.last_name} enrolled successfully`);
      // Reset
      setForm({ user_id: '', first_name: '', last_name: '', email: '' });
      setFile(null);
      setPreview(null);
      setSearchReg('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const enrollBulk = async () => {
    if (bulkFiles.length === 0) return toast.error('Please select files to upload');
    if (!bulkMeta.trim()) return toast.error('Please provide metadata (user IDs)');

    setBulkEnrolling(true);
    setBulkResults(null);
    try {
      const formData = new FormData();
      formData.append('event_id', eventId);

      // Parse metadata
      const lines = bulkMeta.trim().split('\n');
      const userIds = [];
      const firstNames = [];
      const lastNames = [];
      const emails = [];
      lines.forEach((line) => {
        const parts = line.split(',').map((s) => s.trim());
        userIds.push(parts[0] || '');
        firstNames.push(parts[1] || '');
        lastNames.push(parts[2] || '');
        emails.push(parts[3] || '');
      });

      formData.append('user_ids', userIds.join(','));
      formData.append('first_names', firstNames.join(','));
      formData.append('last_names', lastNames.join(','));
      formData.append('emails', emails.join(','));

      bulkFiles.forEach((f) => formData.append('files', f));

      const res = await attendanceAPI.enrollBulk(formData);
      setBulkResults(res.data);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Bulk enrollment failed');
    } finally {
      setBulkEnrolling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setEnrollMode('single')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            enrollMode === 'single'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <span className="material-icons text-[18px]">person_add</span>
          Single Enrollment
        </button>
        <button
          onClick={() => setEnrollMode('bulk')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            enrollMode === 'bulk'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <span className="material-icons text-[18px]">group_add</span>
          Bulk Enrollment
        </button>
      </div>

      {enrollMode === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left - Form */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-charcoal flex items-center gap-2">
              <span className="material-icons text-primary">person_add</span>
              Attendee Details
            </h3>

            {/* Search registrations */}
            <div className="relative">
              <Input
                label="Search Registered Attendees"
                icon="search"
                value={searchReg}
                onChange={(e) => {
                  setSearchReg(e.target.value);
                  setShowRegDropdown(true);
                }}
                onFocus={() => setShowRegDropdown(true)}
                placeholder="Type a name, email, or user ID..."
              />
              {showRegDropdown && searchReg && filteredRegs.length > 0 && (
                <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto">
                  {filteredRegs.slice(0, 10).map((r, i) => (
                    <button
                      key={i}
                      onClick={() => selectRegistration(r)}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm"
                    >
                      <span className="material-icons text-gray-400 text-[18px]">person</span>
                      <div>
                        <p className="font-medium text-charcoal">{r.first_name} {r.last_name}</p>
                        <p className="text-xs text-gray-400">{r.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" icon="badge" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
              <Input label="Last Name" icon="badge" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </div>
            <Input label="Email" icon="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="User ID" icon="fingerprint" value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} />

            <Button
              onClick={enrollSingle}
              loading={enrolling}
              icon="how_to_reg"
              className="w-full"
              disabled={!form.user_id || !file}
            >
              Enroll Face
            </Button>
          </Card>

          {/* Right - Photo Upload */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-charcoal flex items-center gap-2">
              <span className="material-icons text-primary">add_a_photo</span>
              Face Photo
            </h3>
            <p className="text-sm text-gray-400">Upload a clear, front-facing photo of the attendee. Ensure good lighting and no obstructions.</p>

            {preview ? (
              <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-square max-w-sm mx-auto">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <span className="material-icons text-white text-[18px]">close</span>
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-300 rounded-xl aspect-square max-w-sm mx-auto flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all w-full">
                <span className="material-icons text-5xl text-gray-300 mb-2">face</span>
                <p className="text-sm text-gray-400 font-medium">Click to upload</p>
                <p className="text-xs text-gray-300 mt-1">JPG, PNG up to 10MB</p>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}

            <div className="bg-blue-50 rounded-lg p-3 space-y-1.5">
              <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                <span className="material-icons text-[16px]">tips_and_updates</span>
                Tips for best results
              </p>
              <ul className="text-xs text-blue-600 space-y-0.5 ml-5 list-disc">
                <li>Use a well-lit, front-facing photo</li>
                <li>Ensure only one face is visible</li>
                <li>Avoid sunglasses, masks, or heavy shadows</li>
                <li>High resolution photos work better</li>
              </ul>
            </div>
          </Card>
        </div>
      ) : (
        /* Bulk enrollment */
        <Card className="p-6 space-y-5">
          <h3 className="font-bold text-charcoal flex items-center gap-2">
            <span className="material-icons text-primary">group_add</span>
            Bulk Face Enrollment
          </h3>
          <p className="text-sm text-gray-400">Upload multiple face photos and provide metadata for each. Each file corresponds to one attendee.</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Upload Photos</label>
              <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                <span className="material-icons text-4xl text-gray-300 mb-2">collections</span>
                <p className="text-sm text-gray-400 font-medium">
                  {bulkFiles.length > 0 ? `${bulkFiles.length} files selected` : 'Click to select multiple photos'}
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setBulkFiles(Array.from(e.target.files || []))}
                  className="hidden"
                />
              </label>

              {bulkFiles.length > 0 && (
                <div className="max-h-40 overflow-auto space-y-1">
                  {bulkFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-1.5">
                      <span className="material-icons text-[16px] text-gray-400">image</span>
                      <span className="truncate flex-1">{f.name}</span>
                      <span className="text-xs text-gray-400">{(f.size / 1024).toFixed(0)}KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Metadata (one per line, matching file order)
              </label>
              <textarea
                value={bulkMeta}
                onChange={(e) => setBulkMeta(e.target.value)}
                placeholder={"user_id_1, FirstName, LastName, email@example.com\nuser_id_2, Jane, Doe, jane@example.com"}
                rows={8}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-mono placeholder:text-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              <p className="text-xs text-gray-400">Format: user_id, first_name, last_name, email</p>
            </div>
          </div>

          <Button
            onClick={enrollBulk}
            loading={bulkEnrolling}
            icon="upload"
            disabled={bulkFiles.length === 0}
          >
            Enroll All ({bulkFiles.length} faces)
          </Button>

          {bulkResults && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3">
                <Badge color="green">{bulkResults.enrolled} Enrolled</Badge>
                {bulkResults.failed > 0 && <Badge color="red">{bulkResults.failed} Failed</Badge>}
              </div>
              <div className="max-h-40 overflow-auto space-y-1">
                {bulkResults.results?.map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${
                      r.status === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}
                  >
                    <span className="material-icons text-[16px]">
                      {r.status === 'error' ? 'error' : 'check_circle'}
                    </span>
                    <span className="flex-1">{r.name || r.user_id}</span>
                    <span className="text-xs">{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}


// ═════════════════════════════════════════════════════════
// ─── ENROLLMENTS LIST TAB ───────────────────────────────
// ═════════════════════════════════════════════════════════

function EnrollmentsTab({ eventId }) {
  const [enrollments, setEnrollments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const loadEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendanceAPI.listEnrollments(eventId, { page, limit: 20, search: search || undefined });
      setEnrollments(res.data.enrollments || []);
      setTotal(res.data.total || 0);
    } catch {
      toast.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  }, [eventId, page, search]);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  const handleDelete = async (id) => {
    try {
      await attendanceAPI.deleteEnrollment(id);
      toast.success('Enrollment removed');
      loadEnrollments();
    } catch {
      toast.error('Delete failed');
    }
    setDeleteId(null);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-charcoal flex items-center gap-2">
          <span className="material-icons text-primary">groups</span>
          Enrolled Attendees
          <Badge color="blue">{total}</Badge>
        </h3>
        <div className="w-64">
          <Input
            icon="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="material-icons text-3xl text-primary animate-spin">refresh</span>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-icons text-5xl text-gray-300 mb-2">person_off</span>
          <p className="text-gray-400 font-medium">No enrollments found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Attendee</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Enrolled At</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="material-icons text-primary text-[18px]">face</span>
                        </div>
                        <div>
                          <p className="font-medium text-charcoal">{e.first_name} {e.last_name}</p>
                          <p className="text-xs text-gray-400">ID: {e.user_id?.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{e.email}</td>
                    <td className="py-3 px-4 text-gray-400">
                      {e.created_at ? new Date(e.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setDeleteId(e._id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <span className="material-icons text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-400">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
              </p>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  icon="chevron_left"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page * 20 >= total}
                  onClick={() => setPage((p) => p + 1)}
                  icon="chevron_right"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Remove Enrollment" size="sm">
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to remove this face enrollment? The attendee will need to be re-enrolled for face check-in.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => handleDelete(deleteId)} icon="delete">Remove</Button>
        </div>
      </Modal>
    </Card>
  );
}


// ═════════════════════════════════════════════════════════
// ─── ATTENDANCE LOG TAB ─────────────────────────────────
// ═════════════════════════════════════════════════════════

function LogTab({ eventId }) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendanceAPI.getLog(eventId, { page, limit: 30 });
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch {
      toast.error('Failed to load attendance log');
    } finally {
      setLoading(false);
    }
  }, [eventId, page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-charcoal flex items-center gap-2">
          <span className="material-icons text-primary">history</span>
          Attendance Log
          <Badge color="blue">{total}</Badge>
        </h3>
        <Button variant="secondary" size="sm" onClick={loadLogs} icon="refresh">
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="material-icons text-3xl text-primary animate-spin">refresh</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-icons text-5xl text-gray-300 mb-2">history</span>
          <p className="text-gray-400 font-medium">No attendance records yet</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {logs.map((log, i) => (
              <div
                key={log._id || i}
                className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                  log.verified ? 'bg-green-50/50' : 'bg-red-50/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  log.verified ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <span className={`material-icons text-xl ${
                    log.verified ? 'text-green-500' : 'text-red-400'
                  }`}>
                    {log.verified ? 'check_circle' : 'cancel'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal text-sm">{log.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-400">
                    {log.method} • Confidence: {log.confidence?.toFixed(1) || 0}%
                  </p>
                </div>
                <div className="text-right">
                  <Badge color={log.verified ? 'green' : 'red'}>
                    {log.verified ? 'Verified' : 'Failed'}
                  </Badge>
                  <p className="text-xs text-gray-400 mt-1">
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {total > 30 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-400">
                Showing {(page - 1) * 30 + 1}–{Math.min(page * 30, total)} of {total}
              </p>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  icon="chevron_left"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page * 30 >= total}
                  onClick={() => setPage((p) => p + 1)}
                  icon="chevron_right"
                />
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}


// ═════════════════════════════════════════════════════════
// ─── HELPER COMPONENTS ──────────────────────────────────
// ═════════════════════════════════════════════════════════

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="material-icons text-gray-400 text-[20px]">{icon}</span>
      <span className="text-sm text-gray-500 w-24">{label}</span>
      <span className="text-sm font-medium text-charcoal">{value || '—'}</span>
    </div>
  );
}
