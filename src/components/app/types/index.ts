export type PaymentMode = 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'RTGS';

export type StandardExpenseCategory =
  | 'Cement & Concrete'
  | 'Steel Reinforcement'
  | 'Masonry & Bricks'
  | 'Electrical & Plumbing'
  | 'Labor & Contractor'
  | 'Heavy Equipment & Crane'
  | 'Interior & Finishing'
  | 'Permits & Structural'
  | 'Architectural & Survey'
  | 'Miscellaneous';

export type ExpenseCategory = StandardExpenseCategory | (string & {});

export type SiteStatus =
  | 'Planning'
  | 'Active Construction'
  | 'Finishing & Interior'
  | 'Handover / Completed';

export type StandardProjectType =
  | 'Commercial High-Rise'
  | 'Luxury Villa'
  | 'Residential Complex'
  | 'Corporate Campus'
  | 'Infrastructure';

export type ProjectType = StandardProjectType | (string & {});

export interface AdvancePayment {
  id: string;
  date: string;
  paymentMode: PaymentMode;
  amount: number;
  referenceNotes: string;
  receivedBy?: string;
  createdAt: string;
}

export interface ExpenseItem {
  id: string;
  date: string;
  category: ExpenseCategory;
  vendorPayee?: string;
  quantity: number;
  unit: string;
  unitRate: number;
  totalAmount: number;
  paymentStatus?: 'Paid' | 'Pending' | 'Partial';
  billInvoiceRef?: string;
  notes?: string;
  createdAt: string;
}

export interface Site {
  id: string;
  siteName: string;
  clientName: string;
  siteAddress: string;
  contactNumber: string;
  email?: string;
  projectType: ProjectType;
  status: SiteStatus;
  startDate: string;
  estimatedCompletion?: string;
  advances: AdvancePayment[];
  expenses: ExpenseItem[];
  notes?: string;
  createdAt: string;
}

export interface SiteFinancials {
  totalAdvance: number;
  totalExpenses: number;
  netBalance: number;
  advanceCount: number;
  expenseCount: number;
  consumedPercentage: number;
  isDeficit: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description?: string;
}
