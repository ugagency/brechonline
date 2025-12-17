export enum ItemStatus {
  EVALUATION = 'EVALUATION',
  FOR_SALE = 'FOR_SALE',
  SOLD = 'SOLD',
  TRADED = 'TRADED', // Was traded out (unlikely) or archived
}

export enum ItemCondition {
  NEW = 'Novo com Etiqueta',
  EXCELLENT = 'Excelente',
  GOOD = 'Bom',
  FAIR = 'Com Detalhes',
}

export interface Vendor {
  id: string;
  name: string;
  phone: string;
  commissionRate: number; // 0 to 1 (e.g., 0.5 for 50%)
  balance: number;
}

export interface Customer {
  id: string;
  name: string;
  cpf: string;
  storeCredit: number;
}

export interface Item {
  id: string; // generated code
  imageUrl: string; // Mandatory image URL (Base64 or Link)
  category: string;
  size: string;
  condition: ItemCondition;
  price: number;
  status: ItemStatus;
  vendorId?: string; // Optional (if store owned)
  description?: string;
  entryDate: string;
  soldDate?: string;
}

export interface CartItem extends Item {
  // Helper for POS
}

export interface Sale {
  id: string;
  items: Item[];
  total: number;
  date: string;
  paymentMethod: 'CASH' | 'CARD' | 'PIX' | 'CREDIT';
  customerId?: string;
  discountApplied: number;
}

export interface Coupon {
  code: string;
  type: 'FIXED' | 'PERCENT';
  value: number;
  active: boolean;
}
