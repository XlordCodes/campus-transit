import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, GraduationCap, ShieldCheck, X } from 'lucide-react';
import { useBus } from '../context/BusContext';

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
  const { signIn: authSignIn } = useBus();
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

    setSubmitting(true);
    try {
      const normalizedEmail = email.trim();
      
      // Use simple authentication from BusProvider
      await authSignIn(normalizedEmail, password);

      if (!isRoleAllowed(activeRole, normalizedEmail)) {
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
    <div className="relative h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?q=80&w=2072&auto=format&fit=crop)',
        }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 h-full w-full flex flex-col lg:flex-row">
        <div className="w-full lg:flex-1 flex items-start lg:items-end justify-start px-6 sm:px-10 lg:px-14 pt-10 lg:pt-0 pb-8 lg:pb-14">
          <div className="max-w-3xl">
            <h1 className="text-7xl font-black text-white tracking-[0.105em] leading-none">CAMPUS</h1>
            <h1 className="text-7xl font-black text-white tracking-[0.06em] leading-none">TRANSIT</h1>
            <p className="mt-5 text-slate-300 text-base sm:text-lg max-w-xl">
              Next-gen real-time shuttle tracking for the modern university.
            </p>

            <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-white/90 text-sm font-semibold"> System Online</span>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[40%] min-h-[70vh] lg:min-h-0">
          <div className="h-full w-full backdrop-blur-xl bg-white/10 border-t border-white/20 lg:border-t-0 lg:border-l lg:border-white/20 flex flex-col items-center justify-center px-6 sm:px-10 py-10 lg:px-12 lg:py-14">
            <div className="w-full max-w-md">
              <div className="space-y-5">
                <GlassButton
                  title="Student Portal"
                  subtitle="Track routes and seat availability"
                  icon={<GraduationCap className="text-indigo-300" size={34} />}
                  onClick={() => openModal('student')}
                />
                <GlassButton
                  title="Driver Interface"
                  subtitle="Live navigation and stop updates"
                  icon={<Bus className="text-indigo-300" size={34} />}
                  onClick={() => openModal('driver')}
                />
                <GlassButton
                  title="Admin Dashboard"
                  subtitle="Fleet overview and route analytics"
                  icon={<ShieldCheck className="text-indigo-300" size={34} />}
                  onClick={() => openModal('admin')}
                />
              </div>
            </div>
          </div>
        </div>

        {activeRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <button type="button" className="absolute inset-0 bg-slate-950/60" onClick={closeModal} aria-label="Close" />

            <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-white/8 shadow-2xl backdrop-blur-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{modalTitle}</h2>
                  <p className="text-sm text-white/70 mt-1">Enter your email and password to continue.</p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} className="text-white/80" />
                </button>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSignIn}>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-white/20"
                    placeholder="name@university.edu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1">Password</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-white/20"
                  />
                </div>

                {error && <p className="text-sm font-semibold text-rose-300">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-full shadow-sm border border-indigo-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Signing In…' : 'Sign In'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const GlassButton: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, subtitle, icon, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl border border-white/20 bg-white/5 p-6 text-left shadow-md shadow-black/20 backdrop-blur-xl transition-all duration-300 ease-out hover:bg-white/10 hover:border-white/30 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(99,102,241,0.35),inset_0_1px_0_0_rgba(255,255,255,0.18)]"
    >
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-lg text-white font-bold">{title}</div>
          <div className="text-sm text-indigo-50 mt-1">{subtitle}</div>
        </div>
      </div>
    </button>
  );
};

export default Login;
