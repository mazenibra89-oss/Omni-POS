import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Lock, ShieldAlert, X } from 'lucide-react';
import { UserRole } from '../types';

const UserManagement: React.FC<{ currentUserRole?: UserRole }> = ({ currentUserRole }) => {
  const users = [
    { id: 'U001', name: 'Admin Utama', role: UserRole.ADMIN, email: 'admin@omnipos.id', lastActive: 'Active Now' },
    { id: 'U002', name: 'Budi Santoso', role: UserRole.CASHIER, email: 'budi.cashier@omnipos.id', lastActive: '2h ago' },
    { id: 'U003', name: 'Santi Wijaya', role: UserRole.OWNER, email: 'santi.owner@omnipos.id', lastActive: 'Yesterday' },
  ];
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: UserRole.CASHIER });
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotif(null);
    try {
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (!res.ok) {
        const errMsg = await res.text();
        setNotif({ type: 'error', msg: errMsg || 'Gagal menambah user.' });
        setLoading(false);
        return;
      }
      setNotif({ type: 'success', msg: 'User berhasil ditambahkan!' });
      setNewUser({ username: '', password: '', role: UserRole.CASHIER });
      setShowModal(false);
    } catch (err) {
      setNotif({ type: 'error', msg: 'Tidak dapat terhubung ke server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User & Hak Akses</h2>
          <p className="text-slate-500">Kelola role pengguna dan pembatasan fitur sistem.</p>
        </div>
        {currentUserRole === UserRole.OWNER && (
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200" onClick={() => setShowModal(true)}>
            <UserPlus size={20} />
            Tambah User
          </button>
        )}
      </div>
      {notif && (
        <div className={`rounded-xl px-4 py-3 text-sm font-bold mb-2 ${notif.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{notif.msg}</div>
      )}
      {/* Modal Tambah User */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <form onSubmit={handleAddUser} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-xs space-y-6 relative animate-zoom-in">
            <button type="button" className="absolute top-3 right-3 text-slate-400 hover:text-slate-700" onClick={() => setShowModal(false)}><X size={20} /></button>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Tambah User Baru</h3>
            <div>
              <label className="block text-sm font-semibold mb-1">Username</label>
              <input className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900 font-bold shadow-sm" value={newUser.username} onChange={e => setNewUser(u => ({ ...u, username: e.target.value }))} required autoFocus disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Password</label>
              <input type="password" className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900 font-bold shadow-sm" value={newUser.password} onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))} required disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Role</label>
              <select className="w-full border border-blue-200 rounded-lg px-3 py-2 bg-blue-50 text-blue-900 font-bold shadow-sm" value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value as UserRole }))} required disabled={loading}>
                <option value={UserRole.ADMIN}>Admin</option>
                <option value={UserRole.CASHIER}>Cashier</option>
                <option value={UserRole.OWNER}>Owner</option>
                <option value={UserRole.CUSTOMER}>Customer</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95" disabled={loading}>{loading ? 'Menyimpan...' : 'Tambah User'}</button>
          </form>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
            <div className="absolute top-0 right-0 p-4">
              <button className="text-slate-300 hover:text-slate-600">
                <Lock size={18} />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                {user.role === UserRole.ADMIN ? <ShieldCheck className="text-blue-600" /> : <ShieldAlert className="text-amber-600" />}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{user.name}</h4>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Role</span>
                <span className={`font-bold ${user.role === UserRole.ADMIN ? 'text-blue-600' : 'text-slate-900'}`}>{user.role}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Status</span>
                <span className="text-green-500 font-semibold">{user.lastActive}</span>
              </div>
            </div>
            <button className="w-full mt-6 py-2 border border-slate-100 rounded-lg text-xs font-bold text-slate-400 group-hover:bg-slate-50 group-hover:text-slate-600 transition-all">
              Kelola Permissions
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-900 text-white p-8 rounded-3xl relative overflow-hidden shadow-2xl shadow-blue-200">
        <div className="relative z-10 max-w-xl">
          <h3 className="text-xl font-bold mb-2">Role Based Access Control (RBAC)</h3>
          <p className="text-blue-200 text-sm leading-relaxed mb-6">
            Sistem ini menggunakan pengamanan tingkat tinggi. Setiap tindakan (Penjualan, Opname, Penghapusan Stok) akan tercatat dalam Audit Log untuk akuntabilitas.
          </p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-white/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Audit Trail Enabled
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-white/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Two-Factor Auth
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 right-[-5%] -translate-y-1/2 opacity-10">
          <ShieldCheck size={280} strokeWidth={1} />
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
