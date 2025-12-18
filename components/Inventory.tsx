
import React, { useState } from 'react';
import { useStore } from '../services/store';
import { Item, ItemCondition, ItemStatus } from '../types';
import { Plus, Check, X, Search, Filter, Camera, Upload, Loader2, AlertCircle, Trash2 } from 'lucide-react';

export const Inventory: React.FC = () => {
  const { items, addItem, updateItemStatus, deleteItem, vendors } = useStore();
  const [filter, setFilter] = useState<'ALL' | 'EVALUATION' | 'FOR_SALE' | 'SOLD'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [newCategory, setNewCategory] = useState('');
  const [newSize, setNewSize] = useState('M');
  const [newCondition, setNewCondition] = useState<ItemCondition>(ItemCondition.GOOD);
  const [newPrice, setNewPrice] = useState('');
  const [newVendorId, setNewVendorId] = useState('');
  const [newImage, setNewImage] = useState<string>('');

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'ALL' ? true : item.status === filter;
    const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setErrorMessage(null);
    if (!newImage) {
      alert("A imagem do produto é obrigatória.");
      return;
    }
    if (!newCategory.trim()) {
      alert("O título/categoria da peça é obrigatório.");
      return;
    }
    const priceValue = parseFloat(newPrice);
    if (!newPrice || isNaN(priceValue) || priceValue <= 0) {
      alert("Informe um preço válido.");
      return;
    }

    setLoading(true);
    try {
      await addItem({
        imageUrl: newImage,
        category: newCategory,
        size: newSize,
        condition: newCondition,
        price: priceValue,
        vendorId: newVendorId || undefined,
        description: ''
      });
      
      setNewImage('');
      setNewCategory('');
      setNewPrice('');
      setNewSize('M');
      setShowAddModal(false);
      alert("Peça cadastrada com sucesso!");
    } catch (e: any) {
      console.error(e);
      const msg = e.message || "Erro desconhecido";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string, category: string) => {
    if (confirm(`Tem certeza que deseja excluir permanentemente a peça "${category}" do sistema? Esta ação não pode ser desfeita.`)) {
      try {
        await deleteItem(id);
        alert("Peça excluída com sucesso.");
      } catch (e: any) {
        alert("Erro ao excluir peça: " + e.message);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Estoque</h2>
        <button 
          onClick={() => { setShowAddModal(true); setErrorMessage(null); }}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 active:scale-95 transition"
        >
          <Plus size={20} />
          <span>Nova Peça</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col space-y-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
           {[
             { id: 'ALL', label: 'Todos' },
             { id: ItemStatus.EVALUATION, label: 'Em Avaliação' },
             { id: ItemStatus.FOR_SALE, label: 'À Venda' },
             { id: ItemStatus.SOLD, label: 'Vendidos' }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setFilter(tab.id as any)}
               className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                 filter === tab.id 
                   ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                   : 'bg-gray-50 text-slate-600 hover:bg-gray-100'
               }`}
             >
               {tab.label}
             </button>
           ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por código ou categoria..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Código</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Peça</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Preço</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="p-4 font-mono text-sm text-slate-600 align-middle">{item.id.slice(-8)}</td>
                <td className="p-4 flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                    <img src={item.imageUrl} alt={item.category} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{item.category}</div>
                    <div className="text-xs text-slate-500">{item.size} • {item.condition}</div>
                  </div>
                </td>
                <td className="p-4 font-medium text-slate-900 align-middle">R$ {item.price.toFixed(2)}</td>
                <td className="p-4 align-middle">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === ItemStatus.FOR_SALE ? 'bg-emerald-100 text-emerald-700' :
                    item.status === ItemStatus.EVALUATION ? 'bg-amber-100 text-amber-700' :
                    item.status === ItemStatus.SOLD ? 'bg-gray-100 text-gray-500' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {item.status === ItemStatus.FOR_SALE ? 'À Venda' : 
                     item.status === ItemStatus.EVALUATION ? 'Avaliação' : 
                     item.status === ItemStatus.SOLD ? 'Vendido' : item.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2 align-middle">
                  {item.status === ItemStatus.EVALUATION && (
                    <>
                      <button 
                        onClick={() => updateItemStatus(item.id, ItemStatus.FOR_SALE)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded" title="Aprovar"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          if(confirm("Deseja marcar esta peça como recusada?")) {
                            updateItemStatus(item.id, ItemStatus.TRADED);
                          }
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded" title="Reprovar"
                      >
                        <X size={18} />
                      </button>
                    </>
                  )}
                  {(item.status === ItemStatus.SOLD || item.status === ItemStatus.TRADED) && (
                    <button 
                      onClick={() => handleDeleteItem(item.id, item.category)}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" 
                      title="Excluir do Sistema"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">Nenhuma peça encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
              <h3 className="text-lg font-bold">Nova Peça</h3>
              <button onClick={() => setShowAddModal(false)}><X className="text-slate-400 hover:text-slate-600" /></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
                  <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
                  <div className="text-sm">
                    <p className="font-bold mb-1">Erro ao Salvar</p>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">Foto da Peça <span className="text-red-500">*</span></label>
                 <div className="flex items-center justify-center w-full">
                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${newImage ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                        {newImage ? (
                          <div className="relative w-full h-full group">
                            <img src={newImage} alt="Preview" className="w-full h-full object-contain rounded-lg p-1" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                               <p className="text-white text-xs font-bold">Alterar Foto</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Camera className="w-8 h-8 text-slate-400 mb-2" />
                              <p className="text-xs text-slate-500">Toque para tirar foto ou enviar</p>
                          </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título / Categoria</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500" 
                  placeholder="Ex: Vestido Floral, Camisa Xadrez..."
                  value={newCategory} 
                  onChange={e => setNewCategory(e.target.value)} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tamanho</label>
                  <select className="w-full p-2 border rounded-lg bg-white" value={newSize} onChange={e => setNewSize(e.target.value)}>
                    <option>PP</option>
                    <option>P</option>
                    <option>M</option>
                    <option>G</option>
                    <option>GG</option>
                    <option>36</option>
                    <option>38</option>
                    <option>40</option>
                    <option>42</option>
                    <option>44</option>
                    <option>46</option>
                    <option>48</option>
                    <option>U</option>
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Preço (R$)</label>
                   <input
                     type="number"
                     step="0.01"
                     className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                     placeholder="0,00"
                     value={newPrice}
                     onChange={e => setNewPrice(e.target.value)}
                   />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Condição</label>
                <select className="w-full p-2 border rounded-lg bg-white" value={newCondition} onChange={e => setNewCondition(e.target.value as ItemCondition)}>
                  {Object.values(ItemCondition).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fornecedora (Opcional)</label>
                <select className="w-full p-2 border rounded-lg bg-white" value={newVendorId} onChange={e => setNewVendorId(e.target.value)}>
                  <option value="">Loja (Próprio)</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex space-x-3 flex-shrink-0">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 text-slate-600 font-medium hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button 
                onClick={handleSave} 
                disabled={loading}
                className="flex-1 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                Salvar e Avaliar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
