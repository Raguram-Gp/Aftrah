-- ============================================================
-- AFTRAH CONSTRUCTIONS — INITIAL DATABASE SEED
-- Run this AFTER executing 20260828_init_aftrah_schema.sql
-- ============================================================

-- 1. SEED BANK ACCOUNTS
INSERT INTO public.bank_accounts (id, bank_name, account_number, ifsc_code, branch, balance, status)
VALUES
  ('a0000000-0000-4000-8000-000000000001', 'CANARA BANK', 'CNRB0001234', 'CNRB0001234', 'Main Branch', 1450000.00, 'ACTIVE'),
  ('a0000000-0000-4000-8000-000000000002', 'BANK OF BARODA', 'BARB0MAINXX', 'BARB0MAINXX', 'Commercial Hub', 820000.00, 'ACTIVE'),
  ('a0000000-0000-4000-8000-000000000003', 'STATE BANK OF INDIA', 'SBIN0005678', 'SBIN0005678', 'Industrial Area', 2340000.00, 'ACTIVE'),
  ('a0000000-0000-4000-8000-000000000004', 'HDFC BANK', 'HDFC0009988', 'HDFC0009988', 'City Center', 510000.00, 'ACTIVE'),
  ('a0000000-0000-4000-8000-000000000005', 'ICICI BANK', 'ICIC0004455', 'ICIC0004455', 'Corporate Park', 1250000.00, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED VENDOR CATEGORIES
INSERT INTO public.vendor_categories (id, s_no, type)
VALUES
  ('c0000000-0000-4000-8000-000000000001', 1, 'Bricks'),
  ('c0000000-0000-4000-8000-000000000002', 2, 'Cement'),
  ('c0000000-0000-4000-8000-000000000003', 3, 'Steel & TMT Bars'),
  ('c0000000-0000-4000-8000-000000000004', 4, 'M.Sand & River Sand'),
  ('c0000000-0000-4000-8000-000000000005', 5, 'Plumbing & Pipes'),
  ('c0000000-0000-4000-8000-000000000006', 6, 'Electricals & Wiring')
ON CONFLICT (type) DO NOTHING;

-- 3. SEED VENDORS / SHOPS
INSERT INTO public.vendors (id, category_id, s_no, name, phone, address)
VALUES
  ('b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 1, 'Ramesh Bricks & Co.', '+91 98451 22334', 'NH-44 Bypass Yard, Hosur Road'),
  ('b0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001', 2, 'Sri Vinayaga Clay Works', '+91 94432 88771', 'Kiln Unit 4, Outer Ring Road'),
  ('b0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000002', 1, 'UltraTech Super Depot', '+91 98840 11223', 'Godown 12, Transport Hub, Madhavaram'),
  ('b0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000003', 1, 'Tata Tiscon Steel Traders', '+91 97909 44332', 'Plot 45, Industrial Estate, Guindy')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED SAMPLE CLIENTS
INSERT INTO public.clients (id, name, phone, address)
VALUES
  ('f0000000-0000-4000-8000-000000000001', 'Aadhavan Raman', '+91 98401 23456', 'Plot 42, Anna Nagar West, Chennai, Tamil Nadu - 600040'),
  ('f0000000-0000-4000-8000-000000000002', 'Balaji Krishnan', '+91 98410 34567', 'No. 15, 4th Main Road, Gandhi Nagar, Adyar, Chennai - 600020'),
  ('f0000000-0000-4000-8000-000000000003', 'Chandran S.', '+91 98402 45678', 'Villa 8, Green Meadows, ECR, Injambakkam, Chennai - 600115'),
  ('f0000000-0000-4000-8000-000000000004', 'Deepak Soundar', '+91 98412 56789', '7th Floor, Silicon Towers, OMR, Perungudi, Chennai - 600096')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED CLIENT ADVANCES & EXPENSES FOR AADHAVAN RAMAN
INSERT INTO public.client_advance_payments (client_id, s_no, date, amount, mode)
VALUES
  ('f0000000-0000-4000-8000-000000000001', 1, '2026-08-01', 500000.00, 'Bank Transfer / NEFT'),
  ('f0000000-0000-4000-8000-000000000001', 2, '2026-08-15', 300000.00, 'Cheque (HDFC Bank)');

INSERT INTO public.client_expenses (client_id, s_no, date, expense_name, quantity, rate, total_amount)
VALUES
  ('f0000000-0000-4000-8000-000000000001', 1, '2026-08-05', 'Foundation Excavation & Earthwork', 1.00, 125000.00, 125000.00),
  ('f0000000-0000-4000-8000-000000000001', 2, '2026-08-12', 'Grade A Wirecut Red Bricks (5000 units)', 5000.00, 12.50, 62500.00),
  ('f0000000-0000-4000-8000-000000000001', 3, '2026-08-20', 'Fe 550D TMT Steel (3.5 Tons)', 3.50, 68000.00, 238000.00);

-- 6. SEED VENDOR PROCUREMENT LEDGER FOR RAMESH BRICKS
INSERT INTO public.vendor_ledgers (vendor_id, client_id, s_no, date, item_type, client_name, quantity, rate, total_amount, received_amount, balance_amount)
VALUES
  ('b0000000-0000-4000-8000-000000000001', 'f0000000-0000-4000-8000-000000000001', 1, '2026-08-10', 'First Quality Red Wirecut Bricks', 'Aadhavan Raman', 5000.00, 12.50, 62500.00, 40000.00, 22500.00),
  ('b0000000-0000-4000-8000-000000000001', 'f0000000-0000-4000-8000-000000000002', 2, '2026-08-18', 'Fly Ash Solid Blocks (4 inch)', 'Balaji Krishnan', 3000.00, 32.00, 96000.00, 96000.00, 0.00);
