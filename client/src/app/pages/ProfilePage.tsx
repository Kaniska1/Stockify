import { useState, FormEvent } from 'react';
import { Camera, User, Lock, Shield, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const { walletBalance, portfolioValue, transactions, holdings } = useApp();

  const [profileForm, setProfileForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', username: user?.username ?? '' });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [pwError, setPwError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError('');
    if (!profileForm.name || !profileForm.email || !profileForm.username) {
      setProfileError('All fields are required');
      return;
    }
    setProfileLoading(true);
    try {
      await updateProfile({ name: profileForm.name, email: profileForm.email, username: profileForm.username });
      toast.success('Profile updated successfully!');
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) { setPwError('All fields required'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError('New passwords do not match'); return; }
    if (pwForm.next.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    setPwLoading(true);
    try {
      await changePassword(pwForm.current, pwForm.next);
      setPwForm({ current: '', next: '', confirm: '' });
      toast.success('Password changed successfully!');
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await updateProfile({ avatar: reader.result as string });
        toast.success('Avatar updated!');
      } catch {
        toast.error('Failed to update avatar');
      }
    };
    reader.readAsDataURL(file);
  };

  const inputStyle = {
    background: '#0d0d0d',
    border: '1px solid #333333',
    color: '#e7fef6',
    fontSize: '14px',
    width: '100%',
    borderRadius: '8px',
    padding: '10px 14px',
    outline: 'none',
  };

  const stats = [
    { label: 'Portfolio Value', value: `$${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
    { label: 'Cash Balance', value: `$${walletBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
    { label: 'Total Transactions', value: transactions.length.toString() },
    { label: 'Stocks Held', value: holdings.length.toString() },
    { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A' },
  ];

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#e7fef6', letterSpacing: '-0.02em' }}>Profile</h1>
        <p style={{ fontSize: '13px', color: '#808080', marginTop: '2px' }}>Manage your account settings</p>
      </div>

      {/* Avatar + stats */}
      <div className="p-5 rounded-xl mb-5 flex flex-wrap items-center gap-5" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #f6f609, #c5c507)' }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>{initials}</span>
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer" style={{ background: '#f6f609' }}>
            <Camera size={11} color="white" />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#e7fef6' }}>{user?.name}</div>
          <div style={{ fontSize: '13px', color: '#808080' }}>@{user?.username} · {user?.email}</div>
        </div>

        <div className="flex flex-wrap gap-4 ml-auto">
          {stats.map(s => (
            <div key={s.label} className="text-right">
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#e7fef6' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#808080' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-5 w-fit" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
        {([['profile', 'Profile', <User size={14} />], ['security', 'Security', <Lock size={14} />]] as const).map(([tab, label, icon]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
            style={{
              fontSize: '13px', fontWeight: 500,
              background: activeTab === tab ? '#333333' : 'transparent',
              color: activeTab === tab ? '#e7fef6' : '#999999',
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="p-5 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
          <div className="flex items-center gap-2 mb-5">
            <User size={16} style={{ color: '#f6f609' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#e7fef6' }}>Personal Information</h3>
          </div>

          {profileError && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
              <AlertCircle size={14} style={{ color: '#f43f5e' }} />
              <span style={{ fontSize: '13px', color: '#f43f5e' }}>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#b3b3b3', display: 'block', marginBottom: '6px' }}>Full Name</label>
              <input style={inputStyle} value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                onFocus={e => { e.target.style.borderColor = '#f6f609'; }} onBlur={e => { e.target.style.borderColor = '#333333'; }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#b3b3b3', display: 'block', marginBottom: '6px' }}>Email</label>
                <input type="email" style={inputStyle} value={profileForm.email} onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                  onFocus={e => { e.target.style.borderColor = '#f6f609'; }} onBlur={e => { e.target.style.borderColor = '#333333'; }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#b3b3b3', display: 'block', marginBottom: '6px' }}>Username</label>
                <input style={inputStyle} value={profileForm.username} onChange={e => setProfileForm(p => ({ ...p, username: e.target.value }))}
                  onFocus={e => { e.target.style.borderColor = '#f6f609'; }} onBlur={e => { e.target.style.borderColor = '#333333'; }} />
              </div>
            </div>
            <div className="pt-1">
              <button type="submit" disabled={profileLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all"
                style={{ background: profileLoading ? 'rgba(246,246,9,0.4)' : 'linear-gradient(135deg, #f6f609, #c5c507)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: profileLoading ? 'not-allowed' : 'pointer' }}>
                {profileLoading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Check size={15} />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="p-5 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
          <div className="flex items-center gap-2 mb-5">
            <Shield size={16} style={{ color: '#f6f609' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#e7fef6' }}>Change Password</h3>
          </div>

          {pwError && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
              <AlertCircle size={14} style={{ color: '#f43f5e' }} />
              <span style={{ fontSize: '13px', color: '#f43f5e' }}>{pwError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
            {[
              { key: 'current', label: 'Current Password' },
              { key: 'next', label: 'New Password' },
              { key: 'confirm', label: 'Confirm New Password' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#b3b3b3', display: 'block', marginBottom: '6px' }}>{label}</label>
                <input
                  type="password"
                  style={inputStyle}
                  value={pwForm[key as keyof typeof pwForm]}
                  onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                  onFocus={e => { e.target.style.borderColor = '#f6f609'; }}
                  onBlur={e => { e.target.style.borderColor = '#333333'; }}
                />
              </div>
            ))}
            <div className="pt-1">
              <button type="submit" disabled={pwLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all"
                style={{ background: pwLoading ? 'rgba(246,246,9,0.4)' : 'linear-gradient(135deg, #f6f609, #c5c507)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: pwLoading ? 'not-allowed' : 'pointer' }}>
                {pwLoading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Lock size={15} />}
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
