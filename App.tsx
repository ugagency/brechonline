
import React, { useState } from 'react';
import { StoreProvider } from './services/store';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { POS } from './components/POS';
import { TradeIn } from './components/TradeIn';
import { Vendors } from './components/Vendors';
import { Tag, Loader2 } from 'lucide-react';
import { useStore } from './services/store';

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
          <button onClick={handleAdd} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center">
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

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => (
  <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
      <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
        <Tag size={32} />
      </div>
      <h1 className="text-3xl font-bold text-slate-800 mb-2">BrechOnLine</h1>
      <p className="text-slate-500 mb-8">Sistema de Gestão Simplificada</p>
      
      <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-4">
        <div className="relative">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500" 
            defaultValue="admin@brecho.com"
          />
        </div>
        <div className="relative">
          <input 
            type="password" 
            placeholder="Senha" 
            className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500" 
            defaultValue="123456"
          />
        </div>
        <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition shadow-lg">
          ENTRAR
        </button>
      </form>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const { loading } = useStore();

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 text-indigo-600">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-medium">Carregando BrechOnLine...</p>
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
      default: return <Dashboard setView={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView} onLogout={() => setIsAuthenticated(false)}>
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
