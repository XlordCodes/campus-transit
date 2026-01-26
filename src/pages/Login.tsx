import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBus } from '../context/BusContext';
import { GraduationCap, Bus, ShieldCheck, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUserRole } = useBus();

  const handleLogin = (role: 'student' | 'driver' | 'admin') => {
    setUserRole(role);
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-xl shadow-sm p-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-800">Campus Transit Login</h1>
          <p className="text-slate-500">Select your role to continue.</p>
        </div>

        <div className="space-y-4">
          <RoleButton 
            title="Student Portal" 
            icon={<GraduationCap size={24} />}
            onClick={() => handleLogin('student')}
          />
          <RoleButton 
            title="Driver Interface" 
            icon={<Bus size={24} />}
            onClick={() => handleLogin('driver')}
          />
          <RoleButton 
            title="Admin Dashboard" 
            icon={<ShieldCheck size={24} />}
            onClick={() => handleLogin('admin')}
          />
        </div>
      </div>
    </div>
  );
};

interface RoleButtonProps {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const RoleButton: React.FC<RoleButtonProps> = ({ title, icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-between transition-colors group shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="bg-white/20 p-2 rounded-md">
          {icon}
        </div>
        <span className="text-lg font-medium">{title}</span>
      </div>
      <ArrowRight className="text-blue-200 group-hover:text-white group-hover:translate-x-1 transition-all" />
    </button>
  );
};

export default Login;
