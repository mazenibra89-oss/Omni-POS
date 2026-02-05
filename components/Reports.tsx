
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Transaction, Product } from '../types';

interface ReportsProps {
  transactions: Transaction[];
  products: Product[];
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reports: React.FC<ReportsProps> = ({ transactions, products }) => {
  // Aggregate data for Top Products
  const productPerformance = products.map(p => {
    const totalSold = transactions.reduce((sum, tx) => {
      const item = tx.items.find(i => i.productId === p.id);
      return sum + (item?.quantity || 0);
    }, 0);
    return { name: p.name, sold: totalSold };
  }).sort((a, b) => b.sold - a.sold).slice(0, 5);

  const categoryData = ['Food', 'Drink', 'Personal Care', 'Kitchen'].map(cat => ({
    name: cat,
    value: products.filter(p => p.category === cat).reduce((sum, p) => sum + p.stock, 0)
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analitik & Laporan</h2>
          <p className="text-slate-500">Insight mendalam mengenai performa bisnis Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider text-slate-400">Top 5 Produk Terlaris</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="sold" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider text-slate-400">Distribusi Stok per Kategori</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: 12, paddingTop: 20}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-6">Ringkasan Margin</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Hari Ini', 'Minggu Ini', 'Bulan Ini'].map(period => (
            <div key={period} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-500 mb-1">{period}</p>
              <div className="flex items-baseline gap-2">
                <h4 className="text-xl font-black text-slate-900">Rp 12.4M</h4>
                <span className="text-[10px] font-bold text-green-500">+4.2%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Margin Keuntungan: 18%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
