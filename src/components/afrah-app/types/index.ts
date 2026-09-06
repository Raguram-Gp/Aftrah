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

export interface BrickTransaction {
  id: string;
  customerId?: string;
  sNo: number;
  date: string;
  brickType: string;
  quantity: number;
  rate: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  siteLocation?: string;
  vehicleNumber?: string;
  driverPhone?: string;
  notes?: string;
  createdAt?: string;
}

export interface BrickCustomer {
  id: string;
  sNo: number;
  name: string;
  phone: string;
  address: string;
  balance: number;
  createdAt?: string;
  updatedAt?: string;
  transactions?: BrickTransaction[];
}

export const PREDEFINED_BRICK_TYPES = [
  'Red Chamber Bricks (1st Quality)',
  'Red Bricks (Standard)',
  'Fly Ash Bricks',
  'Solid Concrete Blocks (4 inch)',
  'Solid Concrete Blocks (6 inch)',
  'Hollow Blocks (8 inch)',
  'Wire Cut Bricks',
  'Clay Paver Bricks',
  'Custom / Other'
];

/* ==========================================
   CONSTRUCTION LABOUR CONTRACT TYPES & PRESETS
   ========================================== */

export const PREDEFINED_CONSTRUCTION_WORK_TYPES = [
  'Masonry Work',
  'Centring & Shuttering',
  'Bar Bending / Steel Work',
  'Concrete Pouring / RMC',
  'Earthwork & Foundation',
  'Plastering',
  'Painting & Whitewashing',
  'Tile & Granite Laying',
  'Electrical Rough-in',
  'Plumbing & Drainage',
  'Helper / Unskilled Labour'
];

/* ==========================================
   KAAB INTERIOR TYPES & PRESETS
   ========================================== */

export type InteriorSubTab = 'directory' | 'vendor' | 'labour_contract';

export interface LabourContractEntry {
  id: string;
  contractId?: string;
  sNo: number;
  date: string;
  workType: string; // e.g. "Carpenter" or "Masonry Work"
  days: number; // e.g. 1
  salaryPerDay: number; // e.g. 5000
  totalAmount: number; // e.g. 5000 (days * salaryPerDay)
  note?: string;
  createdAt?: string;
}

export interface LabourContract {
  id: string;
  sNo: number;
  date: string;
  labourName: string; // e.g. "Arumugam" or "Rajesh"
  siteName: string; // e.g. "Dr. Rajendran Villa" or "Palayam"
  phone: string; // e.g. "97892 91..."
  labourCharge: number; // e.g. 45000 (Agreed Total Labour Charge)
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  entries?: LabourContractEntry[];
}

export interface InteriorAdvancePayment {
  id: string;
  clientId?: string;
  sNo: number;
  date: string;
  amount: number;
  mode: string;
  note?: string;
  createdAt?: string;
}

export interface InteriorExpenseItem {
  id: string;
  clientId?: string;
  sNo: number;
  date: string;
  category?: string;
  expenseName: string; // Particulars
  quantity: number; // Qty
  unit?: string; // Per (Sq.ft, No, LSM, etc.)
  rate: number; // Rate
  totalAmount: number; // Amount
  createdAt?: string;
}

export interface InteriorClient {
  id: string;
  sNo: number;
  name: string;
  phone: string;
  address: string;
  siteLocation?: string;
  projectScope?: string;
  createdAt?: string;
  updatedAt?: string;
  advancePayments?: InteriorAdvancePayment[];
  expenses?: InteriorExpenseItem[];
}

export const INTERIOR_CATEGORIES = [
  'KITCHEN',
  'ACESSORIES FOR KITCHEN',
  'HALL TV UNIT',
  'WARDROBES - MASTER BEDROOM',
  'WARDROBES - BEDROOM-1',
  'WARDROBES - BEDROOM-2',
  'TRANSPORTATION',
  'OTHER WORK'
];

