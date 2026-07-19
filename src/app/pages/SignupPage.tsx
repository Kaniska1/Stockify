import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Zap, Eye, EyeOff, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import FundWalletModal from '../components/FundWalletModal';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
    { label: 'Special character', ok: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['#4d4d4d', '#f43f5e', '#f97316', '#eab308', '#10b981'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300" style={{ background: i <= score ? colors[score] : '#333333' }} />
        ))}
      </div>
      <div className="flex items-center gap-1 mb-1.5">
        <span style={{ fontSize: '12px', color: colors[score] }}>{labels[score]}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(c => (
          <div key={c.label} className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: c.ok ? 'rgba(16,185,129,0.2)' : '#333333' }}>
              {c.ok && <Check size={8} style={{ color: '#10b981' }} />}
            </div>
            <span style={{ fontSize: '11px', color: c.ok ? '#999999' : '#4d4d4d' }}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFundModal, setShowFundModal] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.username || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.username, form.password);
      toast.success('Account created! Welcome to Stockify');
      setShowFundModal(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: '#1a1a1a',
    border: '1px solid #333333',
    color: '#e7fef6',
    fontSize: '14px',
    width: '100%',
    borderRadius: '8px',
    padding: '10px 14px',
    outline: 'none',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0d0d0d' }}>
      {showFundModal && <FundWalletModal onDone={() => navigate('/dashboard')} />}
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f6f609' }}>
            <Zap size={15} color="#0d0d0d" fill="#0d0d0d" />
          </div>
          <span style={{ fontSize: '17px', fontWeight: 800, color: '#e7fef6', letterSpacing: '-0.03em' }}>Stockify</span>
        </div>

        <div className="rounded-2xl p-8" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#e7fef6', marginBottom: '4px', letterSpacing: '-0.02em' }}>Create your account</h2>
          <p style={{ fontSize: '13px', color: '#999999', marginBottom: '24px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#f8f83a', textDecoration: 'none' }}>Sign in</Link>
          </p>

          {error && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg mb-5" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
              <AlertCircle size={14} style={{ color: '#f43f5e', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#f43f5e' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#b3b3b3', display: 'block', marginBottom: '5px' }}>Full Name</label>
                <input style={inputStyle} placeholder="John Doe" value={form.name} onChange={set('name')}
                  onFocus={e => { e.target.style.borderColor = '#f6f609'; }}
                  onBlur={e => { e.target.style.borderColor = '#333333'; }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#b3b3b3', display: 'block', marginBottom: '5px' }}>Username</label>
                <input style={inputStyle} placeholder="johndoe" value={form.username} onChange={set('username')}
                  onFocus={e => { e.target.style.borderColor = '#f6f609'; }}
                  onBlur={e => { e.target.style.borderColor = '#333333'; }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#b3b3b3', display: 'block', marginBottom: '5px' }}>Email Address</label>
              <input type="email" style={inputStyle} placeholder="john@example.com" value={form.email} onChange={set('email')}
                onFocus={e => { e.target.style.borderColor = '#f6f609'; }}
                onBlur={e => { e.target.style.borderColor = '#333333'; }} />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#b3b3b3', display: 'block', marginBottom: '5px' }}>Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: '40px' }} placeholder="Create a strong password" value={form.password} onChange={set('password')}
                  onFocus={e => { e.target.style.borderColor = '#f6f609'; }}
                  onBlur={e => { e.target.style.borderColor = '#333333'; }} />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#808080' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#b3b3b3', display: 'block', marginBottom: '5px' }}>Confirm Password</label>
              <input type="password" style={inputStyle} placeholder="Repeat password" value={form.confirm} onChange={set('confirm')}
                onFocus={e => { e.target.style.borderColor = '#f6f609'; }}
                onBlur={e => { e.target.style.borderColor = '#333333'; }} />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
                style={{
                  background: loading ? 'rgba(246,246,9,0.5)' : 'linear-gradient(135deg, #f6f609, #c5c507)',
                  color: 'white', fontSize: '14px', fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>Create Account <ArrowRight size={15} /></>
                )}
              </button>
            </div>
          </form>

          <p style={{ fontSize: '12px', color: '#4d4d4d', textAlign: 'center', marginTop: '16px' }}>
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
