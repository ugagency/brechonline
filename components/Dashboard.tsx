
import React from 'react';
import { useStore } from '../services/store';
import { ItemStatus } from '../types';
import { TrendingUp, Package, AlertCircle, DollarSign } from 'lucide-react';

export const Dashboard: React.FC<{ setView: (v: string) => void }> = ({ setView }) => {
  const { items, sales, vendors } = useStore();

  const inventoryCount = items.filter(i => i.status === ItemStatus.FOR_SALE).length;
  const evaluationCount = items.filter(i => i.status === ItemStatus.EVALUATION).length;
  
  const today = new Date().toISOString().split('T')[0];
  const todaysSales = sales.filter(s => s.date.startsWith(today));
  const dailyRevenue = todaysSales.reduce((acc, s) => acc + s.total, 0);

  const pendingPayouts = vendors.reduce((acc, v) => acc + v.balance, 0);

  const StatCard = ({ title, value, sub, icon: Icon, color, onClick }: any) => (
    <div 
      onClick={onClick}
      className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          {sub && <p className="text-xs text-slate-400 mt-2">{sub}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
        <span className="text-sm text-slate-500">{new Date().toLocaleDateString('pt-BR')}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Vendas Hoje" 
          value={`R$ ${dailyRevenue.toFixed(2)}`} 
          sub={`${todaysSales.length} vendas realizadas`}
          icon={DollarSign} 
          color="bg-emerald-500"
          onClick={() => setView('pos')}
        />
        <StatCard 
          title="Em Estoque" 
          value={inventoryCount} 
          sub="Peças prontas para venda"
          icon={Package} 
          color="bg-orange-500"
          onClick={() => setView('inventory')}
        />
        <StatCard 
          title="Em Avaliação" 
          value={evaluationCount} 
          sub="Aguardando aprovação"
          icon={AlertCircle} 
          color="bg-amber-500"
          onClick={() => setView('inventory')}
        />
        <StatCard 
          title="A Pagar (Consig.)" 
          value={`R$ ${pendingPayouts.toFixed(2)}`} 
          sub="Saldo acumulado de fornecedoras"
          icon={TrendingUp} 
          color="bg-rose-500"
          onClick={() => setView('vendors')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setView('pos')} className="p-4 bg-orange-50 text-orange-700 rounded-lg font-medium hover:bg-orange-100 transition text-center">
              Nova Venda
            </button>
            <button onClick={() => setView('trade')} className="p-4 bg-emerald-50 text-emerald-700 rounded-lg font-medium hover:bg-emerald-100 transition text-center">
              Nova Troca
            </button>
            <button onClick={() => setView('inventory')} className="p-4 bg-amber-50 text-amber-700 rounded-lg font-medium hover:bg-amber-100 transition text-center">
              Cadastrar Peça
            </button>
            <button onClick={() => setView('customers')} className="p-4 bg-slate-50 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition text-center">
              Cadastrar Cliente
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <h3 className="font-semibold text-lg mb-4">Últimas Vendas</h3>
           <div className="space-y-3">
             {sales.slice(0, 5).map(sale => (
               <div key={sale.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                 <div>
                   <p className="font-medium text-slate-800">Venda #{sale.id.slice(-4)}</p>
                   <p className="text-xs text-slate-400">{new Date(sale.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                 </div>
                 <div className="text-right">
                   <p className="font-bold text-emerald-600">R$ {sale.total.toFixed(2)}</p>
                   <p className="text-xs text-slate-500">{sale.paymentMethod}</p>
                 </div>
               </div>
             ))}
             {sales.length === 0 && <p className="text-slate-400 text-center py-4">Nenhuma venda hoje.</p>}
           </div>
        </div>
      </div>
    </div>
  );
};
