
export enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER',
  OWNER = 'OWNER',
  CUSTOMER = 'CUSTOMER'
}

export enum PaymentMethod {
  CASH = 'CASH',
  QRIS = 'QRIS',
  E_WALLET = 'E-WALLET',
  DEBIT = 'DEBIT'
}

export enum OpnameStatus {
  DRAFT = 'DRAFT',
  PROPOSED = 'PROPOSED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum PurchaseStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED'
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
}

export interface TransactionItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
}

export interface Transaction {
  id: string;
  date: string;
  items: TransactionItem[];
  total: number;
  tax: number;
  discountTotal: number;
  paymentMethod: PaymentMethod;
  cashierId: string;
  customerName?: string;
  tableNumber?: string;
}

export interface PurchaseItem {
  productId: string;
  name: string;
  buyPrice: number;
  quantity: number;
}

export interface PurchaseOrder {
  id: string;
  date: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  status: PurchaseStatus;
  receivedDate?: string;
}

export interface OpnameDetail {
  productId: string;
  productName: string;
  systemStock: number;
  physicalStock: number;
  difference: number;
}

export interface OpnameSession {
  id: string;
  date: string;
  status: OpnameStatus;
  createdBy: string;
  approvedBy?: string;
  details: OpnameDetail[];
  notes: string;
}

export interface StockLog {
  id: string;
  productId: string;
  date: string;
  type: 'IN' | 'OUT' | 'SALE' | 'OPNAME' | 'ADJUSTMENT' | 'PURCHASE';
  qty: number;
  referenceId: string;
  notes: string;
}
