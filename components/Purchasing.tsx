
import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShoppingCart,
  Trash2,
  Package
} from 'lucide-react';
import { Product, PurchaseOrder, PurchaseItem, PurchaseStatus } from '../types';

interface PurchasingProps {
  products: Product[];
  purchases: PurchaseOrder[];
  onAddPurchase: (purchase: PurchaseOrder) => void;
}

const Purchasing: React.FC<PurchasingProps> = ({ products, purchases, onAddPurchase }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<PurchaseItem[]>([]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(item => item.productId === product.id);
      if (exists) return prev;
      return [...prev, {
        productId: product.id,
        name: product.name,
        buyPrice: product.buyPrice,
        quantity: 1
      }];
    });
  };

  const updateCartItem = (id: string, field: keyof PurchaseItem, value: any) => {
    setCart(prev => prev.map(item => 
      item.productId === id ? { ...item, [field]: value } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.productId !== id));
  };

  const handleSubmit = (status: PurchaseStatus) => {
    if (!supplierName || cart.length === 0) return alert('Lengkapi data supplier dan item!');
    
    const totalAmount = cart.reduce((sum, item) => sum + (item.buyPrice * item.quantity), 0);
    
    const newPurchase: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      date: new Date().toISOString(),
      supplierName,
      items: cart,
      totalAmount,
      status,
      receivedDate: status === PurchaseStatus.RECEIVED ? new Date().toISOString() : undefined
    };

    onAddPurchase(newPurchase);
    setIsCreating(false);
    setCart([]);
    setSupplierName('');
  };

  const getStatusBadge = (status: PurchaseStatus) => {
    switch (status) {
      case PurchaseStatus.RECEIVED:
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold"><CheckCircle2 size={12} /> DITERIMA</span>;
      case PurchaseStatus.PENDING:
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold"><Clock size={12} /> PENDING</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Purchasing & Stock In</h2>
          <p className="text-slate-500">Kelola pengadaan barang dan update stok dari supplier.</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200"
          >
            <Plus size={20} />
            Buat Pembelian Baru
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {/* Product Selection */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center bg-slate-50 px-4 py-2 rounded-xl mb-4">
                <Search size={18} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari produk untuk dibeli..." 
                  className="bg-transparent border-none text-sm ml-2 focus:ring-0 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto no-scrollbar pr-1">
                {filteredProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="flex items-center gap-3 p-3 text-left bg-white border border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50/30 transition-all group"
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{p.name}</p>
                      <p className="text-[10px] text-slate-500">Stok: {p.stock} | SKU: {p.sku}</p>
                    </div>
                    <Plus size={16} className="ml-auto text-slate-300 group-hover:text-blue-600" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Purchase Details */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 mb-4">Ringkasan Pengadaan</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Supplier</label>
                    <input 
                      type="text" 
                      placeholder="Nama Supplier / Vendor"
                      className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] no-scrollbar">
                {cart.map(item => (
                  <div key={item.productId} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-bold text-slate-900">{item.name}</p>
                      <button onClick={() => removeFromCart(item.productId)} className="text-slate-300 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400">Harga Beli</label>
                        <input 
                          type="number" 
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                          value={item.buyPrice}
                          onChange={(e) => updateCartItem(item.productId, 'buyPrice', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Qty</label>
                        <input 
                          type="number" 
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                          value={item.quantity}
                          onChange={(e) => updateCartItem(item.productId, 'quantity', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {cart.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-40 py-10">
                    <ShoppingCart size={40} strokeWidth={1} />
                    <p className="text-xs mt-2">Belum ada item dipilih</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-500 font-medium">Total Estimasi</span>
                  <span className="text-lg font-black text-blue-600">
                    Rp {cart.reduce((s, i) => s + (i.buyPrice * i.quantity), 0).toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setIsCreating(false)}
                    className="py-2 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={() => handleSubmit(PurchaseStatus.RECEIVED)}
                    className="py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200"
                  >
                    Simpan & Stok In
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">ID Order</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Supplier</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Tgl Order</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchases.map(purchase => (
                <tr key={purchase.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-mono text-xs font-bold text-slate-900">{purchase.id}</p>
                    <p className="text-[10px] text-slate-400">{purchase.items.length} Items</p>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{purchase.supplierName}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(purchase.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(purchase.status)}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    Rp {purchase.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <ArrowRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400 italic">
                    Belum ada riwayat pengadaan barang.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Purchasing;
