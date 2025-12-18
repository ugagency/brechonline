
import React, { useState, useEffect, useCallback } from 'react';
import { StoreProvider } from './services/store';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { POS } from './components/POS';
import { TradeIn } from './components/TradeIn';
import { Vendors } from './components/Vendors';
import { ProfilesManagement } from './components/ProfilesManagement';
import { Tag, Loader2, LogIn, AlertCircle } from 'lucide-react';
import { useStore } from './services/store';
import { Profile } from './types';

const Customers: React.FC = () => {
  const { customers, addCustomer } = useStore();
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if(!name) return;
    setLoading(true);
    try {
      await addCustomer({ name, cpf });
      setName(''); setCpf('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Clientes & Fidelidade</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h3 className="font-bold mb-4">Novo Cliente</h3>
        <div className="flex gap-4">
          <input className="border p-2 rounded flex-1" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
          <input className="border p-2 rounded flex-1" placeholder="CPF" value={cpf} onChange={e => setCpf(e.target.value)} />
          <button onClick={handleAdd} disabled={loading} className="bg-orange-600 text-white px-4 py-2 rounded flex items-center hover:bg-orange-700 transition-colors">
            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            Salvar
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr><th className="p-4">Nome</th><th className="p-4">CPF</th><th className="p-4 text-right">Crédito em Loja</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map(c => (
              <tr key={c.id}>
                <td className="p-4">{c.name}</td>
                <td className="p-4 text-slate-500 text-sm">{c.cpf || '-'}</td>
                <td className="p-4 text-right font-bold text-emerald-600">R$ {c.storeCredit.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LoginScreen = ({ onLoginSuccess }: { onLoginSuccess: (user: Profile) => void }) => {
  const { authenticate } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) return;

    setLoading(true);
    try {
      const user = await authenticate(email, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError("E-mail ou senha incorretos.");
      }
    } catch (e: any) {
      setError(e.message || "Erro ao autenticar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Tag size={40} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-1">BrechOnLine</h1>
        <p className="text-slate-500 mb-8 font-medium">Gestão de Brechó Físico</p>
        
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2">
            <AlertCircle size={18} className="flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-500 uppercase ml-1 mb-1">E-mail</label>
            <input 
              type="email" 
              placeholder="Digite seu e-mail" 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-500 uppercase ml-1 mb-1">Senha</label>
            <input 
              type="password" 
              placeholder="Digite sua senha" 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
            {loading ? "AUTENTICANDO..." : "ENTRAR NO SISTEMA"}
          </button>
        </form>
        
        <p className="mt-8 text-xs text-slate-400">
          Acesso restrito a colaboradores autorizados.
        </p>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [user, setUser] = useState<Profile | null>(() => {
    try {
      const saved = localStorage.getItem('brechonline_user');
      if (!saved) return null;
      return JSON.parse(saved);
    } catch (e) {
      console.error("Erro ao carregar sessão:", e);
      localStorage.removeItem('brechonline_user');
      return null;
    }
  });
  
  const [currentView, setCurrentView] = useState('dashboard');
  const { loading, profiles } = useStore();

  const handleLogout = useCallback((force = false) => {
    if (force || confirm("Deseja realmente sair do sistema?")) {
      localStorage.removeItem('brechonline_user');
      setUser(null);
      setCurrentView('dashboard');
    }
  }, []);

  // Verifica se o usuário logado ainda é válido e está ativo
  useEffect(() => {
    if (user && profiles && profiles.length > 0) {
      const activeProfile = profiles.find(p => String(p.id) === String(user.id));
      if (!activeProfile || !activeProfile.active) {
        alert("Sessão encerrada: sua conta foi desativada ou removida.");
        handleLogout(true);
      }
    }
  }, [profiles, user, handleLogout]);

  const handleLoginSuccess = (profile: Profile) => {
    localStorage.setItem('brechonline_user', JSON.stringify(profile));
    setUser(profile);
  };

  if (!user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white text-orange-600">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-bold text-slate-700 tracking-tight">BRECHONLINE</p>
        <p className="text-sm text-slate-400 mt-2">Carregando dados da loja...</p>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard setView={setCurrentView} />;
      case 'inventory': return <Inventory />;
      case 'pos': return <POS />;
      case 'trade': return <TradeIn />;
      case 'vendors': return <Vendors />;
      case 'customers': return <Customers />;
      case 'profiles': 
        if (user.role !== 'ADMIN') {
          setCurrentView('dashboard');
          return <Dashboard setView={setCurrentView} />;
        }
        return <ProfilesManagement currentUser={user} />;
      default: return <Dashboard setView={setCurrentView} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      setView={setCurrentView} 
      onLogout={() => handleLogout(false)} 
      userRole={user.role}
    >
      <div className="mb-4 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${user.role === 'ADMIN' ? 'bg-slate-800' : 'bg-orange-500'}`}></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
              Acesso: {user.role} | Operador: {user.name}
            </p>
         </div>
      </div>
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;
