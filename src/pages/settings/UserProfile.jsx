import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card, { CardTitle } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Toggle from '../../components/common/Toggle';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../api';
import toast from 'react-hot-toast';

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
    job_title: user?.job_title || '',
    bio: user?.bio || '',
  });
  const [twoFAEnabled, setTwoFAEnabled] = useState(user?.two_factor_enabled || false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new_password: '', confirm: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.updateProfile(form);
      updateUser(res.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await usersAPI.changePassword(passwordForm);
      toast.success('Password changed');
      setPasswordForm({ current: '', new_password: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change password');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-charcoal">Profile & Security Settings</h1>

        {/* Profile photo */}
        <Card className="p-6">
          <div className="flex items-center gap-6">
            <Avatar name={`${form.first_name} ${form.last_name}`} src={user?.avatar_url} size="lg" />
            <div>
              <h3 className="text-lg font-bold text-charcoal">
                {form.first_name} {form.last_name}
              </h3>
              <p className="text-sm text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              <Button variant="outline" size="sm" className="mt-3">
                <span className="material-icons text-sm mr-1">upload</span>
                Change Photo
              </Button>
            </div>
          </div>
        </Card>

        {/* Personal info */}
        <Card className="p-6">
          <CardTitle className="mb-6">Personal Information</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="First Name" name="first_name" value={form.first_name} onChange={handleChange} />
            <Input label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} />
            <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} disabled />
            <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
            <Input label="Company" name="company" value={form.company} onChange={handleChange} />
            <Input label="Job Title" name="job_title" value={form.job_title} onChange={handleChange} />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-charcoal text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Tell us about yourself..."
            />
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} loading={loading}>Save Changes</Button>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <CardTitle className="mb-6">Security</CardTitle>

          {/* 2FA */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="material-icons text-primary">security</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-charcoal">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Add an extra layer of security</p>
              </div>
            </div>
            <Toggle checked={twoFAEnabled} onChange={setTwoFAEnabled} />
          </div>

          {/* Change password */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-charcoal">Change Password</h4>
            <Input
              label="Current Password"
              type="password"
              value={passwordForm.current}
              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="New Password"
                type="password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              />
              <Input
                label="Confirm Password"
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              />
            </div>
            <Button variant="outline" onClick={handlePasswordChange}>Update Password</Button>
          </div>
        </Card>

        {/* Danger zone */}
        <Card className="p-6 border-red-200">
          <CardTitle className="text-red-600 mb-4">Danger Zone</CardTitle>
          <p className="text-sm text-gray-500 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button variant="danger" size="sm">Delete Account</Button>
        </Card>
      </div>
    </DashboardLayout>
  );
}
