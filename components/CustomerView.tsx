import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  ChevronLeft, 
  CreditCard, 
  Utensils, 
  Clock,
  Heart,
  Star,
  CheckCircle2,
  // Added missing UserCircle and Coffee icons
  UserCircle,
  Coffee
} from 'lucide-react';
import { Product, Transaction, TransactionItem, PaymentMethod } from '../types';
import { CATEGORIES, APP_CONFIG } from '../constants';

// Fix for QRCode import (support both CJS and ESM)
const QRCodeComponent = (props: any) => {
  const QR = require('qrcode.react');
  const QRCodeCanvas = QR.QRCodeCanvas || QR.default || QR;
  return <QRCodeCanvas {...props} />;
};

interface CustomerViewProps {
  products: Product[];
  onOrderComplete: (tx: Transaction) => void;
}

const CustomerView: React.FC<CustomerViewProps> = ({ products, onOrderComplete }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', table: '05' });
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PaymentMethod.QRIS);
  const [formError, setFormError] = useState('');
  const [isSplitBill, setIsSplitBill] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [splitPayments, setSplitPayments] = useState<{ paid: boolean }[]>([]);

  // State untuk mapping item ke orang
  const [splitAssignments, setSplitAssignments] = useState<{ [personIdx: number]: { [productId: string]: number } }>({});

  // Helper: total per orang (dengan PPN dibagi proporsional per item)
  const getPersonTotal = (personIdx: number) => {
    const assignments = splitAssignments[personIdx] || {};
    let sum = 0;
    Object.entries(assignments).forEach(([productId, qty]) => {
      const item = cart.find(i => i.productId === productId);
      if (item) {
        // Hitung harga per item + PPN proporsional
        const itemSubtotal = Number(item.price) * Number(qty);
        const itemTax = itemSubtotal * APP_CONFIG.TAX_RATE;
        sum += itemSubtotal + itemTax;
      }
    });
    return sum;
  };

  // Helper: sisa qty item yang belum dipilih siapa pun
  const getItemRemaining = (productId: string) => {
    let assigned = 0;
    Object.values(splitAssignments).forEach(person => {
      assigned += person[productId] || 0;
    });
    const item = cart.find(i => i.productId === productId);
    return item ? item.quantity - assigned : 0;
  };

  // Filter products
  const filteredProducts = useMemo(() => 
    products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    })
  , [products, searchTerm, activeCategory]);

  const cartCount = cart.reduce((a, b) => a + b.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * APP_CONFIG.TAX_RATE;
  const total = subtotal + tax;

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(i => i.productId === product.id);
      if (exists) {
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.sellPrice,
        quantity: 1,
        discount: 0
      }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.productId === id) {
        return { ...i, quantity: Math.max(0, i.quantity + delta) };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!customerInfo.name.trim() || !customerInfo.table.trim()) {
      setFormError('Nama dan nomor meja wajib diisi.');
      setShowCustomerForm(true);
      return;
    }
    setFormError('');
    const newTx: Transaction = {
      id: `CUST-${Date.now()}`,
      date: new Date().toISOString(),
      items: cart,
      total,
      tax,
      discountTotal: 0,
      paymentMethod,
      cashierId: 'SELF-SERVICE',
      customerName: customerInfo.name,
      tableNumber: customerInfo.table
    };
    onOrderComplete(newTx);
    setIsSuccess(true);
    setCart([]);
    setShowCustomerForm(false);
  };

  // Split bill logic
  React.useEffect(() => {
    if (isSplitBill && paymentMethod === PaymentMethod.QRIS) {
      setSplitPayments(Array(splitCount).fill(null).map(() => ({ paid: false })));
    } else {
      setSplitPayments([]);
    }
  }, [isSplitBill, splitCount, paymentMethod]);

  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white animate-in zoom-in duration-300">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Pesanan Terkirim!</h2>
        <p className="text-slate-500 mb-2 max-w-xs">Terima kasih atas pesanan Anda. Silakan tunggu di Meja {customerInfo.table}.</p>
        <p className="text-slate-500 mb-8 max-w-xs">Metode Pembayaran: <span className="font-bold text-blue-600">{paymentMethod === PaymentMethod.QRIS ? 'QRIS' : 'Tunai'}</span></p>
        {paymentMethod === PaymentMethod.CASH && (
          <div className="mb-6 text-center text-sm text-amber-600 font-bold bg-amber-50 rounded-xl py-3">Silahkan bayar di kasir</div>
        )}
        <button 
          onClick={() => setIsSuccess(false)}
          className="w-full max-w-xs py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200"
        >
          Pesan Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-md mx-auto w-full bg-slate-50 shadow-2xl overflow-hidden relative">
      {/* Header */}
      <header className="p-6 pb-4 bg-white">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Utensils size={24} />
            </div>
            <div>
              <h1 className="font-black text-xl text-slate-900 leading-none">OmniPOS</h1>
              <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
                <Star size={12} className="text-amber-400 fill-amber-400" /> 4.9 • Meja {customerInfo.table}
              </p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <UserCircle size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari makanan favoritmu..."
            className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6">
          {['All', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-white text-slate-500 border border-slate-100 hover:border-blue-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Menu Grid */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar pb-32">
        <h3 className="font-black text-slate-900 text-lg">Pilihan Menu</h3>
        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map(product => {
            const inCart = cart.find(i => i.productId === product.id);
            return (
              <div 
                key={product.id}
                className="bg-white p-4 rounded-3xl border border-slate-100 flex gap-4 transition-all group shadow-sm hover:shadow-md"
              >
                <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 relative shrink-0">
                  <Coffee size={32} />
                  <button className="absolute top-1 right-1 p-1.5 bg-white/80 backdrop-blur rounded-full text-slate-300 hover:text-red-500">
                    <Heart size={14} />
                  </button>
                </div>
                <div className="flex-1 flex flex-col py-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900">{product.name}</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">{product.category} • {product.unit}</p>
                  <div className="mt-auto flex justify-between items-center">
                    <p className="font-black text-blue-600">Rp {product.sellPrice.toLocaleString()}</p>
                    {inCart ? (
                      <div className="flex items-center gap-3 bg-slate-100 rounded-xl p-1">
                        <button 
                          onClick={() => { console.log('Kurangi', product.id); updateQty(product.id, -1); }}
                          className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm text-slate-600 focus:ring-2 focus:ring-blue-300 active:bg-blue-50 transition"
                          style={{ touchAction: 'manipulation' }}
                          aria-label="Kurangi"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="text-sm font-black text-slate-900 min-w-[24px] text-center select-none">{inCart.quantity}</span>
                        <button 
                          onClick={() => { console.log('Tambah', product.id); updateQty(product.id, 1); }}
                          className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm text-slate-600 focus:ring-2 focus:ring-blue-300 active:bg-blue-50 transition"
                          style={{ touchAction: 'manipulation' }}
                          aria-label="Tambah"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { console.log('Add to cart', product.id); addToCart(product); }}
                        className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 active:bg-blue-700 transition"
                        style={{ touchAction: 'manipulation' }}
                        aria-label="Tambah ke keranjang"
                      >
                        <Plus size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <div className="absolute bottom-6 left-6 right-6 z-20">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-slate-900 text-white p-4 rounded-3xl flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom-8 duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center relative">
                <ShoppingCart size={20} />
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
                  {cartCount}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Pesanan</p>
                <p className="font-black text-sm">Rp {total.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-bold text-sm">
              Lihat Keranjang <ChevronLeft size={16} className="rotate-180" />
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer (Simulated) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm p-0 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-t-[40px] p-8 pb-10 shadow-2xl animate-in slide-in-from-bottom-full duration-500">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8 cursor-pointer" onClick={() => setIsCartOpen(false)}></div>
            <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <ShoppingCart className="text-blue-600" /> Pesanan Kamu
            </h3>
            
            <div className="max-h-[300px] overflow-y-auto pr-2 no-scrollbar mb-8">
              {cart.map(item => (
                <div key={item.productId} className="flex items-center justify-between py-4 border-b border-slate-50">
                  <div>
                    <h5 className="font-bold text-slate-900">{item.name}</h5>
                    <p className="text-xs text-slate-400 font-medium">Rp {item.price.toLocaleString()} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl">
                    <button onClick={() => updateQty(item.productId, -1)} className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-600 focus:ring-2 focus:ring-blue-300 active:bg-blue-50 transition" style={{ touchAction: 'manipulation' }} aria-label="Kurangi"><Minus size={16}/></button>
                    <span className="font-black text-slate-900 min-w-[24px] text-center select-none">{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, 1)} className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-600 focus:ring-2 focus:ring-blue-300 active:bg-blue-50 transition" style={{ touchAction: 'manipulation' }} aria-label="Tambah"><Plus size={16}/></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-8">
               <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">Rp {subtotal.toLocaleString()}</span>
              </div>
               <div className="flex justify-between text-sm text-slate-500">
                <span>PPN (11%)</span>
                <span className="font-bold text-slate-900">Rp {tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <span className="font-black text-slate-900">Total Pembayaran</span>
                <span className="text-2xl font-black text-blue-600">Rp {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Split Bill Section */}
            {paymentMethod === PaymentMethod.QRIS && (
              <div className="mb-6">
                <button
                  className={`w-full py-3 rounded-2xl font-bold text-sm border-2 ${isSplitBill ? 'bg-blue-50 border-blue-600 text-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}
                  onClick={() => setIsSplitBill(v => !v)}
                >
                  {isSplitBill ? 'Tutup Split Bill' : 'Split Bill dengan Teman'}
                </button>
                {isSplitBill && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-2xl">
                    <label className="block text-slate-700 text-xs font-bold mb-2">Jumlah Orang</label>
                    <div className="flex items-center gap-2 mb-4">
                      <button onClick={() => setSplitCount(c => Math.max(2, c-1))} className="w-8 h-8 rounded-full bg-white border border-blue-200 flex items-center justify-center text-blue-600 font-black text-lg">-</button>
                      <input
                        type="number"
                        min={2}
                        value={splitCount}
                        onChange={e => setSplitCount(Math.max(2, Number(e.target.value)))}
                        className="w-12 text-center font-black text-blue-600 bg-white rounded-lg border border-blue-200"
                      />
                      <button onClick={() => setSplitCount(c => c+1)} className="w-8 h-8 rounded-full bg-white border border-blue-200 flex items-center justify-center text-blue-600 font-black text-lg">+</button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 max-h-64 overflow-y-auto pr-2">
                      {Array.from({ length: splitCount }).map((_, personIdx) => (
                        <div key={personIdx} className="bg-white rounded-xl p-3 flex flex-col border border-blue-100">
                          <div className="text-xs text-slate-500 mb-2 font-bold">Orang #{personIdx+1}</div>
                          <div className="space-y-2 mb-2">
                            {cart.map(item => {
                              const assignedQty = (splitAssignments[personIdx]?.[item.productId]) || 0;
                              const remaining = getItemRemaining(item.productId) + assignedQty;
                              return (
                                <div key={item.productId} className="flex items-center justify-between gap-2 text-xs">
                                  <span>{item.name} <span className="text-slate-400">x{item.quantity}</span></span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      disabled={assignedQty === 0}
                                      onClick={() => setSplitAssignments(prev => ({
                                        ...prev,
                                        [personIdx]: {
                                          ...prev[personIdx],
                                          [item.productId]: Math.max(0, assignedQty - 1)
                                        }
                                      }))}
                                      className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-blue-600 font-black text-base disabled:opacity-40"
                                    >-</button>
                                    <span className="w-5 text-center font-bold">{assignedQty}</span>
                                    <button
                                      disabled={getItemRemaining(item.productId) === 0}
                                      onClick={() => setSplitAssignments(prev => ({
                                        ...prev,
                                        [personIdx]: {
                                          ...prev[personIdx],
                                          [item.productId]: assignedQty + 1
                                        }
                                      }))}
                                      className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-blue-600 font-black text-base disabled:opacity-40"
                                    >+</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="text-xs text-slate-500 mb-1">Total: <span className="font-black text-blue-600">Rp {getPersonTotal(personIdx).toLocaleString()}</span></div>
                          {/* Tombol konfirmasi split bill per orang */}
                          <button
                            className={`w-full py-2 mt-2 rounded-xl font-bold text-xs border-2 ${splitPayments[personIdx]?.paid ? 'bg-green-50 border-green-600 text-green-600' : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'}`}
                            disabled={Object.entries(splitAssignments[personIdx] || {}).reduce((a, [pid, qty]) => a + Number(qty), 0) === 0 || splitPayments[personIdx]?.paid || cart.some(item => getItemRemaining(item.productId) > 0)}
                            onClick={() => {
                              setSplitPayments(prev => prev.map((p, idx) => idx === personIdx ? { paid: true } : p));
                              alert('QR untuk pembayaran Orang #' + (personIdx+1) + ' muncul (simulasi)');
                            }}
                          >
                            {splitPayments[personIdx]?.paid ? 'Sudah Dibayar' : 'Konfirmasi & Bayar'}
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* Validasi: blokir konfirmasi jika pembagian item belum sesuai */}
                    {cart.some(item => getItemRemaining(item.productId) > 0) && (
                      <div className="mt-3 text-xs text-red-500 font-bold">Pembagian item belum sesuai total pesanan. Pastikan semua item sudah dibagi.</div>
                    )}
                  </div>
                )}
              </div>
            )}
            {paymentMethod !== PaymentMethod.QRIS && isSplitBill && (
              <div className="mb-6 text-xs text-red-500">Split bill hanya tersedia untuk pembayaran QRIS.</div>
            )}

            {/* Tombol konfirmasi/lanjutkan split bill di bawah */}
            {isSplitBill && paymentMethod === PaymentMethod.QRIS ? (
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsSplitBill(false);
                  setCart([]);
                  setSplitAssignments({});
                  setSplitPayments([]);
                  setSplitCount(2);
                  setShowCustomerForm(false);
                  setIsSuccess(true);
                }}
                className={`w-full py-5 rounded-3xl font-black text-lg shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 transition-all ${splitPayments.every(p => p.paid) ? 'bg-green-600 text-white' : 'bg-slate-300 text-white cursor-not-allowed'}`}
                disabled={!splitPayments.every(p => p.paid)}
              >
                Lanjutkan
              </button>
            ) : (
              <button 
                onClick={() => setShowCustomerForm(true)}
                className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 transition-all"
                disabled={cart.length === 0}
              >
                <CreditCard size={20} />
                Konfirmasi & Bayar
              </button>
            )}
            <button 
              onClick={() => setIsCartOpen(false)}
              className="w-full mt-4 py-3 text-slate-400 font-bold text-sm hover:text-slate-600"
            >
              Kembali Pilih Menu
            </button>
          </div>
        </div>
      )}

      {/* Customer Info & Payment Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-xs bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-xl font-black text-slate-900 mb-6">Data Pemesan</h3>
            <div className="mb-4">
              <label className="block text-slate-700 text-sm font-bold mb-2">Nama</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                value={customerInfo.name}
                onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                placeholder="Nama pemesan"
              />
            </div>
            <div className="mb-4">
              <label className="block text-slate-700 text-sm font-bold mb-2">Nomor Meja</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                value={customerInfo.table}
                onChange={e => setCustomerInfo({ ...customerInfo, table: e.target.value })}
                placeholder="Contoh: 05"
              />
            </div>
            <div className="mb-4">
              <label className="block text-slate-700 text-sm font-bold mb-2">Metode Pembayaran</label>
              <div className="flex gap-3">
                <button
                  className={`flex-1 py-3 rounded-xl font-bold border-2 ${paymentMethod === PaymentMethod.QRIS ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200'}`}
                  onClick={() => setPaymentMethod(PaymentMethod.QRIS)}
                >QRIS</button>
                <button
                  className={`flex-1 py-3 rounded-xl font-bold border-2 ${paymentMethod === PaymentMethod.CASH ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200'}`}
                  onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                >Tunai</button>
              </div>
            </div>
            {formError && <div className="text-red-500 text-sm mb-4">{formError}</div>}
            <button
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 mb-2"
              onClick={() => { setShowCustomerForm(false); handleCheckout(); }}
            >Konfirmasi Pesanan</button>
            <button
              className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600"
              onClick={() => setShowCustomerForm(false)}
            >Batal</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerView;
