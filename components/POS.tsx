
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Wallet, 
  Banknote,
  ScanLine,
  Receipt,
  // Fix: Added missing icons Package and ShoppingCart
  Package,
  ShoppingCart
} from 'lucide-react';
import { Product, Transaction, TransactionItem, PaymentMethod } from '../types';
import { APP_CONFIG } from '../constants';

interface POSProps {
  products: Product[];
  onTransactionComplete: (tx: Transaction) => void;
}

const POS: React.FC<POSProps> = ({ products, onTransactionComplete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [isProcessing, setIsProcessing] = useState(false);

  // Derived state
  const filteredProducts = useMemo(() => 
    products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
  , [products, searchTerm]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const taxAmount = (subtotal - discountAmount) * APP_CONFIG.TAX_RATE;
  const total = subtotal - discountAmount + taxAmount;

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return alert('Stok habis!');
    
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
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

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.productId !== id));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      const newTx: Transaction = {
        id: `TX-${Date.now()}`,
        date: new Date().toISOString(),
        items: cart,
        total,
        tax: taxAmount,
        discountTotal: discountAmount,
        paymentMethod,
        cashierId: 'U001'
      };
      
      onTransactionComplete(newTx);
      setCart([]);
      setSearchTerm('');
      setIsProcessing(false);
      alert('Transaksi Berhasil!');
    }, 800);
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="flex-1 flex items-center bg-slate-100 px-4 py-2.5 rounded-xl">
            <Search size={20} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari SKU atau Nama Produk..." 
              className="bg-transparent border-none text-base ml-2 focus:ring-0 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
            <ScanLine size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4 no-scrollbar">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={`flex flex-col text-left bg-white rounded-2xl border border-slate-200 p-4 transition-all duration-200 active:scale-95 group relative ${
                product.stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-blue-500 hover:shadow-lg'
              }`}
            >
              <div className="mb-3 w-full aspect-square bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                <Package size={40} strokeWidth={1} />
              </div>
              <p className="text-xs text-slate-400 font-medium mb-1">{product.category}</p>
              <h4 className="font-bold text-slate-900 text-sm line-clamp-2 mb-2 group-hover:text-blue-600">{product.name}</h4>
              <div className="mt-auto flex justify-between items-end">
                <p className="text-blue-600 font-bold">Rp {product.sellPrice.toLocaleString()}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${product.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {product.stock} {product.unit}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart & Checkout Area */}
      <div className="w-full md:w-[400px] flex flex-col gap-4">
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Receipt size={20} className="text-blue-600" />
              Keranjang
            </h3>
            <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              {cart.reduce((a, b) => a + b.quantity, 0)} Items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {cart.map(item => (
              <div key={item.productId} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                <div className="flex-1">
                  <h5 className="text-sm font-semibold text-slate-900 leading-tight">{item.name}</h5>
                  <p className="text-xs text-slate-500 mt-1">@ Rp {item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateQuantity(item.productId, -1)}
                    className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.productId, 1)}
                    className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600"
                  >
                    <Plus size={14} />
                  </button>
                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    className="ml-1 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                <ShoppingCart size={48} strokeWidth={1} className="mb-4 opacity-20" />
                <p className="text-sm">Keranjang kosong</p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">Rp {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-slate-600">Diskon (%)</span>
              <input 
                type="number" 
                className="w-16 h-8 text-right bg-white border border-slate-200 rounded-lg text-sm px-2 focus:ring-blue-500"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>PPN (11%)</span>
              <span className="font-semibold text-slate-900">Rp {taxAmount.toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-900">Total Tagihan</span>
              <span className="text-xl font-black text-blue-600">Rp {total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setPaymentMethod(PaymentMethod.CASH)}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                paymentMethod === PaymentMethod.CASH ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-500'
              }`}
            >
              <Banknote size={18} />
              <span className="text-sm font-semibold">Tunai</span>
            </button>
            <button 
              onClick={() => setPaymentMethod(PaymentMethod.QRIS)}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                paymentMethod === PaymentMethod.QRIS ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-500'
              }`}
            >
              <ScanLine size={18} />
              <span className="text-sm font-semibold">QRIS</span>
            </button>
          </div>
          <button 
            disabled={cart.length === 0 || isProcessing}
            onClick={handleCheckout}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
              cart.length === 0 || isProcessing 
                ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
            }`}
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <CreditCard size={20} />
                Proses Pembayaran
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
