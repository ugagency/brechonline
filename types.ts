
export enum ItemStatus {
  EVALUATION = 'EVALUATION',
  FOR_SALE = 'FOR_SALE',
  SOLD = 'SOLD',
  TRADED = 'TRADED',
}

export enum ItemCondition {
  NEW = 'Novo com Etiqueta',
  EXCELLENT = 'Excelente',
  GOOD = 'Bom',
  FAIR = 'Com Detalhes',
}

export type UserRole = 'ADMIN' | 'CAIXA';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  phone: string;
  commissionRate: number;
  balance: number;
}

export interface Customer {
  id: string;
  name: string;
  cpf: string;
  storeCredit: number;
}

export interface Item {
  id: string;
  imageUrl: string;
  category: string;
  size: string;
  condition: ItemCondition;
  price: number;
  status: ItemStatus;
  vendorId?: string;
  description?: string;
  entryDate: string;
  soldDate?: string;
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
