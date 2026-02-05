import React, { useState } from 'react';
import { UserRole } from '../types';
import { UserCircle, Lock, LogIn, UserPlus } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: { username: string; role: UserRole }) => void;
}

const users = [
  { username: 'owner', password: 'owner123', role: UserRole.OWNER },
  { username: 'admin', password: 'admin123', role: UserRole.ADMIN },
  { username: 'cashier', password: 'cashier123', role: UserRole.CASHIER },
];

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [registerRole, setRegisterRole] = useState<UserRole>(UserRole.CASHIER);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isRegister) {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:3001/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, role: registerRole })
        });
        if (!res.ok) {
          const errMsg = await res.text();
          setError(errMsg || 'Registrasi gagal.');
          setLoading(false);
          return;
        }
        setRegisterSuccess(true);
        setTimeout(() => {
          setIsRegister(false);
          setRegisterSuccess(false);
          setUsername('');
          setPassword('');
        }, 1500);
      } catch (err) {
        setError('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
      } finally {
        setLoading(false);
      }
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        setError('Login gagal. Username atau password salah.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      // Simpan token ke localStorage
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      // Kirim user ke parent
      const user = data.user;
      if (!user || !user.username || !user.role) {
        setError('Login gagal. Data user tidak valid.');
        setLoading(false);
        return;
      }
      onLogin({ username: user.username, role: user.role });
    } catch (err) {
      setError('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500 animate-fade-in">
      <form onSubmit={handleSubmit} className="bg-white/90 p-8 rounded-2xl shadow-2xl w-full max-w-xs space-y-7 border border-blue-100 animate-zoom-in">
        <div className="flex flex-col items-center mb-2">
          <div className="bg-blue-600 rounded-full p-3 shadow-lg mb-2 animate-bounce-in">
            <UserCircle size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-blue-700 tracking-tight">{isRegister ? 'Register' : 'Login'}</h2>
          <p className="text-xs text-slate-400 mt-1">Akses aplikasi kasir resto</p>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-blue-700">Username</label>
          <div className="relative">
            <input
              className="w-full border border-blue-200 rounded-lg px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900 font-bold shadow-sm"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              disabled={registerSuccess || loading}
            />
            <UserCircle size={18} className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-300" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-blue-700">Password</label>
          <div className="relative">
            <input
              type="password"
              className="w-full border border-blue-200 rounded-lg px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900 font-bold shadow-sm"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={registerSuccess || loading}
            />
            <Lock size={18} className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-300" />
          </div>
        </div>
        {isRegister && (
          <div>
            <label className="block text-sm font-semibold mb-1 text-blue-700">Role</label>
            <select
              className="w-full border border-blue-200 rounded-lg px-3 py-2 bg-blue-50 text-blue-900 font-bold shadow-sm"
              value={registerRole}
              onChange={e => setRegisterRole(e.target.value as UserRole)}
              disabled={registerSuccess || loading}
            >
              <option value={UserRole.OWNER}>Owner</option>
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.CASHIER}>Cashier</option>
            </select>
          </div>
        )}
        {error && <div className="text-red-500 text-sm text-center animate-shake">{error}</div>}
        {registerSuccess && <div className="text-green-600 text-sm text-center animate-pulse">Registrasi berhasil! Silakan login.</div>}
        <button
          type="submit"
          className={`w-full flex items-center justify-center gap-2 ${isRegister ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 rounded-xl font-bold shadow-lg transition-all active:scale-95`}
          disabled={registerSuccess || loading}
        >
          {loading ? (
            <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          ) : isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
          {isRegister ? 'Register' : loading ? 'Loading...' : 'Login'}
        </button>
        {/* Tombol login sebagai customer */}
        {!isRegister && (
          <div className="text-center mt-2">
            <button
              type="button"
              className="text-blue-600 hover:underline text-xs font-semibold"
              onClick={() => onLogin({ username: 'customer', role: UserRole.CUSTOMER })}
            >
              Masuk sebagai customer
            </button>
          </div>
        )}
        {/* Hanya tampilkan tombol register jika login sebagai Owner */}
        {!isRegister && username.toLowerCase() === 'owner' && (
          <div className="text-center mt-2">
            <button type="button" className="text-blue-600 hover:underline text-xs font-semibold" onClick={() => { setIsRegister(true); setError(''); setRegisterRole(UserRole.OWNER); }}>
              Register akun Owner
            </button>
          </div>
        )}
        <div className="text-[10px] text-slate-400 text-center mt-4">* Register terhubung ke backend. Pastikan endpoint /register aktif.</div>
      </form>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s; }
        .animate-zoom-in { animation: zoomIn 0.5s; }
        .animate-bounce-in { animation: bounceIn 0.7s; }
        .animate-shake { animation: shake 0.3s; }
        .animate-pulse { animation: pulse 1s infinite; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes bounceIn { 0% { transform: scale(0.7); } 60% { transform: scale(1.1); } 100% { transform: scale(1); } }
        @keyframes shake { 0% { transform: translateX(0); } 25% { transform: translateX(-4px); } 50% { transform: translateX(4px); } 75% { transform: translateX(-4px); } 100% { transform: translateX(0); } }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default LoginPage;
