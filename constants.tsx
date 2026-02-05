
import { Product, UserRole, PaymentMethod, OpnameStatus } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', sku: 'PRD-001', name: 'Indomie Goreng Spcl', category: 'Food', unit: 'Pcs', buyPrice: 2500, sellPrice: 3500, stock: 120, minStock: 20 },
  { id: '2', sku: 'PRD-002', name: 'Le Minerale 600ml', category: 'Drink', unit: 'Btl', buyPrice: 2200, sellPrice: 3500, stock: 85, minStock: 15 },
  { id: '3', sku: 'PRD-003', name: 'Pepsodent 120g', category: 'Personal Care', unit: 'Pcs', buyPrice: 12000, sellPrice: 15500, stock: 45, minStock: 10 },
  { id: '4', sku: 'PRD-004', name: 'Minyak Goreng 2L', category: 'Kitchen', unit: 'Pch', buyPrice: 32000, sellPrice: 36000, stock: 12, minStock: 10 },
  { id: '5', sku: 'PRD-005', name: 'Beras Pandan Wangi 5kg', category: 'Food', unit: 'Bag', buyPrice: 65000, sellPrice: 78000, stock: 8, minStock: 5 },
];

export const CATEGORIES = ['Food', 'Drink', 'Personal Care', 'Kitchen', 'Other'];
export const UNITS = ['Pcs', 'Btl', 'Pch', 'Bag', 'Box'];

export const APP_CONFIG = {
  TAX_RATE: 0.11, // 11% PPN
  STORE_NAME: 'OmniPOS Enterprise',
  CURRENCY: 'IDR'
};
