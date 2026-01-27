import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBus } from '../context/BusContext';
import { LogOut, User, Bus, ShieldCheck } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { userRole, authReady, signOut } = useBus();
  const navigate = useNavigate();

  useEffect(() => {
    if (authReady && !userRole) navigate('/');
  }, [authReady, userRole, navigate]);

  const handleLogout = () => {
    signOut().finally(() => navigate('/'));
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'student': return 'Student View';
      case 'driver': return 'Driver Interface';
      case 'admin': return 'Admin Dashboard';
      default: return 'Guest';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'student': return <User size={20} className="text-indigo-700" />;
      case 'driver': return <Bus size={20} className="text-indigo-700" />;
      case 'admin': return <ShieldCheck size={20} className="text-indigo-700" />;
      default: return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <header className="sticky top-0 z-50 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-indigo-700">Campus Transit</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
            {getRoleIcon()}
            <span className="text-sm font-medium text-slate-700">{getRoleLabel()}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-rose-600 transition-colors font-medium text-sm"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative bg-slate-50">
        {children}
      </main>
    </div>
  );
};

export default Layout;
