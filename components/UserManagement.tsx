
import React from 'react';
import { ShieldCheck, UserPlus, Lock, ShieldAlert } from 'lucide-react';
import { UserRole } from '../types';

const UserManagement: React.FC = () => {
  const users = [
    { id: 'U001', name: 'Admin Utama', role: UserRole.ADMIN, email: 'admin@omnipos.id', lastActive: 'Active Now' },
    { id: 'U002', name: 'Budi Santoso', role: UserRole.CASHIER, email: 'budi.cashier@omnipos.id', lastActive: '2h ago' },
    { id: 'U003', name: 'Santi Wijaya', role: UserRole.OWNER, email: 'santi.owner@omnipos.id', lastActive: 'Yesterday' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User & Hak Akses</h2>
          <p className="text-slate-500">Kelola role pengguna dan pembatasan fitur sistem.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200">
          <UserPlus size={20} />
          Tambah User
        </button>
      </div>

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
