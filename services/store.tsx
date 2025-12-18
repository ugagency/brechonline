
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  deleteItem: (id: string) => Promise<void>;
  addVendor: (vendor: Omit<Vendor, 'id' | 'balance'>) => Promise<void>;
  payVendor: (vendorId: string, amount: number) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'storeCredit'>) => Promise<void>;
  processSale: (itemIds: string[], customerId: string | undefined, paymentMethod: string, discount: number, usedCredit: number) => Promise<void>;
  processTradeIn: (customerId: string, creditAmount: number, newItems: Omit<Item, 'id' | 'entryDate' | 'status'>[]) => Promise<void>;
  addCoupon: (coupon: Coupon) => Promise<void>;
  addProfile: (profile: Omit<Profile, 'id' | 'createdAt' | 'active'>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  toggleProfileStatus: (id: string, currentStatus: boolean) => Promise<void>;
  authenticate: (email: string, password: string) => Promise<Profile | null>;
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

  const fetchData = useCallback(async () => {
    try {
      const [itemsRes, vendorsRes, customersRes, couponsRes, salesRes, profilesRes] = await Promise.all([
        supabase.from('items').select('*').order('created_at', { ascending: false }),
        supabase.from('vendors').select('*').order('name'),
        supabase.from('customers').select('*').order('name'),
        supabase.from('coupons').select('*'),
        supabase.from('sales').select('*, sale_items(*)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('name')
      ]);

      setItems((itemsRes.data || []).map(i => ({
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
      
      setVendors((vendorsRes.data || []).map(v => ({
        id: String(v.id),
        name: String(v.name || ''),
        phone: String(v.phone || ''),
        commissionRate: Number(v.commission_rate || 0.5),
        balance: Number(v.balance || 0)
      })));

      setCustomers((customersRes.data || []).map(c => ({
        id: String(c.id),
        name: String(c.name || ''),
        cpf: String(c.cpf || ''),
        storeCredit: Number(c.store_credit || 0)
      })));

      setCoupons((couponsRes.data || []).map(cp => ({
        code: String(cp.code || ''),
        type: (cp.type || 'FIXED') as 'FIXED' | 'PERCENT',
        value: Number(cp.value || 0),
        active: Boolean(cp.active)
      })));

      setSales((salesRes.data || []).map(s => ({
        id: String(s.id),
        items: [],
        total: Number(s.total_amount || 0),
        date: String(s.created_at),
        paymentMethod: (s.payment_method || 'CASH') as any,
        customerId: s.customer_id ? String(s.customer_id) : undefined,
        discountApplied: Number(s.discount_applied || 0) + Number(s.credit_used || 0)
      })));

      setProfiles((profilesRes.data || []).map(p => ({
        id: String(p.id),
        name: String(p.name || ''),
        email: String(p.email || ''),
        role: (p.role || 'CAIXA') as UserRole,
        active: p.active !== false,
        createdAt: String(p.created_at)
      })));

    } catch (error: any) {
      console.error('Falha ao buscar dados:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const authenticate = async (email: string, password: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !data) return null;
    if (!data.active) throw new Error("Esta conta está desativada. Entre em contato com o administrador.");

    return {
      id: String(data.id),
      name: String(data.name),
      email: String(data.email),
      role: data.role as UserRole,
      active: data.active,
      createdAt: String(data.created_at)
    };
  };

  const addItem = async (itemData: Omit<Item, 'id' | 'entryDate' | 'status'>) => {
    const { error } = await supabase.from('items').insert({
      title: itemData.category,
      size: itemData.size,
      condition: itemData.condition,
      price: itemData.price,
      image_url: itemData.imageUrl,
      vendor_id: itemData.vendorId || null,
      status: ItemStatus.EVALUATION
    });
    if (error) throw new Error(error.message);
    await fetchData();
  };

  const updateItemStatus = async (id: string, status: ItemStatus) => {
    const { error } = await supabase.from('items').update({ status }).eq('id', id);
    if (error) throw new Error(error.message);
    await fetchData();
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('items').delete().eq('id', id);
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

  const addProfile = async (profileData: Omit<Profile, 'id' | 'createdAt' | 'active'>) => {
    const { error } = await supabase.from('profiles').insert({
      name: profileData.name,
      email: profileData.email,
      password: profileData.password,
      role: profileData.role,
      active: true
    });
    if (error) throw new Error(error.message);
    await fetchData();
  };

  const toggleProfileStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('profiles').update({ active: !currentStatus }).eq('id', id);
    if (error) throw new Error(error.message);
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
      }
    }

    await fetchData();
  };

  const processTradeIn = async (customerId: string, creditAmount: number, newItems: Omit<Item, 'id' | 'entryDate' | 'status'>[]) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      await supabase.from('customers').update({ store_credit: customer.storeCredit + creditAmount }).eq('id', customerId);
    }
    for (const item of newItems) { await addItem(item); }
    await fetchData();
  };

  return (
    <StoreContext.Provider value={{ 
      items, vendors, customers, sales, coupons, profiles, loading,
      addItem, updateItemStatus, deleteItem, addVendor, payVendor, addCustomer, processSale, processTradeIn, addCoupon, fetchData, addProfile, deleteProfile, toggleProfileStatus, authenticate
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
