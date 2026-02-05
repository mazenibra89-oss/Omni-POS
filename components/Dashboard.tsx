
import React from 'react';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Product, Transaction, OpnameSession } from '../types';

interface DashboardProps {
  products: Product[];
  transactions: Transaction[];
  opnameSessions: OpnameSession[];
}

const Dashboard: React.FC<DashboardProps> = ({ products, transactions, opnameSessions }) => {
  const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * p.buyPrice), 0);
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  // Chart Data
  const salesData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 5000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  const StatCard = ({ title, value, subValue, icon: Icon, color, trend }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          {subValue && (
            <div className="flex items-center mt-2">
              <span className={`flex items-center text-xs font-semibold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trend === 'up' ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
                {subValue}
              </span>
              <span className="text-xs text-slate-400 ml-1.5">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Export Report</button>
          <button className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-md shadow-blue-200">Date Filter</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Penjualan" 
          value={`Rp ${totalSales.toLocaleString()}`} 
          subValue="12.5%" 
          trend="up" 
          icon={TrendingUp} 
          color="blue" 
        />
        <StatCard 
          title="Nilai Inventory" 
          value={`Rp ${totalInventoryValue.toLocaleString()}`} 
          subValue="3.2%" 
          trend="down" 
          icon={Package} 
          color="emerald" 
        />
        <StatCard 
          title="Total Transaksi" 
          value={transactions.length} 
          subValue="8.1%" 
          trend="up" 
          icon={ShoppingCart} 
          color="purple" 
        />
        <StatCard 
          title="Low Stock Alert" 
          value={lowStockProducts.length} 
          icon={AlertTriangle} 
          color="amber" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-slate-900">Sales Trend</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                <span className="text-xs text-slate-500">Revenue</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#2563eb', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Recent Activities CONTOH</h3>
          <div className="space-y-6">
            {transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <ShoppingCart size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">Sale #{tx.id.slice(-5)}</p>
                  <p className="text-xs text-slate-500">Transaction completed</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">Rp {tx.total.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">2 min ago</p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm">No recent transactions</p>
              </div>
            )}
          </div>
          <button className="w-full mt-6 py-2.5 text-blue-600 text-sm font-semibold hover:bg-blue-50 rounded-xl transition-colors">
            View All History
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
