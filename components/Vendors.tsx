import React, { useState } from 'react';
import { useStore } from '../services/store';
import { Plus, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import { Vendor } from '../types';

export const Vendors: React.FC = () => {
  const { vendors, addVendor, payVendor, items } = useStore();
  
  // Add Vendor State
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRate, setNewRate] = useState('0.5');
  
  // Expand/Collapse State
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);

  // Payout Modal State
  const [payoutVendor, setPayoutVendor] = useState<Vendor | null>(null);
  const [payoutAmount, setPayoutAmount] = useState('');

  const handleAdd = () => {
    addVendor({
      name: newName,
      phone: newPhone,
      commissionRate: parseFloat(newRate)
    });
    setShowAdd(false);
    setNewName('');
    setNewPhone('');
  };

  const openPayoutModal = (vendor: Vendor) => {
    setPayoutVendor(vendor);
    setPayoutAmount(vendor.balance.toFixed(2));
  };

  const handlePayout = () => {
    if (payoutVendor && payoutAmount) {
      const amount = parseFloat(payoutAmount);
      if (amount <= 0 || amount > payoutVendor.balance) {
        alert("Valor inválido.");
        return;
      }
      payVendor(payoutVendor.id, amount);
      setPayoutVendor(null);
      setPayoutAmount('');
      alert(`Pagamento de R$ ${amount.toFixed(2)} registrado para ${payoutVendor.name}!`);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Fornecedoras (Consignação)</h2>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <Plus size={18} /> Cadastrar
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold mb-4">Nova Parceira</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input type="text" placeholder="Nome" className="p-2 border rounded-lg" value={newName} onChange={e => setNewName(e.target.value)} />
            <input type="text" placeholder="Telefone / WhatsApp" className="p-2 border rounded-lg" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
            <select className="p-2 border rounded-lg bg-white" value={newRate} onChange={e => setNewRate(e.target.value)}>
              <option value="0.5">50% Repasse</option>
              <option value="0.4">40% Repasse</option>
              <option value="0.6">60% Repasse</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
             <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-slate-500">Cancelar</button>
             <button onClick={handleAdd} className="px-4 py-2 bg-slate-900 text-white rounded-lg">Salvar</button>
          </div>
        </div>
      )}

      {/* Vendor List */}
      <div className="grid grid-cols-1 gap-4">
        {vendors.map(vendor => {
            const vendorItems = items.filter(i => i.vendorId === vendor.id);
            const soldCount = vendorItems.filter(i => i.status === 'SOLD').length;
            const activeCount = vendorItems.filter(i => i.status === 'FOR_SALE').length;

            return (
              <div key={vendor.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedVendor(expandedVendor === vendor.id ? null : vendor.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                      {vendor.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{vendor.name}</h3>
                      <p className="text-xs text-slate-500">{vendor.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div className="hidden md:block">
                      <p className="text-xs text-slate-400">Repasse</p>
                      <p className="font-medium text-slate-700">{(vendor.commissionRate * 100).toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">A Pagar</p>
                      <p className="font-bold text-emerald-600">R$ {vendor.balance.toFixed(2)}</p>
                    </div>
                    {expandedVendor === vendor.id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                  </div>
                </div>

                {expandedVendor === vendor.id && (
                  <div className="bg-gray-50 p-4 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                       <div className="bg-white p-3 rounded-lg border border-gray-100">
                          <p className="text-xs text-slate-400">Total Peças</p>
                          <p className="font-bold">{vendorItems.length}</p>
                       </div>
                       <div className="bg-white p-3 rounded-lg border border-gray-100">
                          <p className="text-xs text-slate-400">Vendidas</p>
                          <p className="font-bold">{soldCount}</p>
                       </div>
                       <div className="bg-white p-3 rounded-lg border border-gray-100">
                          <p className="text-xs text-slate-400">À Venda</p>
                          <p className="font-bold">{activeCount}</p>
                       </div>
                    </div>
                    <button 
                      className="w-full py-3 border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 font-medium flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={(e) => { e.stopPropagation(); openPayoutModal(vendor); }}
                      disabled={vendor.balance <= 0}
                    >
                      <DollarSign size={18} />
                      Registrar Pagamento Realizado
                    </button>
                  </div>
                )}
              </div>
            );
        })}
      </div>

      {/* Payout Modal */}
      {payoutVendor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-slate-800">Realizar Pagamento</h3>
              <p className="text-sm text-slate-500">Para: {payoutVendor.name}</p>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Saldo Disponível</label>
                <div className="text-2xl font-bold text-emerald-600">R$ {payoutVendor.balance.toFixed(2)}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor do Pagamento</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-lg font-semibold"
                    value={payoutAmount}
                    onChange={e => setPayoutAmount(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Ao confirmar, o saldo será deduzido do sistema.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 flex space-x-3">
              <button 
                onClick={() => setPayoutVendor(null)} 
                className="flex-1 py-3 text-slate-600 font-medium hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                onClick={handlePayout} 
                className="flex-1 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 shadow-md"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};