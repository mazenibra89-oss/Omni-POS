import React from 'react';
import { UserRole } from '../types';
import { UserCircle, LogIn } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: { username: string; role: UserRole }) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500 animate-fade-in">
      <div className="bg-white/90 p-8 rounded-2xl shadow-2xl w-full max-w-xs space-y-7 border border-blue-100 animate-zoom-in flex flex-col items-center">
        <div className="flex flex-col items-center mb-2">
          <div className="bg-blue-600 rounded-full p-3 shadow-lg mb-2 animate-bounce-in">
            <UserCircle size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-blue-700 tracking-tight">Login</h2>
          <p className="text-xs text-slate-400 mt-1">Akses aplikasi kasir resto</p>
        </div>
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 text-lg"
          onClick={() => onLogin({ username: 'owner', role: UserRole.OWNER })}
        >
          Masuk sebagai Owner
        </button>
        <button
          className="w-full bg-slate-100 hover:bg-slate-200 text-blue-600 py-3 rounded-xl font-bold shadow transition-all active:scale-95 text-lg mt-3"
          onClick={() => onLogin({ username: 'customer', role: UserRole.CUSTOMER })}
        >
          Masuk sebagai Customer
        </button>
        <div className="text-[10px] text-slate-400 text-center mt-4">* Anda akan langsung masuk ke menu Owner atau Customer.</div>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s; }
        .animate-zoom-in { animation: zoomIn 0.5s; }
        .animate-bounce-in { animation: bounceIn 0.7s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes bounceIn { 0% { transform: scale(0.7); } 60% { transform: scale(1.1); } 100% { transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default LoginPage;
