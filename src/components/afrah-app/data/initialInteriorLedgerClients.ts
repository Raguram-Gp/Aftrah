import type { Client } from '../types';

export const INITIAL_INTERIOR_LEDGER_CLIENTS: Client[] = [
  {
    id: 'int-client-001',
    name: 'Karthik Rajan',
    phone: '+91 98401 55678',
    address: 'Penthouse 402, Skyline Residency, Anna Nagar, Chennai',
    createdAt: '2026-01-10',
    advancePayments: [
      { id: 'adv-int-001', sNo: 1, date: '2026-01-10', amount: 350000, mode: 'HDFC Bank' },
      { id: 'adv-int-002', sNo: 2, date: '2026-01-25', amount: 250000, mode: 'UPI' },
      { id: 'adv-int-003', sNo: 3, date: '2026-02-10', amount: 200000, mode: 'Cheque' },
      { id: 'adv-int-004', sNo: 4, date: '2026-02-22', amount: 150000, mode: 'State Bank of India (SBI)' },
    ],
    expenses: [
      { id: 'exp-int-001', sNo: 1, date: '2026-01-12', expenseName: 'Plywood (BWP 710)', quantity: 45, rate: 2400, totalAmount: 108000 },
      { id: 'exp-int-002', sNo: 2, date: '2026-01-18', expenseName: 'Laminate Sheets (1mm)', quantity: 30, rate: 1850, totalAmount: 55500 },
      { id: 'exp-int-003', sNo: 3, date: '2026-01-28', expenseName: 'Modular Kitchen Hardware', quantity: 1, rate: 85000, totalAmount: 85000 },
      { id: 'exp-int-004', sNo: 4, date: '2026-02-02', expenseName: 'False Ceiling Gypsum', quantity: 650, rate: 110, totalAmount: 71500 },
      { id: 'exp-int-005', sNo: 5, date: '2026-02-08', expenseName: 'LED Profile & Strip Lights', quantity: 24, rate: 1450, totalAmount: 34800 },
      { id: 'exp-int-006', sNo: 6, date: '2026-02-15', expenseName: 'Carpenter Team Wages', quantity: 1, rate: 95000, totalAmount: 95000 },
      { id: 'exp-int-007', sNo: 7, date: '2026-02-20', expenseName: 'PU Polish & Paint Finish', quantity: 1, rate: 62000, totalAmount: 62000 },
    ],
  },
  {
    id: 'int-client-002',
    name: 'Dr. Vikramaditya Reddy',
    phone: '+91 97910 88901',
    address: 'Plot 12, Jubilee Hills Extension, Hyderabad',
    createdAt: '2026-01-15',
    advancePayments: [
      { id: 'adv-int-005', sNo: 1, date: '2026-01-15', amount: 500000, mode: 'ICICI Bank' },
      { id: 'adv-int-006', sNo: 2, date: '2026-02-01', amount: 400000, mode: 'HDFC Bank' },
      { id: 'adv-int-007', sNo: 3, date: '2026-02-18', amount: 300000, mode: 'UPI' },
    ],
    expenses: [
      { id: 'exp-int-008', sNo: 1, date: '2026-01-20', expenseName: 'Veneer Paneling Sheets', quantity: 25, rate: 3800, totalAmount: 95000 },
      { id: 'exp-int-009', sNo: 2, date: '2026-01-26', expenseName: 'Wardrobe Sliding Fittings', quantity: 3, rate: 22000, totalAmount: 66000 },
      { id: 'exp-int-010', sNo: 3, date: '2026-02-05', expenseName: 'Master Bedroom Bed & Paneling', quantity: 1, rate: 140000, totalAmount: 140000 },
      { id: 'exp-int-011', sNo: 4, date: '2026-02-12', expenseName: 'Toughened Glass Partitions', quantity: 4, rate: 16500, totalAmount: 66000 },
      { id: 'exp-int-012', sNo: 5, date: '2026-02-21', expenseName: 'Designer Wallpaper & Textured Paint', quantity: 1, rate: 58000, totalAmount: 58000 },
    ],
  },
  {
    id: 'int-client-003',
    name: 'Priya Sundaram',
    phone: '+91 94440 23456',
    address: 'Villa 8, Palm Meadows, ECR, Chennai',
    createdAt: '2026-02-01',
    advancePayments: [
      { id: 'adv-int-008', sNo: 1, date: '2026-02-01', amount: 300000, mode: 'UPI' },
      { id: 'adv-int-009', sNo: 2, date: '2026-02-20', amount: 200000, mode: 'Cheque' },
    ],
    expenses: [
      { id: 'exp-int-013', sNo: 1, date: '2026-02-04', expenseName: 'Modular Kitchen Quartz Countertop', quantity: 1, rate: 72000, totalAmount: 72000 },
      { id: 'exp-int-014', sNo: 2, date: '2026-02-11', expenseName: 'Acrylic Cabinet Shutters', quantity: 18, rate: 2600, totalAmount: 46800 },
      { id: 'exp-int-015', sNo: 3, date: '2026-02-23', expenseName: 'Electrical Fixtures & Switches', quantity: 1, rate: 38000, totalAmount: 38000 },
    ],
  },
];
