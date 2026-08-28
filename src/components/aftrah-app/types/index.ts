export interface AdvancePayment {
  id: string;
  clientId?: string;
  sNo: number;
  date: string;
  amount: number;
  mode: string;
  createdAt?: string;
}

export interface ExpenseItem {
  id: string;
  clientId?: string;
  sNo: number;
  date: string;
  expenseName: string;
  quantity: number;
  rate: number;
  totalAmount: number;
  createdAt?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
  advancePayments?: AdvancePayment[];
  expenses?: ExpenseItem[];
}

export const PREDEFINED_EXPENSES = [
  'Mason team',
  'Brick',
  'M-Sand',
  'Jelly',
  'Cement',
  'Steel',
  'Paint',
  'Centring wages',
  'Other expenses',
  'Painter',
  'Gravel',
  'Carpenter (other)',
  'Set work',
  'Electrical things',
  'Electrician',
  'Tile',
  'Tile team wages'
];

export const PAYMENT_MODES = [
  'Cash',
  'Cheque',
  'UPI',
  'HDFC Bank',
  'State Bank of India (SBI)',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Canara Bank',
  'Bank of Baroda',
  'Punjab National Bank (PNB)'
];

export interface ShopTransaction {
  id: string;
  vendorId?: string;
  sNo: number;
  date: string;
  itemType: string;
  clientName?: string;
  clientId?: string;
  quantity: number;
  rate: number;
  totalAmount: number;
  receivedAmount: number;
  balanceAmount: number;
  createdAt?: string;
}

export interface VendorShop {
  id: string;
  categoryId?: string;
  sNo: number;
  name: string;
  phone: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
  transactions?: ShopTransaction[];
}

export interface Vendor {
  id: string;
  sNo: number;
  type: string;
  phone?: string;
  contactPerson?: string;
  createdAt?: string;
  updatedAt?: string;
  shops?: VendorShop[];
}

export interface BankTransaction {
  id: string;
  bankId?: string;
  date: string;
  amount: number;
  type: 'credit' | 'debit' | 'deposit' | 'withdrawal' | 'adjustment';
  note?: string;
  createdAt?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
  accountType?: string;
  status?: string;
  balance: number;
  transactions?: BankTransaction[];
  createdAt?: string;
  updatedAt?: string;
}

export const PREDEFINED_VENDOR_TYPES = [
  'Bricks',
  'Hardware',
  'M.Sand',
  'Jelly',
  'Cement',
  'Steel',
  'Paint',
  'Centring',
  'Gravel',
  'Electricals',
  'Tiles',
  'Carpentry / Timber',
  'Plumbing & Sanitaryware',
  'Glass & Aluminium',
  'Other'
];
