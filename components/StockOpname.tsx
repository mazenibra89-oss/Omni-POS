
import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  Eye,
  FileDown,
  ChevronDown,
  Search,
  Check
} from 'lucide-react';
import { Product, OpnameSession, OpnameStatus, UserRole, OpnameDetail } from '../types';

interface StockOpnameProps {
  products: Product[];
  sessions: OpnameSession[];
  onUpdateSession: (session: OpnameSession) => void;
  userRole: UserRole;
}

const StockOpname: React.FC<StockOpnameProps> = ({ products, sessions, onUpdateSession, userRole }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSession, setSelectedSession] = useState<OpnameSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create New Session State
  const [newDetails, setNewDetails] = useState<OpnameDetail[]>([]);

  const handleCreateNew = () => {
    const details: OpnameDetail[] = products.map(p => ({
      productId: p.id,
      productName: p.name,
      systemStock: p.stock,
      physicalStock: p.stock, // Default to system stock
      difference: 0
    }));
    setNewDetails(details);
    setIsCreating(true);
  };

  const handleSaveDraft = () => {
    const session: OpnameSession = {
      id: `SO-${Date.now()}`,
      date: new Date().toISOString(),
      status: OpnameStatus.DRAFT,
      createdBy: 'U001',
      details: newDetails,
      notes: 'Initial Stock Audit'
    };
    onUpdateSession(session);
    setIsCreating(false);
  };

  const handlePropose = (session: OpnameSession) => {
    onUpdateSession({ ...session, status: OpnameStatus.PROPOSED });
    setSelectedSession(null);
  };

  const handleApprove = (session: OpnameSession) => {
    if (userRole === UserRole.CASHIER) return alert('Hanya Admin/Owner yang bisa Approve!');
    onUpdateSession({ ...session, status: OpnameStatus.APPROVED, approvedBy: 'U001' });
    setSelectedSession(null);
  };

  const getStatusBadge = (status: OpnameStatus) => {
    switch (status) {
      case OpnameStatus.DRAFT:
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold"><Clock size={12} /> DRAFT</span>;
      case OpnameStatus.PROPOSED:
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold"><AlertCircle size={12} /> MENUNGGU APPROVAL</span>;
      case OpnameStatus.APPROVED:
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold"><CheckCircle2 size={12} /> DISETUJUI</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Stock Opname</h2>
          <p className="text-slate-500">Pencocokan stok fisik dengan data sistem secara berkala.</p>
        </div>
        {!isCreating && (
          <button 
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200"
          >
            <Plus size={20} />
            Sesi Opname Baru
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Input Stok Fisik</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button 
                onClick={handleSaveDraft}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700"
              >
                Simpan Sesi
              </button>
            </div>
          </div>
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-lg max-w-sm">
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari produk dalam list..." 
                className="bg-transparent border-none text-sm ml-2 focus:ring-0 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                  <th className="px-6 py-4">Nama Produk</th>
                  <th className="px-6 py-4">Stok Sistem</th>
                  <th className="px-6 py-4">Stok Fisik</th>
                  <th className="px-6 py-4">Selisih</th>
                  <th className="px-6 py-4">Status Selisih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {newDetails
                  .filter(d => d.productName.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((detail, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">{detail.productName}</td>
                      <td className="px-6 py-4">{detail.systemStock}</td>
                      <td className="px-6 py-4">
                        <input 
                          type="number" 
                          className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-sm font-bold focus:ring-blue-500"
                          value={detail.physicalStock}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setNewDetails(prev => prev.map((d, i) => i === idx ? {
                              ...d, 
                              physicalStock: val, 
                              difference: val - d.systemStock
                            } : d));
                          }}
                        />
                      </td>
                      <td className={`px-6 py-4 font-bold ${detail.difference > 0 ? 'text-green-600' : detail.difference < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                        {detail.difference > 0 ? `+${detail.difference}` : detail.difference}
                      </td>
                      <td className="px-6 py-4">
                        {detail.difference === 0 ? (
                          <span className="text-xs text-slate-400">Match</span>
                        ) : (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${detail.difference < 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            Adjust Needed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* History List */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">ID Sesi</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Tanggal</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Item Berbeda</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.map(session => (
                    <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm font-bold text-slate-900">{session.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(session.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(session.status)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-red-600">
                          {session.details.filter(d => d.difference !== 0).length} Items
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedSession(session)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sessions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-slate-400 italic">
                        Belum ada riwayat stock opname.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details Sidebar / Selection */}
          <div className="space-y-4">
            {selectedSession ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900">Detail Sesi</h3>
                    <button onClick={() => setSelectedSession(null)} className="text-slate-400 hover:text-slate-600">×</button>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mb-4">{selectedSession.id}</p>
                  {getStatusBadge(selectedSession.status)}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                  {selectedSession.details.filter(d => d.difference !== 0).map((d, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{d.productName}</p>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-slate-500">Sys: {d.systemStock} | Phys: {d.physicalStock}</span>
                        <span className={`text-xs font-black ${d.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {d.difference > 0 ? `+${d.difference}` : d.difference}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
                  {selectedSession.status === OpnameStatus.DRAFT && (
                    <button 
                      onClick={() => handlePropose(selectedSession)}
                      className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md shadow-blue-200"
                    >
                      Ajukan Approval
                    </button>
                  )}
                  {selectedSession.status === OpnameStatus.PROPOSED && userRole !== UserRole.CASHIER && (
                    <button 
                      onClick={() => handleApprove(selectedSession)}
                      className="w-full py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-md shadow-green-200 flex items-center justify-center gap-2"
                    >
                      <Check size={18} /> Approve & Sync Stok
                    </button>
                  )}
                  <button className="w-full py-2 text-slate-600 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2">
                    <FileDown size={16} /> Export PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                <ClipboardList size={40} strokeWidth={1} className="mx-auto text-slate-200 mb-4" />
                <p className="text-sm text-slate-500">Pilih sesi untuk melihat detail dan melakukan approval.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockOpname;
