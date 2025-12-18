
import React from 'react';
import { LayoutDashboard, ShoppingBag, RefreshCcw, Users, Tag, LogOut, Settings, ShieldCheck } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  setView: (view: string) => void;
  onLogout: () => void;
  userRole: string;
}

const NavItem = ({ view, current, label, icon: Icon, setView }: any) => (
  <button
    onClick={() => setView(view)}
    className={`flex items-center space-x-3 p-3 rounded-lg w-full transition-colors ${
      current === view 
        ? 'bg-indigo-600 text-white shadow-md' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const MobileNavItem = ({ view, current, icon: Icon, setView, label }: any) => (
  <button
    onClick={() => setView(view)}
    className={`flex flex-col items-center justify-center w-full p-2 ${
      current === view ? 'text-indigo-600' : 'text-slate-400'
    }`}
  >
    <Icon size={24} />
    <span className="text-[10px] mt-1 font-medium">{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, onLogout, userRole }) => {
  const isAdmin = userRole === 'ADMIN';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-full">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Tag className="text-white" size={18} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">BrechOnLine</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem view="dashboard" current={currentView} label="Início" icon={LayoutDashboard} setView={setView} />
          <NavItem view="inventory" current={currentView} label="Estoque & Avaliação" icon={Tag} setView={setView} />
          <NavItem view="pos" current={currentView} label="PDV (Caixa)" icon={ShoppingBag} setView={setView} />
          <NavItem view="trade" current={currentView} label="Trocas & Crédito" icon={RefreshCcw} setView={setView} />
          <NavItem view="vendors" current={currentView} label="Fornecedoras" icon={Users} setView={setView} />
          <NavItem view="customers" current={currentView} label="Clientes" icon={Users} setView={setView} />
          
          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                 <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sistema</p>
              </div>
              <NavItem view="profiles" current={currentView} label="Usuários" icon={ShieldCheck} setView={setView} />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={onLogout}
            className="flex items-center space-x-3 p-3 rounded-lg w-full text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center z-20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Tag className="text-white" size={18} />
            </div>
            <h1 className="text-lg font-bold text-slate-800">BrechOnLine</h1>
          </div>
          <button onClick={onLogout} className="text-slate-400">
            <LogOut size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-between items-center px-2 pb-safe z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <MobileNavItem view="dashboard" current={currentView} label="Início" icon={LayoutDashboard} setView={setView} />
          <MobileNavItem view="inventory" current={currentView} label="Estoque" icon={Tag} setView={setView} />
          <MobileNavItem view="pos" current={currentView} label="Caixa" icon={ShoppingBag} setView={setView} />
          <MobileNavItem view="trade" current={currentView} label="Trocas" icon={RefreshCcw} setView={setView} />
          {isAdmin && <MobileNavItem view="profiles" current={currentView} label="Acessos" icon={ShieldCheck} setView={setView} />}
        </div>
      </main>
    </div>
  );
};
