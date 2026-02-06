import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  ClipboardCheck, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  Menu,
  Bell,
  Search,
  UserCircle,
  Truck,
  Coffee
} from 'lucide-react';
import { UserRole, Product, Transaction, OpnameSession, OpnameStatus, PurchaseOrder, PurchaseStatus } from './types';
import { INITIAL_PRODUCTS, APP_CONFIG } from './constants';

// Sub-components (Views)
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import StockOpname from './components/StockOpname';
import Reports from './components/Reports';
import UserManagement from './components/UserManagement';
import Purchasing from './components/Purchasing';
import CustomerView from './components/CustomerView';
import LoginPage from './components/LoginPage';

const App: React.FC = () => {
  // Pindahkan semua useState ke atas
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'inventory' | 'opname' | 'reports' | 'users' | 'purchasing' | 'customer'>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState<{ username: string; role: UserRole } | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: UserRole } | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [opnameSessions, setOpnameSessions] = useState<OpnameSession[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  // Tambahkan ini ke atas
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Derived Alerts
  const lowStockCount = useMemo(() => 
    products.filter(p => p.stock <= p.minStock).length
  , [products]);

  // Handlers
  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
    setProducts(prev => prev.map(p => {
      const txItem = newTx.items.find(item => item.productId === p.id);
      if (txItem) {
        return { ...p, stock: p.stock - txItem.quantity };
      }
      return p;
    }));
  };

  const handleAddPurchase = (newPurchase: PurchaseOrder) => {
    setPurchases(prev => [newPurchase, ...prev]);
    
    if (newPurchase.status === PurchaseStatus.RECEIVED) {
      setProducts(prev => prev.map(p => {
        const pItem = newPurchase.items.find(item => item.productId === p.id);
        if (pItem) {
          return { 
            ...p, 
            stock: p.stock + pItem.quantity,
            buyPrice: pItem.buyPrice
          };
        }
        return p;
      }));
    }
  };

  const handleOpnameUpdate = (updatedSession: OpnameSession) => {
    setOpnameSessions(prev => {
      const exists = prev.find(s => s.id === updatedSession.id);
      if (exists) {
        return prev.map(s => s.id === updatedSession.id ? updatedSession : s);
      }
      return [updatedSession, ...prev];
    });

    if (updatedSession.status === OpnameStatus.APPROVED) {
      setProducts(prev => prev.map(p => {
        const detail = updatedSession.details.find(d => d.productId === p.id);
        if (detail) {
          return { ...p, stock: detail.physicalStock };
        }
        return p;
      }));
    }
  };

  const SidebarItem = ({ id, label, icon: Icon, roles }: { id: any, label: string, icon: any, roles: UserRole[] }) => {
    if (!roles.includes(currentUser!.role)) return null;
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        {isSidebarOpen && <span className="font-medium">{label}</span>}
        {isActive && isSidebarOpen && <ChevronRight size={16} className="ml-auto" />}
      </button>
    );
  };

  // Handler login
  const handleLogin = (user: { username: string; role: UserRole }) => {
    setIsLoggedIn(true);
    setLoginUser(user);
    setCurrentUser({ id: user.username, name: user.username, role: user.role });
    // Redirect tab sesuai role
    if (user.role === UserRole.CASHIER) setActiveTab('pos');
    else if (user.role === UserRole.OWNER) setActiveTab('dashboard');
    else if (user.role === UserRole.ADMIN) setActiveTab('dashboard');
    else if (user.role === UserRole.CUSTOMER) setActiveTab('customer');
  };

  // Handler logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginUser(null);
    setCurrentUser(null);
    localStorage.removeItem('accessToken');
  };

  // Render login page jika belum login
  if (!isLoggedIn || !currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Jika customer, tampilkan CustomerView full screen tanpa sidebar/header
  if (currentUser.role === UserRole.CUSTOMER) {
    return <CustomerView />;
  }

  // Sidebar component
  const Sidebar = (
    <aside className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col h-full z-50
      fixed top-0 left-0 w-64 md:static md:w-64
      ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      shadow-2xl md:shadow-none
    `}>
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
          <LayoutDashboard size={24} />
        </div>
        {isSidebarOpen && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-lg leading-none truncate">OmniPOS</h1>
            <p className="text-xs text-slate-400 mt-1">Enterprise Solution</p>
          </div>
        )}
      </div>
      <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto no-scrollbar">
        <SidebarItem id="dashboard" label="Dashboard" icon={LayoutDashboard} roles={[UserRole.ADMIN, UserRole.OWNER, UserRole.CASHIER]} />
        <SidebarItem id="pos" label="Penjualan (POS)" icon={ShoppingCart} roles={[UserRole.ADMIN, UserRole.OWNER, UserRole.CASHIER]} />
        <SidebarItem id="purchasing" label="Purchasing" icon={Truck} roles={[UserRole.ADMIN, UserRole.OWNER]} />
        <SidebarItem id="inventory" label="Inventory" icon={Package} roles={[UserRole.ADMIN, UserRole.OWNER]} />
        <SidebarItem id="opname" label="Stock Opname" icon={ClipboardCheck} roles={[UserRole.ADMIN, UserRole.OWNER]} />
        <SidebarItem id="reports" label="Laporan" icon={BarChart3} roles={[UserRole.ADMIN, UserRole.OWNER]} />
        <SidebarItem id="users" label="User Access" icon={Users} roles={[UserRole.OWNER]} />
      </nav>
      <div className="p-4 border-t border-slate-100">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors" onClick={handleLogout}>
          <LogOut size={20} />
          {isSidebarOpen && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 relative">
      {/* Backdrop mobile sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileSidebarOpen(false)}></div>
      )}
      {/* Sidebar */}
      <div className="md:block">
        {Sidebar}
      </div>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-2 md:px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            {/* Hamburger for mobile */}
            <button onClick={() => setMobileSidebarOpen(v => !v)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 md:hidden">
              <Menu size={20} />
            </button>
            {/* Sidebar toggle for desktop */}
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hidden md:inline-flex">
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center bg-slate-100 px-3 py-1.5 rounded-lg w-64">
              <Search size={16} className="text-slate-400" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none text-sm ml-2 focus:ring-0 w-full" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 relative">
              <Bell size={20} />
              {lowStockCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{currentUser!.name}</p>
                <p className="text-xs text-slate-500 font-medium">{currentUser!.role === UserRole.OWNER ? 'Owner' : currentUser!.role === UserRole.ADMIN ? 'Admin' : currentUser!.role}</p>
              </div>
              <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-600">
                <UserCircle size={28} />
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-2 md:p-6 no-scrollbar">
          {activeTab === 'dashboard' && <Dashboard products={products} transactions={transactions} opnameSessions={opnameSessions} />}
          {activeTab === 'pos' && <POS products={products} onTransactionComplete={handleAddTransaction} />}
          {activeTab === 'purchasing' && <Purchasing products={products} purchases={purchases} onAddPurchase={handleAddPurchase} />}
          {activeTab === 'inventory' && <Inventory products={products} setProducts={setProducts} />}
          {activeTab === 'opname' && <StockOpname products={products} sessions={opnameSessions} onUpdateSession={handleOpnameUpdate} userRole={currentUser!.role} />}
          {activeTab === 'reports' && <Reports transactions={transactions} products={products} />}
          {activeTab === 'users' && <UserManagement currentUserRole={currentUser!.role} />}
          {activeTab === 'customer' && <CustomerView />}
        </div>
      </main>
    </div>
  );
};

export default App;
