import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Toggle from '../../components/common/Toggle';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { usersAPI, uploadsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { id: 'profile', label: 'Profile', icon: 'person' },
  { id: 'security', label: 'Security', icon: 'shield' },
  { id: 'sessions', label: 'Sessions', icon: 'devices' },
];

export default function UserProfile() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Profile form
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    bio: '',
    industry: '',
    linkedin_url: '',
    twitter_url: '',
    interests: '',
    skills: '',
    avatar_url: '',
  });

  // Password form
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    newPw: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [toggling2FA, setToggling2FA] = useState(false);

  // Sessions
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'sessions') loadSessions();
  }, [activeTab]);

  const loadProfile = async () => {
    try {
      const res = await usersAPI.getProfile();
      const u = res.data;
      setProfile({
        first_name: u.first_name || '',
        last_name: u.last_name || '',
        email: u.email || '',
        phone: u.phone || '',
        company: u.company || '',
        job_title: u.job_title || '',
        bio: u.bio || '',
        industry: u.industry || '',
        linkedin_url: u.linkedin_url || '',
        twitter_url: u.twitter_url || '',
        interests: (u.interests || []).join(', '),
        skills: (u.skills || []).join(', '),
        avatar_url: u.avatar_url || '',
      });
      setTwoFactorEnabled(u.two_factor_enabled || false);
    } catch {
      toast.error('Failed to load profile');
    }
  };

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await usersAPI.getSessions();
      setSessions(res.data?.sessions || []);
    } catch {
      /* ignore */
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setUploadingAvatar(true);
    try {
      const res = await uploadsAPI.uploadFile(file, 'avatars');
      const url = res.data?.url;
      if (url) {
        setProfile((prev) => ({ ...prev, avatar_url: url }));
        await usersAPI.updateProfile({ avatar_url: url });
        if (user && setUser) setUser({ ...user, avatar_url: url });
        toast.success('Avatar uploaded successfully');
      }
    } catch {
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const data = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        company: profile.company,
        job_title: profile.job_title,
        bio: profile.bio,
        industry: profile.industry,
        linkedin_url: profile.linkedin_url,
        twitter_url: profile.twitter_url,
        interests: profile.interests.split(',').map((s) => s.trim()).filter(Boolean),
        skills: profile.skills.split(',').map((s) => s.trim()).filter(Boolean),
      };
      await usersAPI.updateProfile(data);
      if (user && setUser) setUser({ ...user, ...data });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwords.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setChangingPassword(true);
    try {
      await usersAPI.changePassword({
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      });
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const toggle2FA = async () => {
    setToggling2FA(true);
    try {
      const newState = !twoFactorEnabled;
      await usersAPI.toggle2FA(newState);
      setTwoFactorEnabled(newState);
      toast.success(`Two-factor authentication ${newState ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Failed to update 2FA setting');
    } finally {
      setToggling2FA(false);
    }
  };

  const logoutSession = async (index) => {
    try {
      await usersAPI.logoutSession(index);
      setSessions((prev) => prev.filter((_, i) => i !== index));
      toast.success('Session logged out');
    } catch {
      toast.error('Failed to logout session');
    }
  };

  const initials = (profile.first_name?.[0] || '') + (profile.last_name?.[0] || '') || '?';

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-charcoal">Profile &amp; Security Settings</h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-charcoal'
              }`}
            >
              <span className="material-icons text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card className="p-6 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-gray-100">
                    {initials}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                  {uploadingAvatar ? (
                    <span className="material-icons text-white animate-spin text-[24px]">refresh</span>
                  ) : (
                    <span className="material-icons text-white text-[24px]">photo_camera</span>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-charcoal">
                  {profile.first_name} {profile.last_name}
                </h3>
                <p className="text-sm text-gray-500">{profile.email}</p>
                <p className="text-xs text-gray-400 mt-1">Click the avatar to upload a new photo</p>
              </div>
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'First Name', key: 'first_name' },
                { label: 'Last Name', key: 'last_name' },
                { label: 'Phone', key: 'phone' },
                { label: 'Company', key: 'company' },
                { label: 'Job Title', key: 'job_title' },
                { label: 'Industry', key: 'industry' },
                { label: 'LinkedIn URL', key: 'linkedin_url' },
                { label: 'Twitter URL', key: 'twitter_url' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={profile[field.key]}
                    onChange={(e) => setProfile((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-charcoal text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-charcoal text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Interests (comma-separated)
                </label>
                <input
                  type="text"
                  value={profile.interests}
                  onChange={(e) => setProfile((prev) => ({ ...prev, interests: e.target.value }))}
                  placeholder="AI, Cloud, DevOps"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-charcoal text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={profile.skills}
                  onChange={(e) => setProfile((prev) => ({ ...prev, skills: e.target.value }))}
                  placeholder="Python, React, Machine Learning"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-charcoal text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={saveProfile} loading={loading} icon="save">
                Save Changes
              </Button>
            </div>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Change Password */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-icons text-charcoal text-[20px]">key</span>
                <h3 className="text-lg font-semibold text-charcoal">Change Password</h3>
              </div>
              <div className="space-y-4 max-w-md">
                {[
                  { key: 'current_password', label: 'Current Password', vis: 'current' },
                  { key: 'new_password', label: 'New Password', vis: 'newPw' },
                  { key: 'confirm_password', label: 'Confirm New Password', vis: 'confirm' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {field.label}
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords[field.vis] ? 'text' : 'password'}
                        value={passwords[field.key]}
                        onChange={(e) =>
                          setPasswords((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        className="w-full px-3 py-2 pr-10 rounded-xl border border-gray-200 bg-white text-charcoal text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            [field.vis]: !prev[field.vis],
                          }))
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <span className="material-icons text-[18px]">
                          {showPasswords[field.vis] ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
                <Button
                  onClick={changePassword}
                  loading={changingPassword}
                  disabled={!passwords.current_password || !passwords.new_password || !passwords.confirm_password}
                  icon="key"
                >
                  Change Password
                </Button>
              </div>
            </Card>

            {/* 2FA */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-charcoal text-[20px]">shield</span>
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <Toggle
                  checked={twoFactorEnabled}
                  onChange={toggle2FA}
                />
              </div>
            </Card>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-charcoal mb-4">Active Sessions</h3>
            {loadingSessions ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No active sessions found.</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-icons text-gray-400 text-[20px]">
                        {session.device_type === 'mobile' ? 'phone_android' : 'computer'}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-charcoal">
                          {session.device || session.user_agent || 'Unknown Device'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {session.ip_address || 'Unknown IP'} &bull;{' '}
                          {session.last_active
                            ? new Date(session.last_active).toLocaleString()
                            : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => logoutSession(i)}
                      className="text-sm text-red-500 hover:text-red-700 font-medium"
                    >
                      Logout
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
