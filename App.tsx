
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { InventoryList } from './components/InventoryList';
import { ProductForm } from './components/ProductForm';
import { Settings } from './components/Settings';
import { Attributes } from './components/Attributes';
import { INITIAL_PRODUCTS, INITIAL_INTEGRATIONS, INITIAL_USER_PROFILE, INITIAL_ATTRIBUTES } from './services/mockData';
import { Product, Integration, Theme, UserProfile, Attribute } from './types';
import { LayoutDashboard, Package, ArrowLeftRight, Settings as SettingsIcon, Bell, Tags } from 'lucide-react';

const NavLink = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30' 
          : 'text-gray-500 hover:bg-white hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-indigo-400'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

const Layout = ({ children, userProfile }: { children?: React.ReactNode, userProfile: UserProfile }) => (
  <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900 overflow-hidden transition-colors duration-200">
    {/* Sidebar */}
    <aside className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col p-4 hidden md:flex transition-colors duration-200">
      <div className="flex items-center gap-3 px-4 mb-10 mt-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none">
          <ArrowLeftRight className="text-white" size={18} />
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">SyncMaster</span>
      </div>
      
      <nav className="space-y-1 flex-1">
        <NavLink to="/" icon={LayoutDashboard} label="Dashboard" />
        <NavLink to="/inventory" icon={Package} label="Inventory" />
        <NavLink to="/attributes" icon={Tags} label="Attributes" />
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        <NavLink to="/settings" icon={SettingsIcon} label="Settings" />
      </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
      <header className="h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-8 z-10 sticky top-0 transition-colors duration-200">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Overview</h1>
        <div className="flex items-center gap-4">
           <button className="relative p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-gray-100 dark:border-gray-700">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs overflow-hidden border border-white dark:border-gray-600 shadow-sm">
              {userProfile.avatar ? (
                <img src={userProfile.avatar} alt="User" className="w-full h-full object-cover" />
              ) : (
                <span>{userProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{userProfile.name}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </main>
  </div>
);

const App = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [attributes, setAttributes] = useState<Attribute[]>(INITIAL_ATTRIBUTES);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Theme State Management
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return (savedTheme as Theme) || 'system';
    }
    return 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);


  const handleSaveProduct = (product: Product) => {
    setProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.map(p => p.id === product.id ? product : p);
      }
      return [...prev, product];
    });
    setIsModalOpen(false);
    setEditingProduct(undefined);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const openAddModal = () => {
    setEditingProduct(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  return (
    <HashRouter>
      <Layout userProfile={userProfile}>
        <Routes>
          <Route path="/" element={<Dashboard products={products} />} />
          <Route 
            path="/inventory" 
            element={
              <InventoryList 
                products={products}
                onEdit={openEditModal}
                onDelete={handleDeleteProduct}
                onAdd={openAddModal}
              />
            } 
          />
          <Route
            path="/attributes"
            element={
              <Attributes
                attributes={attributes}
                onUpdateAttributes={setAttributes}
              />
            }
          />
          <Route 
            path="/settings" 
            element={
              <Settings 
                integrations={integrations}
                onUpdateIntegrations={setIntegrations}
                currentTheme={theme}
                onThemeChange={setTheme}
                userProfile={userProfile}
                onUpdateProfile={setUserProfile}
              />
            } 
          />
        </Routes>
        
        {isModalOpen && (
          <ProductForm
            initialData={editingProduct}
            onSave={handleSaveProduct}
            onClose={() => setIsModalOpen(false)}
            attributes={attributes}
          />
        )}
      </Layout>
    </HashRouter>
  );
};

export default App;
