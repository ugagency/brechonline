
import React, { useState } from 'react';
import { useStore } from '../services/store';
import { ItemCondition } from '../types';
import { RefreshCcw, UserPlus, Camera } from 'lucide-react';

export const TradeIn: React.FC = () => {
  const { customers, processTradeIn, addCustomer } = useStore();
  const [customerId, setCustomerId] = useState('');
  const [creditAmount, setCreditAmount] = useState('10');
  
  // Quick Add Customer Logic
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientCpf, setNewClientCpf] = useState('');

  // Item details being traded in
  const [category, setCategory] = useState('Camisa');
  const [size, setSize] = useState('M');
  const [itemImage, setItemImage] = useState<string>('');

  const handleCreateClient = () => {
    if (!newClientName) return;
    addCustomer({ name: newClientName, cpf: newClientCpf });
    setShowNewClient(false);
    setNewClientName('');
    setNewClientCpf('');
    alert('Cliente cadastrado!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!customerId) {
      alert('Selecione um cliente.');
      return;
    }
    if (!itemImage) {
      alert('A foto da peça é obrigatória.');
      return;
    }
    const amount = parseFloat(creditAmount);
    
    // Create the item that entered via trade
    const newItem = {
      imageUrl: itemImage,
      category,
      size,
      condition: ItemCondition.GOOD,
      price: amount * 2, // Simple markup logic for demo: Sell price is 2x credit given
      vendorId: undefined, // Loja owned
      description: 'Origem: Troca'
    };

    processTradeIn(customerId, amount, [newItem]);
    alert(`Crédito de R$ ${amount} gerado com sucesso!`);
    // Reset defaults
    setCategory('Camisa');
    setSize('M');
    setItemImage('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <RefreshCcw className="text-orange-600" />
        Troca por Crédito
      </h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        
        {/* Customer Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-700">Cliente</label>
            <button 
              onClick={() => setShowNewClient(!showNewClient)}
              className="text-sm text-orange-600 hover:underline flex items-center"
            >
              <UserPlus size={14} className="mr-1"/> Novo Cliente
            </button>
          </div>
          
          {showNewClient ? (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3 mb-4 border border-gray-200">
              <input 
                type="text" 
                placeholder="Nome do Cliente" 
                className="w-full p-2 border rounded"
                value={newClientName}
                onChange={e => setNewClientName(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="CPF (Opcional)" 
                className="w-full p-2 border rounded"
                value={newClientCpf}
                onChange={e => setNewClientCpf(e.target.value)}
              />
              <button 
                onClick={handleCreateClient}
                className="w-full bg-slate-800 text-white py-2 rounded text-sm font-medium"
              >
                Cadastrar Rápido
              </button>
            </div>
          ) : (
            <select 
              className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-orange-500"
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
            >
              <option value="">Selecione o cliente...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} (Saldo: R$ {c.storeCredit.toFixed(2)})</option>
              ))}
            </select>
          )}
        </div>

        <div className="h-px bg-gray-100"></div>

        {/* Item Entering */}
        <div>
          <h3 className="font-semibold text-slate-800 mb-4">Peça Recebida</h3>
          
          <div className="mb-4">
             <label className="block text-sm font-medium text-slate-700 mb-2">Foto da Peça <span className="text-red-500">*</span></label>
             <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${itemImage ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                {itemImage ? (
                  <div className="relative w-full h-full group">
                    <img src={itemImage} alt="Preview" className="w-full h-full object-contain rounded-lg p-1" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                       <p className="text-white text-xs font-bold">Alterar Foto</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-xs text-slate-500">Toque para tirar foto</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
             </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm text-slate-500 mb-1">Categoria</label>
                <select className="w-full p-2 border rounded-lg" value={category} onChange={e => setCategory(e.target.value)}>
                  <option>Camisa</option>
                  <option>Calça</option>
                  <option>Vestido</option>
                  <option>Casaco</option>
                </select>
             </div>
             <div>
                <label className="block text-sm text-slate-500 mb-1">Tamanho</label>
                <select className="w-full p-2 border rounded-lg" value={size} onChange={e => setSize(e.target.value)}>
                  <option>P</option>
                  <option>M</option>
                  <option>G</option>
                  <option>GG</option>
                </select>
             </div>
          </div>
        </div>

        {/* Credit Value */}
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
          <label className="block text-sm font-bold text-emerald-800 mb-2">Valor do Crédito a Gerar</label>
          <div className="flex gap-2">
            {['5', '10', '15', '20'].map(val => (
              <button
                key={val}
                onClick={() => setCreditAmount(val)}
                className={`flex-1 py-2 rounded-lg font-bold border transition ${
                  creditAmount === val 
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' 
                    : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                R$ {val}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg active:scale-95 transition flex items-center justify-center gap-2"
        >
          <RefreshCcw size={20} />
          Confirmar Troca e Gerar Crédito
        </button>

      </div>
    </div>
  );
};
