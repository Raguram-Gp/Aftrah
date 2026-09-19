import type { BankAccount } from '../types';

export const INITIAL_BANKS: BankAccount[] = [
  {
    id: '771bebce-329c-41a6-8c03-bd994a01db7d',
    bankName: 'CANARA BANK',
    accountNumber: '•••• 4821',
    ifscCode: 'CNRB0001234',
    branch: 'MG Road Main Branch, Bengaluru',
    accountType: 'Current Account',
    status: 'PRIMARY ACCOUNT',
    balance: 1850000,
    updatedAt: '2026-02-25',
    transactions: [
      { id: '1ba8804d-eb75-419b-b76a-0baf70dd5962', date: '2026-02-01', amount: 1500000, type: 'credit', note: 'Client Advance — Rajeshwar Singhania' },
      { id: '97573e83-57d9-4377-99a3-3d38b32c37a0', date: '2026-02-08', amount: 450000, type: 'debit', note: 'Vendor Payment — Ramesh Bricks' },
      { id: '259810d1-1b02-4458-9a1d-aeed64bb18f4', date: '2026-02-15', amount: 1200000, type: 'credit', note: 'Milestone 2 Release — Nandini Kothari' },
      { id: 'b85a601b-4fb6-49ad-8582-167e334e6870', date: '2026-02-20', amount: 400000, type: 'debit', note: 'Steel Procurement settlement' }
    ]
  },
  {
    id: '181b7683-0997-493e-b046-777be31f4e3b',
    bankName: 'BANK OF BARODA',
    accountNumber: '•••• 9152',
    ifscCode: 'BARB0INDIRA',
    branch: 'Indiranagar 100ft Road, Bengaluru',
    accountType: 'Current Account',
    status: 'ACTIVE',
    balance: 1220000,
    updatedAt: '2026-02-24',
    transactions: [
      { id: '54af6e5c-d2be-4181-8140-c90fbf67f636', date: '2026-02-03', amount: 1800000, type: 'credit', note: 'Project Advance — Dr. Vikramaditya Reddy' },
      { id: '9dd0f563-3922-49b0-a68a-fc59ed132d0d', date: '2026-02-12', amount: 580000, type: 'debit', note: 'Labour contractor payout' }
    ]
  },
  {
    id: 'dcd72c3a-5d41-416d-b2b6-07b5d791d5a5',
    bankName: 'HDFC BANK',
    accountNumber: '•••• 7701',
    ifscCode: 'HDFC0000240',
    branch: 'Koramangala 4th Block, Bengaluru',
    accountType: 'Corporate Escrow',
    status: 'ACTIVE',
    balance: 2450000,
    updatedAt: '2026-02-26',
    transactions: [
      { id: '3c813301-60f8-451f-be6a-754aa231cb43', date: '2026-02-05', amount: 3500000, type: 'credit', note: 'Commercial site booking deposit' },
      { id: '18490639-f5f1-4288-aca2-5c011b2da0f5', date: '2026-02-18', amount: 1050000, type: 'debit', note: 'Cement & RMC batch dispatch' }
    ]
  },
  {
    id: '04779ee6-eab4-4b4f-9c0d-bb4542839848',
    bankName: 'STATE BANK OF INDIA (SBI)',
    accountNumber: '•••• 3390',
    ifscCode: 'SBIN0000532',
    branch: 'Residency Road Commercial Branch, Bengaluru',
    accountType: 'Operational Account',
    status: 'RESERVE',
    balance: 980000,
    updatedAt: '2026-02-20',
    transactions: [
      { id: '0e40095f-8282-49f2-805e-ec3dfd3d779d', date: '2026-02-10', amount: 1400000, type: 'credit', note: 'Client remittance' },
      { id: '30181b80-d7b3-4dc3-8ee6-7e29a1f985ac', date: '2026-02-22', amount: 420000, type: 'debit', note: 'Centring & scaffolding settlement' }
    ]
  }
];