export const INTERIOR_UNITS = [
  'Sq.ft',
  'No',
  'LSM',
  'R.ft',
  'Sets',
  'Nos',
  'Trip'
];

export interface InteriorItemPreset {
  category: string;
  particulars: string;
  unit: string;
  defaultRate: number;
}

export const PREDEFINED_INTERIOR_ITEMS: InteriorItemPreset[] = [
  // 1. KITCHEN
  { category: 'KITCHEN', particulars: 'Base Unit (Box)', unit: 'Sq.ft', defaultRate: 1350 },
  { category: 'KITCHEN', particulars: 'Wall Unit (Box)-Full Length', unit: 'Sq.ft', defaultRate: 750 },
  { category: 'KITCHEN', particulars: 'Tall Unit (Shutter)', unit: 'Sq.ft', defaultRate: 450 },
  { category: 'KITCHEN', particulars: 'Civil Loft (Shutter)', unit: 'Sq.ft', defaultRate: 400 },
  { category: 'KITCHEN', particulars: 'Dining Vanity Unit', unit: 'Sq.ft', defaultRate: 1075 },

  // ACESSORIES FOR KITCHEN
  { category: 'ACESSORIES FOR KITCHEN', particulars: 'Tandem Box-8"', unit: 'No', defaultRate: 3300 },
  { category: 'ACESSORIES FOR KITCHEN', particulars: 'Tandem Box-6"', unit: 'No', defaultRate: 2900 },
  { category: 'ACESSORIES FOR KITCHEN', particulars: 'Tandem Box-4"', unit: 'No', defaultRate: 2700 },
  { category: 'ACESSORIES FOR KITCHEN', particulars: 'Cutlery Tray', unit: 'No', defaultRate: 1130 },
  { category: 'ACESSORIES FOR KITCHEN', particulars: 'Plate Tray', unit: 'No', defaultRate: 3500 },

  // 2. HALL TV UNIT
  { category: 'HALL TV UNIT', particulars: 'Base Unit', unit: 'Sq.ft', defaultRate: 750 },
  { category: 'HALL TV UNIT', particulars: 'Storage Unit-Profile Door', unit: 'Sq.ft', defaultRate: 600 },
  { category: 'HALL TV UNIT', particulars: 'TV Panelling', unit: 'Sq.ft', defaultRate: 410 },
  { category: 'HALL TV UNIT', particulars: 'Fluted Panel Panelling-15 nos', unit: 'LSM', defaultRate: 8000 },

  // 3. WARDROBES IN ROOMS - MASTER BEDROOM
  { category: 'WARDROBES - MASTER BEDROOM', particulars: 'Wardrobe (Shutter)', unit: 'Sq.ft', defaultRate: 450 },
  { category: 'WARDROBES - MASTER BEDROOM', particulars: 'Loft-1', unit: 'Sq.ft', defaultRate: 400 },
  { category: 'WARDROBES - MASTER BEDROOM', particulars: 'Loft-2', unit: 'Sq.ft', defaultRate: 400 },

  // BEDROOM-1
  { category: 'WARDROBES - BEDROOM-1', particulars: 'Wardrobe (Shutter)', unit: 'Sq.ft', defaultRate: 450 },
  { category: 'WARDROBES - BEDROOM-1', particulars: 'Loft', unit: 'Sq.ft', defaultRate: 400 },

  // BEDROOM-2
  { category: 'WARDROBES - BEDROOM-2', particulars: 'Wardrobe (Shutter)', unit: 'Sq.ft', defaultRate: 450 },
  { category: 'WARDROBES - BEDROOM-2', particulars: 'Loft', unit: 'Sq.ft', defaultRate: 400 },

  // TRANSPORTATION
  { category: 'TRANSPORTATION', particulars: 'Transportation', unit: 'Trip', defaultRate: 3000 },

  // OTHER GENERAL
  { category: 'OTHER WORK', particulars: 'False Ceiling (Gypsum / POP)', unit: 'Sq.ft', defaultRate: 110 },
  { category: 'OTHER WORK', particulars: 'Cove & Profile LED Lighting', unit: 'LSM', defaultRate: 250 },
  { category: 'OTHER WORK', particulars: 'Wall Painting & Texture Work', unit: 'Sq.ft', defaultRate: 45 },
  { category: 'OTHER WORK', particulars: 'Curtains & Blinds', unit: 'No', defaultRate: 3500 },
  { category: 'OTHER WORK', particulars: 'Other Custom Work', unit: 'Sq.ft', defaultRate: 0 }
];

