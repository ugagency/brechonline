import React, { useState } from 'react';
import { useStore } from '../services/store';
import { Item, ItemStatus } from '../types';
import { ShoppingCart, Trash2, Search, User, CreditCard, X, Package } from 'lucide-react';

export const POS: React.FC = () => {
  const { items, customers, coupons, processSale } = useStore();
  const [cart, setCart] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [useStoreCredit, setUseStoreCredit] = useState(false);

  // Filter items available for sale AND match search term (by ID or Category)
  const availableItems = items.filter(item => {
    const isForSale = item.status === ItemStatus.FOR_SALE;
    const notInCart = !cart.find(c => c.id === item.id);
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
                          item.id.toLowerCase().includes(searchLower) || 
                          item.category.toLowerCase().includes(searchLower);
    
    return isForSale && notInCart && matchesSearch;
  });

  const addToCart = (item: Item) => {
    setCart([...cart, item]);
    setSearchTerm(''); // Optional: clear search after adding
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(i => i.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
  
  // Coupon Logic
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'PERCENT') {
      discount = subtotal * (appliedCoupon.value / 100);
    } else {
      discount = appliedCoupon.value;
    }
  }

  // Credit Logic
  const customer = customers.find(c => c.id === selectedCustomerId);
  let creditUsed = 0;
  if (useStoreCredit && customer) {
    creditUsed = Math.min(customer.storeCredit, subtotal - discount);
  }

  const finalTotal = Math.max(0, subtotal - discount - creditUsed);

  const handleApplyCoupon = () => {
    const coupon = coupons.find(c => c.code === couponCode && c.active);
    if (coupon) {
      setAppliedCoupon(coupon);
    } else {
      alert('Cupom inválido');
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    processSale(
      cart.map(i => i.id),
      selectedCustomerId || undefined,
      paymentMethod,
      discount,
      creditUsed
    );
    setCart([]);
    setSelectedCustomerId('');
    setCouponCode('');
    setAppliedCoupon(null);
    setUseStoreCredit(false);
    alert('Venda realizada com sucesso!');
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 overflow-hidden">
      
      {/* Left Panel: Catalog & Search */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="mb-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            autoFocus
            placeholder="Buscar por nome (ex: Vestido) ou código..." 
            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:outline-none shadow-sm text-lg"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {availableItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {availableItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => addToCart(item)}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md hover:border-indigo-300 transition group"
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <img src={item.imageUrl} alt={item.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-slate-700 shadow-sm">
                      {item.size}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-slate-800 truncate pr-2">{item.category}</h3>
                      <span className="text-xs text-slate-400 font-mono">{item.id}</span>
                    </div>
                    <p className="text-lg font-bold text-indigo-600">R$ {item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
              <Package size={64} className="mb-4" />
              <p className="text-lg font-medium">Nenhum produto encontrado</p>
              <p className="text-sm">Tente buscar por outro termo ou cadastre novas peças.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Cart & Checkout */}
      <div className="w-full lg:w-96 bg-white rounded-xl border border-gray-200 shadow-xl flex flex-col h-full overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-slate-700">
            <ShoppingCart size={20} />
            <h2 className="font-bold">Cesta de Compras</h2>
          </div>
          <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">{cart.length} itens</span>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50/50">
          {cart.length > 0 ? (
            cart.map(item => (
              <div key={item.id} className="flex bg-white p-3 rounded-lg border border-gray-100 shadow-sm animate-in fade-in slide-in-from-left-2">
                <img src={item.imageUrl} alt="" className="w-12 h-12 rounded bg-gray-100 object-cover mr-3" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="font-medium text-slate-800 truncate">{item.category}</p>
                    <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex justify-between items-end mt-1">
                    <span className="text-xs bg-gray-100 text-slate-500 px-1.5 rounded">{item.size}</span>
                    <span className="font-bold text-slate-700">R$ {item.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <p className="text-sm">Selecione produtos ao lado para adicionar à venda.</p>
            </div>
          )}
        </div>

        {/* Checkout Controls */}
        <div className="p-4 bg-white border-t border-gray-200 space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          
          {/* Customer Selection */}
          <div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                className="w-full pl-9 pr-2 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 text-sm"
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
              >
                <option value="">Cliente Avulso</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.cpf ? `(${c.cpf})` : ''}</option>
                ))}
              </select>
            </div>
            {customer && customer.storeCredit > 0 && (
               <div className="mt-2 flex items-center space-x-2 px-1">
                 <input 
                   type="checkbox" 
                   id="useCredit" 
                   checked={useStoreCredit} 
                   onChange={e => setUseStoreCredit(e.target.checked)} 
                   className="rounded text-indigo-600 focus:ring-indigo-500"
                 />
                 <label htmlFor="useCredit" className="text-xs text-emerald-600 font-bold cursor-pointer">
                   Usar crédito: R$ {customer.storeCredit.toFixed(2)}
                 </label>
               </div>
            )}
          </div>

          {/* Coupon */}
          <div className="flex space-x-2">
             <input 
               type="text" 
               className="flex-1 p-2 border rounded-lg uppercase text-sm" 
               placeholder="CUPOM"
               value={couponCode}
               onChange={e => setCouponCode(e.target.value)}
             />
             <button onClick={handleApplyCoupon} className="bg-slate-800 text-white px-3 rounded-lg text-xs font-bold hover:bg-slate-700">OK</button>
          </div>

          {/* Totals */}
          <div className="space-y-1 py-2 border-t border-dashed border-gray-200">
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Subtotal</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            {(discount > 0 || creditUsed > 0) && (
              <div className="flex justify-between text-emerald-600 text-sm">
                <span>Descontos/Créditos</span>
                <span>- R$ {(discount + creditUsed).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-2xl font-bold text-slate-900">
              <span>Total</span>
              <span>R$ {finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-3 gap-2">
            {['CASH', 'CARD', 'PIX'].map(method => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`py-2 text-xs font-bold rounded-lg border transition ${
                  paymentMethod === method ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-gray-200 text-slate-500 hover:bg-gray-50'
                }`}
              >
                {method === 'CASH' ? 'DINHEIRO' : method === 'CARD' ? 'CARTÃO' : 'PIX'}
              </button>
            ))}
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-3.5 bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-600 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition flex items-center justify-center space-x-2"
          >
            <span>FINALIZAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
