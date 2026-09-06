import type { BankAccount } from '../types';

export const INITIAL_BANKS: BankAccount[] = [
  {
    id: 'bank-1',
    bankName: 'CANARA BANK',
    accountNumber: '•••• 4821',
    ifscCode: 'CNRB0001234',
    branch: 'MG Road Main Branch, Bengaluru',
    accountType: 'Current Account',
    status: 'PRIMARY ACCOUNT',
    balance: 1850000,
    updatedAt: '2026-02-25',
    transactions: [
      { id: 'btx-101', date: '2026-02-01', amount: 1500000, type: 'credit', note: 'Client Advance — Rajeshwar Singhania' },
      { id: 'btx-102', date: '2026-02-08', amount: 450000, type: 'debit', note: 'Vendor Payment — Ramesh Bricks' },
      { id: 'btx-103', date: '2026-02-15', amount: 1200000, type: 'credit', note: 'Milestone 2 Release — Nandini Kothari' },
      { id: 'btx-104', date: '2026-02-20', amount: 400000, type: 'debit', note: 'Steel Procurement settlement' }
    ]
  },
  {
    id: 'bank-2',
    bankName: 'BANK OF BARODA',
    accountNumber: '•••• 9152',
    ifscCode: 'BARB0INDIRA',
    branch: 'Indiranagar 100ft Road, Bengaluru',
    accountType: 'Current Account',
    status: 'ACTIVE',
    balance: 1220000,
    updatedAt: '2026-02-24',
    transactions: [
      { id: 'btx-201', date: '2026-02-03', amount: 1800000, type: 'credit', note: 'Project Advance — Dr. Vikramaditya Reddy' },
      { id: 'btx-202', date: '2026-02-12', amount: 580000, type: 'debit', note: 'Labour contractor payout' }
    ]
  },
  {
    id: 'bank-3',
    bankName: 'HDFC BANK',
    accountNumber: '•••• 7701',
    ifscCode: 'HDFC0000240',
    branch: 'Koramangala 4th Block, Bengaluru',
    accountType: 'Corporate Escrow',
    status: 'ACTIVE',
    balance: 2450000,
    updatedAt: '2026-02-26',
    transactions: [
      { id: 'btx-301', date: '2026-02-05', amount: 3500000, type: 'credit', note: 'Commercial site booking deposit' },
      { id: 'btx-302', date: '2026-02-18', amount: 1050000, type: 'debit', note: 'Cement & RMC batch dispatch' }
    ]
  },
  {
    id: 'bank-4',
    bankName: 'STATE BANK OF INDIA (SBI)',
    accountNumber: '•••• 3390',
    ifscCode: 'SBIN0000532',
    branch: 'Residency Road Commercial Branch, Bengaluru',
    accountType: 'Operational Account',
    status: 'RESERVE',
    balance: 980000,
    updatedAt: '2026-02-20',
    transactions: [
      { id: 'btx-401', date: '2026-02-10', amount: 1400000, type: 'credit', note: 'Client remittance' },
      { id: 'btx-402', date: '2026-02-22', amount: 420000, type: 'debit', note: 'Centring & scaffolding settlement' }
    ]
  }
];
