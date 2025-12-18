
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Item, Vendor, Customer, Sale, Coupon, ItemStatus, ItemCondition, Profile, UserRole } from '../types';
import { supabase } from './supabase';

interface StoreContextType {
  items: Item[];
  vendors: Vendor[];
  customers: Customer[];
  sales: Sale[];
  coupons: Coupon[];
  profiles: Profile[];
  loading: boolean;
  
  addItem: (item: Omit<Item, 'id' | 'entryDate' | 'status'>) => Promise<void>;
  updateItemStatus: (id: string, status: ItemStatus) => Promise<void>;
  addVendor: (vendor: Omit<Vendor, 'id' | 'balance'>) => Promise<void>;
  payVendor: (vendorId: string, amount: number) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'storeCredit'>) => Promise<void>;
  processSale: (itemIds: string[], customerId: string | undefined, paymentMethod: string, discount: number, usedCredit: number) => Promise<void>;
  processTradeIn: (customerId: string, creditAmount: number, newItems: Omit<Item, 'id' | 'entryDate' | 'status'>[]) => Promise<void>;
  addCoupon: (coupon: Coupon) => Promise<void>;
  addProfile: (profile: Omit<Profile, 'id' | 'createdAt'>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  fetchData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [itemsRes, vendorsRes, customersRes, couponsRes, salesRes, profilesRes] = await Promise.all([
        supabase.from('items').select('*').order('created_at', { ascending: false }),
        supabase.from('vendors').select('*').order('name'),
        supabase.from('customers').select('*').order('name'),
        supabase.from('coupons').select('*'),
        supabase.from('sales').select('*, sale_items(*)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('name')
      ]);

      if (itemsRes.data) {
        setItems(itemsRes.data.map(i => ({
          id: String(i.id),
          imageUrl: String(i.image_url || ''),
          category: String(i.title || ''),
          size: String(i.size || ''),
          condition: (i.condition || ItemCondition.GOOD) as ItemCondition,
          price: Number(i.price || 0),
          status: (i.status || ItemStatus.EVALUATION) as ItemStatus,
          vendorId: i.vendor_id ? String(i.vendor_id) : undefined,
          entryDate: String(i.created_at),
          soldDate: i.sold_at ? String(i.sold_at) : undefined
        })));
      }
      
      if (vendorsRes.data) {
        setVendors(vendorsRes.data.map(v => ({
          id: String(v.id),
          name: String(v.name || ''),
          phone: String(v.phone || ''),
          commissionRate: Number(v.commission_rate || 0.5),
          balance: Number(v.balance || 0)
        })));
      }

      if (customersRes.data) {
        setCustomers(customersRes.data.map(c => ({
          id: String(c.id),
          name: String(c.name || ''),
          cpf: String(c.cpf || ''),
          storeCredit: Number(c.store_credit || 0)
        })));
      }

      if (couponsRes.data) {
        setCoupons(couponsRes.data.map(cp => ({
          code: String(cp.code || ''),
          type: (cp.type || 'FIXED') as 'FIXED' | 'PERCENT',
          value: Number(cp.value || 0),
          active: Boolean(cp.active)
        })));
      }

      if (salesRes.data) {
        setSales(salesRes.data.map(s => ({
          id: String(s.id),
          items: [],
          total: Number(s.total_amount || 0),
          date: String(s.created_at),
          paymentMethod: (s.payment_method || 'CASH') as any,
          customerId: s.customer_id ? String(s.customer_id) : undefined,
          discountApplied: Number(s.discount_applied || 0) + Number(s.credit_used || 0)
        })));
      }

      if (profilesRes.data) {
        setProfiles(profilesRes.data.map(p => ({
          id: String(p.id),
          name: String(p.name || ''),
          email: String(p.email || ''),
          role: (p.role || 'CAIXA') as UserRole,
          createdAt: String(p.created_at)
        })));
      }
    } catch (error: any) {
      console.error('Falha ao buscar dados:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const uploadImage = async (base64: string): Promise<string> => {
    if (!base64.startsWith('data:image')) return base64;
    
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
      const res = await fetch(base64);
      const blob = await res.blob();
      
      const { error: uploadError } = await supabase.storage.from('products').upload(fileName, blob);
      
      if (uploadError) {
        console.error('Erro detalhado do Storage:', uploadError);
        if (uploadError.message.includes('row-level security')) {
          throw new Error('PERMISSÃO NEGADA: O bucket "products" no Supabase precisa de uma política (RLS) que permita inserção pública. Vá em Storage -> Policies e adicione uma política para o bucket "products".');
        }
        throw new Error(`Erro Storage: ${uploadError.message}`);
      }
      
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
      return publicUrl;
    } catch (e: any) {
      console.error('Falha no uploadImage:', e);
      throw e;
    }
  };

  const addItem = async (itemData: Omit<Item, 'id' | 'entryDate' | 'status'>) => {
    try {
      const publicUrl = await uploadImage(itemData.imageUrl);
      const { error } = await supabase.from('items').insert({
        title: itemData.category,
        size: itemData.size,
        condition: itemData.condition,
        price: itemData.price,
        image_url: publicUrl,
        vendor_id: itemData.vendorId || null,
        status: ItemStatus.EVALUATION
      });
      if (error) throw new Error(`Erro Banco: ${error.message}`);
      await fetchData();
    } catch (e: any) {
      console.error('Falha no addItem:', e);
      throw e;
    }
  };

  const updateItemStatus = async (id: string, status: ItemStatus) => {
    const { error } = await supabase.from('items').update({ status }).eq('id', id);
    if (error) throw new Error(error.message);
    await fetchData();
  };

  const addVendor = async (vendorData: Omit<Vendor, 'id' | 'balance'>) => {
    const { error } = await supabase.from('vendors').insert({
      name: vendorData.name,
      phone: vendorData.phone,
      commission_rate: vendorData.commissionRate
    });
    if (error) throw new Error(error.message);
    await fetchData();
  };

  const payVendor = async (vendorId: string, amount: number) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return;
    await supabase.from('vendor_payouts').insert({ vendor_id: vendorId, amount: amount });
    await supabase.from('vendors').update({ balance: vendor.balance - amount }).eq('id', vendorId);
    await fetchData();
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'storeCredit'>) => {
    const { error } = await supabase.from('customers').insert({ name: customerData.name, cpf: customerData.cpf });
    if (error) throw new Error(error.message);
    await fetchData();
  };

  const addCoupon = async (coupon: Coupon) => {
    const { error } = await supabase.from('coupons').insert({ code: coupon.code, type: coupon.type, value: coupon.value, active: coupon.active });
    if (error) throw new Error(error.message);
    await fetchData();
  };

  const addProfile = async (profileData: Omit<Profile, 'id' | 'createdAt'>) => {
    const { error } = await supabase.from('profiles').insert({
      name: profileData.name,
      email: profileData.email,
      role: profileData.role
    });
    if (error) throw new Error(`Erro Banco: ${error.message}`);
    await fetchData();
  };

  const deleteProfile = async (id: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await fetchData();
  };

  const processSale = async (itemIds: string[], customerId: string | undefined, paymentMethod: string, discount: number, usedCredit: number) => {
    const saleItemsList = items.filter(i => itemIds.includes(i.id));
    const subtotal = saleItemsList.reduce((acc, i) => acc + i.price, 0);
    const total = Math.max(0, subtotal - discount - usedCredit);

    const { data: saleData, error: saleError } = await supabase.from('sales').insert({
      customer_id: customerId || null,
      total_amount: total,
      discount_applied: discount,
      credit_used: usedCredit,
      payment_method: paymentMethod
    }).select().single();

    if (saleError || !saleData) throw new Error(`Venda falhou: ${saleError?.message}`);

    const saleItemsPayload = saleItemsList.map(item => ({
      sale_id: saleData.id,
      item_id: item.id,
      price_sold: item.price
    }));

    await supabase.from('sale_items').insert(saleItemsPayload);
    await supabase.from('items').update({ status: ItemStatus.SOLD, sold_at: new Date().toISOString() }).in('id', itemIds);

    for (const item of saleItemsList) {
      if (item.vendorId) {
        const vendor = vendors.find(v => v.id === item.vendorId);
        if (vendor) {
          const share = item.price * vendor.commissionRate;
          await supabase.from('vendors').update({ balance: vendor.balance + share }).eq('id', vendor.id);
        }
      }
    }

    if (customerId && usedCredit > 0) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        await supabase.from('customers').update({ store_credit: customer.storeCredit - usedCredit }).eq('id', customerId);
        await supabase.from('customer_transactions').insert({
          customer_id: customerId,
          type: 'CREDIT_SPENT',
          amount: usedCredit,
          description: `Venda #${String(saleData.id).slice(-4)}`,
          related_sale_id: saleData.id
        });
      }
    }

    await fetchData();
  };

  const processTradeIn = async (customerId: string, creditAmount: number, newItems: Omit<Item, 'id' | 'entryDate' | 'status'>[]) => {
    try {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        await supabase.from('customers').update({ store_credit: customer.storeCredit + creditAmount }).eq('id', customerId);
        await supabase.from('customer_transactions').insert({ customer_id: customerId, type: 'CREDIT_ADDED', amount: creditAmount, description: 'Troca de peças' });
      }
      for (const item of newItems) { await addItem(item); }
      await fetchData();
    } catch (e: any) {
      console.error('Falha no processTradeIn:', e);
      throw e;
    }
  };

  return (
    <StoreContext.Provider value={{ 
      items, vendors, customers, sales, coupons, profiles, loading,
      addItem, updateItemStatus, addVendor, payVendor, addCustomer, processSale, processTradeIn, addCoupon, fetchData, addProfile, deleteProfile
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
