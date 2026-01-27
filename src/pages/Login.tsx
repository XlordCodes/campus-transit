import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Bus, ShieldCheck, X, CheckCircle2 } from 'lucide-react';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

type PortalRole = 'student' | 'driver' | 'admin';

const isRoleAllowed = (requestedRole: PortalRole, email: string) => {
  const lower = email.toLowerCase();
  if (requestedRole === 'driver') return lower.includes('driver');
  if (requestedRole === 'admin') return lower.includes('admin');
  return true;
};

const roleToLabel = (role: PortalRole) => {
  if (role === 'student') return 'Student';
  if (role === 'driver') return 'Driver';
  return 'Admin';
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<PortalRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalTitle = useMemo(() => {
    if (!activeRole) return '';
    return `${roleToLabel(activeRole)} Login`;
  }, [activeRole]);

  const closeModal = () => {
    setActiveRole(null);
    setEmail('');
    setPassword('');
    setError(null);
    setSubmitting(false);
  };

  const openModal = (role: PortalRole) => {
    setActiveRole(role);
    setEmail('');
    setPassword('');
    setError(null);
    setSubmitting(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRole) return;
    setError(null);

    if (!isFirebaseConfigured || !auth) {
      setError('Firebase is not configured.');
      return;
    }

    setSubmitting(true);
    try {
      const normalizedEmail = email.trim();
      await signInWithEmailAndPassword(auth, normalizedEmail, password);

      if (!isRoleAllowed(activeRole, normalizedEmail)) {
        await signOut(auth);
        if (activeRole === 'driver') {
          setError('Access Denied: Not a Driver account.');
        } else if (activeRole === 'admin') {
          setError('Access Denied: Not an Admin account.');
        } else {
          setError('Access Denied.');
        }
        return;
      }

      closeModal();
      navigate(`/${activeRole}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 bg-linear-to-br from-indigo-900 to-blue-800 text-white flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-lg">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Campus Transit</h1>
          <p className="text-indigo-100 text-lg md:text-xl mt-4">
            Real-time shuttle tracking for students and staff.
          </p>

          <div className="mt-8 space-y-3">
            <FeatureItem text="Live GPS Tracking" />
            <FeatureItem text="Seat Availability" />
            <FeatureItem text="Route Analytics" />
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-slate-50 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Campus Transit Portal</h2>
            <p className="text-slate-600 mt-2">Select a portal to sign in.</p>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <PortalCard
              title="Student Portal"
              icon={<GraduationCap className="text-indigo-700" size={30} />}
              onClick={() => openModal('student')}
            />
            <PortalCard
              title="Driver Interface"
              icon={<Bus className="text-indigo-700" size={30} />}
              onClick={() => openModal('driver')}
            />
            <PortalCard
              title="Admin Dashboard"
              icon={<ShieldCheck className="text-indigo-700" size={30} />}
              onClick={() => openModal('admin')}
            />
          </div>
        </div>
      </div>

      {activeRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <button type="button" className="absolute inset-0 bg-black/50" onClick={closeModal} aria-label="Close" />

          <div className="relative w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{modalTitle}</h2>
                <p className="text-sm text-slate-600 mt-1">Enter your email and password to continue.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
                aria-label="Close"
              >
                <X size={18} className="text-slate-700" />
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSignIn}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                  placeholder="name@university.edu"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                />
              </div>

              {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-3 px-6 rounded-full shadow-sm border border-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Signing In…' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FeatureItem: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2 size={18} className="text-indigo-100" />
      <span className="text-indigo-100 font-semibold">{text}</span>
    </div>
  );
};

const PortalCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, icon, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 shadow-md p-8 text-left transition-all hover:border-indigo-500 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xl font-bold text-slate-900">{title}</div>
          <div className="text-sm text-slate-600 mt-1">Click to sign in</div>
        </div>
      </div>
    </button>
  );
};

export default Login;