export const PREDEFINED_INTERIOR_EXPENSES = PREDEFINED_INTERIOR_ITEMS.map((item) => item.particulars);

export const PREDEFINED_INTERIOR_VENDOR_TYPES = [
  'Hardware',
  'Carpenter',
  'Plywoods',
  'Glass & Profile',
  'Acrylic & Fluted Panels',
  'Electricals & Lighting',
  'PU Polish & Painting',
  'Other'
];

/* ==========================================
   KABIBULLAH BRICKS - SUB-MODULE TYPES
   ========================================== */

export type BricksSubTab = 'directory' | 'expenses' | 'stock';

export interface BrickProductionExpense {
  id: string;
  sNo: number;
  date: string;
  category: string;
  expenseName: string; // Particulars
  quantity: number;
  unit: string;
  rate: number;
  totalAmount: number;
  paymentMode: string;
  paidTo?: string; // Vendor / Contractor / Labor Name
  vehicleNumber?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const BRICK_PRODUCTION_EXPENSE_OPTIONS = [
  'Soil',
  'Wood',
  'Msand Tust',
  'Disel',
  'Oil',
  'Jcb - rent',
  'Tractor - rent',
  'Machine expense'
];

export const BRICK_PRODUCTION_CATEGORIES = [
  'Soil',
  'Wood',
  'Msand Tust',
  'Disel',
  'Oil',
  'Jcb - rent',
  'Tractor - rent',
  'Machine expense',
  'Other Expenses'
];

export const BRICK_EXPENSE_UNITS = [
  'Tons',
  'Loads / Tipper',
  'Nos',
  'Liters',
  'Days / Shift',
  'Trip',
  'Hours',
  'Lump Sum'
];

export interface BrickProductionPreset {
  category: string;
  particulars: string;
  unit: string;
  defaultRate: number;
}

export const PREDEFINED_BRICK_PRODUCTION_PRESETS: BrickProductionPreset[] = [
  { category: 'Firewood & Fuel (விறகு / எரிபொருள்)', particulars: 'Casuarina Firewood (சவுக்கு விறகு)', unit: 'Tons', defaultRate: 3800 },
  { category: 'Firewood & Fuel (விறகு / எரிபொருள்)', particulars: 'Hardwood / Juliflora Wood (கருவேல விறகு)', unit: 'Tons', defaultRate: 3200 },
  { category: 'Firewood & Fuel (விறகு / எரிபொருள்)', particulars: 'Lignite Coal (நிலக்கரி)', unit: 'Tons', defaultRate: 9500 },
  { category: 'Raw Clay & Soil (செம்மண் / களிமண்)', particulars: 'Red Clay Soil (செம்மண் - 6 Wheeler Tipper)', unit: 'Loads / Tipper', defaultRate: 4500 },
  { category: 'Raw Clay & Soil (செம்மண் / களிமண்)', particulars: 'Black Tank Silt / Clay (வண்டல் மண்)', unit: 'Loads / Tipper', defaultRate: 3800 },
  { category: 'Moulding Wages (அறுப்பு கூலி)', particulars: 'Table Moulding Wages (அறுப்பு கூலி - 1,000 Bricks)', unit: 'Nos', defaultRate: 850 },
  { category: 'Moulding Wages (அறுப்பு கூலி)', particulars: 'Machine Moulding Labor (இயந்திர அறுப்பு)', unit: 'Nos', defaultRate: 650 },
  { category: 'Loading & Unloading (ஏற்று / இறக்கு கூலி)', particulars: 'Green Brick Loading to Kiln (பச்சை செங்கல் ஏற்று கூலி)', unit: 'Nos', defaultRate: 220 },
  { category: 'Loading & Unloading (ஏற்று / இறக்கு கூலி)', particulars: 'Burned Brick Kiln Unloading (சுட்ட செங்கல் இறக்கு கூலி)', unit: 'Nos', defaultRate: 250 },
  { category: 'Loading & Unloading (ஏற்று / இறக்கு கூலி)', particulars: 'Lorry Loading Wages (லாரி லோடிங் கூலி)', unit: 'Nos', defaultRate: 180 },
  { category: 'Kiln Burning Labor (சுடும் தொழிலாளர்கள்)', particulars: 'Kiln Head Master Shift (சுடும் மேஸ்திரி)', unit: 'Days / Shift', defaultRate: 1200 },
  { category: 'Kiln Burning Labor (சுடும் தொழிலாளர்கள்)', particulars: 'Night Stoker Wages (இரவு நேர தொழிலாளர்)', unit: 'Days / Shift', defaultRate: 800 },
  { category: 'Machinery & Diesel (இயந்திரம் / டீசல்)', particulars: 'Tractor Diesel (டிராக்டர் டீசல்)', unit: 'Liters', defaultRate: 94 },
  { category: 'Machinery & Diesel (இயந்திரம் / டீசல்)', particulars: 'JCB / Excavator Digging & Mixing', unit: 'Hours', defaultRate: 1400 },
  { category: 'Sand & Fly Ash (மணல் / சாம்பல்)', particulars: 'M-Sand / Fine Sand for Moulding', unit: 'Loads / Tipper', defaultRate: 5200 },
  { category: 'Electricity & Utilities (மின்சாரம்)', particulars: 'TNEB Commercial Power Bill', unit: 'Lump Sum', defaultRate: 0 },
  { category: 'Maintenance & Repairs (பராமரிப்பு)', particulars: 'Moulding Table / Box Repair & Welding', unit: 'Lump Sum', defaultRate: 0 }
];

export const PREDEFINED_STOCK_ITEMS = [
  'Soil',
  'Bricks',
  'Diesel',
  'Msand',
  'Wood'
];

export const PREDEFINED_BRICK_STOCK_ITEMS = PREDEFINED_STOCK_ITEMS;

export type BrickStockMovementType = 'production' | 'dispatch' | 'breakage' | 'adjustment' | 'opening';

export interface BrickStockItemEntry {
  id: string;
  sNo: number;
  date: string;
  item?: string; // e.g. 'Soil' | 'Msand' | 'Wood' | 'Diesel' | 'Bricks'
  stockOpening: number;
  currentProduction: number; // for Bricks production or raw material inflow
  sales: number; // for Bricks sales or raw material usage
  materialUsage?: number; // alias for Soil, Msand, Wood (units / kg)
  materialInflow?: number; // alias for Soil, Msand, Wood inflow
  pendingStock: number;
  type?: 'production' | 'sales' | 'usage' | 'inflow';
  quantity?: number;
  batchNo?: string;
  vehicleNumber?: string;
  customerName?: string;
  notes?: string;
  balanceAfter?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrickStockItem {
  id: string;
  sNo: number;
  item: string; // 'Soil' | 'Bricks' | 'Diesel' | 'Msand' | 'Wood'
  stockOpening: number;
  currentProduction: number;
  sales: number;
  materialUsage?: number;
  pendingStock: number;
  unitRate?: number;
  unitName?: string;
  notes?: string;
  entries?: BrickStockItemEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BrickStockMovement {
  id: string;
  sNo: number;
  date: string;
  brickType: string;
  type: BrickStockMovementType;
  quantity: number;
  batchNo?: string;
  referenceNo?: string;
  customerName?: string;
  balanceAfter: number;
  notes?: string;
  createdAt?: string;
}
