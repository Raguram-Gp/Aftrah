-- ============================================================
-- AFTRAH CONSTRUCTIONS & BRICK FACTORY — SEED CLOUD DATA
-- Migration: 20260905_seed_cloud_data.sql
-- ============================================================

-- 1. SEED INTERIOR CLIENTS
INSERT INTO public.interior_clients (id, s_no, name, phone, address, site_location, project_scope)
VALUES
  ('interior-client-1', 1, 'Mr. Afrah Construction', '98401 23456', 'Uthamapalayam', 'Quote No: Q/04.04.2026 · First Floor', 'Materials of 16mm MDF with Mica lamination and 6mm Back-panel ply with PVC edgeband along with Handles and Hardwares'),
  ('interior-client-2', 2, 'K. Mohammed Yusuf', '98412 88776', 'Theni Main Road, Cumbum', '2nd Floor Penthouse', 'High Gloss Acrylic Modular Kitchen, Walk-in Wardrobe and Living Area Profile TV Unit'),
  ('interior-client-3', 3, 'Dr. S. Karthikeyan', '94433 55667', 'Bodinayakkanur', 'Ground Floor Renovation', 'Master Bedroom Loft and Sliding Wardrobe, Dining Vanity counter, and Study Table Unit')
ON CONFLICT (id) DO NOTHING;

-- Seed Interior Client Advances
INSERT INTO public.interior_client_advances (id, client_id, s_no, date, amount, mode, note)
VALUES
  ('adv-int-1', 'interior-client-1', 1, '2026-04-04', 163845.00, 'HDFC Bank', '50% Advance on confirmation & PO'),
  ('adv-int-2', 'interior-client-1', 2, '2026-04-18', 98307.00, 'UPI', '30% On delivery of Carcass Material'),
  ('adv-int-3', 'interior-client-2', 1, '2026-03-10', 100000.00, 'HDFC Bank', 'Initial Booking Advance'),
  ('adv-int-4', 'interior-client-3', 1, '2026-02-15', 75000.00, 'Cash', 'Site measurement advance')
ON CONFLICT (id) DO NOTHING;

-- Seed Interior Client Expenses
INSERT INTO public.interior_client_expenses (id, client_id, s_no, date, category, expense_name, quantity, unit, rate, total_amount)
VALUES
  ('exp-int-1', 'interior-client-1', 1, '2026-04-04', 'KITCHEN', 'Base Unit (Box)', 55.5, 'Sq.ft', 1350.00, 74925.00),
  ('exp-int-2', 'interior-client-1', 2, '2026-04-04', 'KITCHEN', 'Wall Unit (Box)-Full Length', 31.0, 'Sq.ft', 750.00, 23250.00),
  ('exp-int-3', 'interior-client-1', 3, '2026-04-04', 'KITCHEN', 'Tall Unit (Shutter)', 28.0, 'Sq.ft', 450.00, 12600.00),
  ('exp-int-4', 'interior-client-1', 4, '2026-04-04', 'KITCHEN', 'Civil Loft (Shutter)', 24.5, 'Sq.ft', 400.00, 9800.00),
  ('exp-int-5', 'interior-client-1', 5, '2026-04-04', 'HALL TV UNIT', 'Base Unit', 32.0, 'Sq.ft', 750.00, 24000.00),
  ('exp-int-6', 'interior-client-1', 6, '2026-04-04', 'HALL TV UNIT', 'TV Panelling', 64.0, 'Sq.ft', 410.00, 26240.00)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED INTERIOR LABOUR CONTRACTS
INSERT INTO public.interior_labour_contracts (id, s_no, date, labour_name, site_name, phone, labour_charge, notes)
VALUES
  ('contract-1', 1, '2026-02-15', 'Rajesh', 'Palayam', '+91 97892 91845', 45000.00, 'Modular kitchen carcass assembly & wardrobe carcass setup'),
  ('contract-2', 2, '2026-02-18', 'Murugan Team (Civil & Masonry)', 'A.R. Rahman Villa', '+91 98402 11223', 28000.00, 'Kitchen granite counter civil platform & wall groove cutting'),
  ('contract-3', 3, '2026-02-22', 'Karthik (POP & False Ceiling)', 'Green Meadows Apt', '+91 98405 66778', 35000.00, 'Living room perimeter cove false ceiling & LED profile channels')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.interior_labour_entries (id, contract_id, s_no, date, work_type, days, salary_per_day, total_amount, note)
VALUES
  ('lc-entry-1', 'contract-1', 1, '2026-08-02', 'Carpenter', 1.0, 5000.00, 5000.00, 'Kitchen bottom cabinet assembly'),
  ('lc-entry-2', 'contract-2', 1, '2026-02-19', 'Masonry Work', 2.0, 3500.00, 7000.00, 'Granite frame civil work'),
  ('lc-entry-3', 'contract-3', 1, '2026-02-23', 'Ceiling Framing', 3.0, 4000.00, 12000.00, 'Gypsum grid install')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED CONSTRUCTION LABOUR CONTRACTS
INSERT INTO public.construction_labour_contracts (id, s_no, date, labour_name, site_name, phone, labour_charge, notes)
VALUES
  ('c-contract-1', 1, '2026-02-10', 'Arumugam & Co. (Centring & Shuttering)', 'Dr. K. Rajendran Villa - Site #4', '+91 94432 18920', 95000.00, 'Ground floor slab shuttering, column box fixing, and staging work'),
  ('c-contract-2', 2, '2026-02-14', 'Murugesan Mason Team (Brickwork & Masonry)', 'Commercial Complex - Anna Nagar', '+91 98421 77654', 140000.00, 'Full outer wall 9-inch chamber brick masonry and internal 4.5-inch partition walls'),
  ('c-contract-3', 3, '2026-02-18', 'Selvam Steel Benders (Bar Bending & Reinforcement)', 'Green Valley Plot 14 Residence', '+91 99520 33412', 65000.00, 'Footing mesh, column vertical reinforcement rings, and roof slab beam tying')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.construction_labour_entries (id, contract_id, s_no, date, work_type, days, salary_per_day, total_amount, note)
VALUES
  ('c-entry-1', 'c-contract-1', 1, '2026-02-12', 'Centring & Shuttering', 3.0, 4500.00, 13500.00, 'Column formwork & prop staging stage-1'),
  ('c-entry-2', 'c-contract-1', 2, '2026-02-16', 'Centring & Shuttering', 4.0, 4500.00, 18000.00, 'Beam bottom and main slab centring sheet fixing'),
  ('c-entry-3', 'c-contract-2', 1, '2026-02-17', 'Masonry Work', 4.0, 6000.00, 24000.00, 'South & East outer wall 9-inch brick laying'),
  ('c-entry-4', 'c-contract-2', 2, '2026-02-21', 'Masonry Work', 3.0, 6000.00, 18000.00, 'Room partitions and lintel level bed block finishing'),
  ('c-entry-5', 'c-contract-3', 1, '2026-02-19', 'Bar Bending / Steel Work', 2.0, 5000.00, 10000.00, 'Roof beam rebars cutting, cranking, and stirrups tying')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED BRICK CUSTOMERS
INSERT INTO public.brick_customers (id, s_no, name, phone, address, balance)
VALUES
  ('bc_01', 1, 'Kabibullah Rahman', '+91 98410 23456', 'No. 45, Anna Nagar Main Road, Madurai - 625020', 48500.00),
  ('bc_02', 2, 'Murugan Builders & Promoters', '+91 97890 11223', 'Plot 18, Bypass Road, Ponmeni, Madurai - 625016', 82000.00),
  ('bc_03', 3, 'Senthil Kumar Infrastructure', '+91 94430 88990', '4th Cross Street, K.K. Nagar, Madurai - 625020', 0.00),
  ('bc_04', 4, 'Al-Ameen Housing Society', '+91 98422 44556', 'Main Bazaar, Melur, Madurai District - 625106', 60500.00),
  ('bc_05', 5, 'Rajeshwari Promoters', '+91 99940 33221', 'Vilangudi Industrial Estate, Madurai - 625018', 35000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.brick_transactions (id, customer_id, s_no, date, brick_type, quantity, rate, total_amount, paid_amount, balance_amount, site_location, vehicle_number, notes)
VALUES
  ('btx_01', 'bc_01', 1, '2026-01-15', 'Red Chamber Bricks (1st Quality)', 5000.0, 11.50, 57500.00, 30000.00, 27500.00, 'Site #12, Ellis Nagar', 'TN 58 AA 4521', 'First delivery batch of 5k chamber bricks'),
  ('btx_02', 'bc_01', 2, '2026-02-10', 'Fly Ash Bricks', 3500.0, 6.00, 21000.00, 0.00, 21000.00, 'Site #12, Ellis Nagar (Compound Wall)', 'TN 58 B 8899', 'Fly ash bricks for boundary wall'),
  ('btx_03', 'bc_02', 1, '2026-01-20', 'Red Chamber Bricks (1st Quality)', 8000.0, 11.50, 92000.00, 50000.00, 42000.00, 'Ponmeni Luxury Enclave - Phase II', 'TN 58 C 1234', 'Direct factory dispatch for 1st floor masonry'),
  ('btx_04', 'bc_02', 2, '2026-02-18', 'Solid Concrete Blocks (6 inch)', 2500.0, 32.00, 80000.00, 40000.00, 40000.00, 'Ponmeni Commercial Block A', 'TN 58 C 5678', 'Solid blocks for basement foundation partition')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED BRICK STOCK ITEMS & MOVEMENTS
INSERT INTO public.brick_stock_items (id, s_no, item, stock_opening, current_production, sales, material_usage, pending_stock, unit_name)
VALUES
  ('bsi_soil', 1, 'Soil', 10000.0, 0.0, 5000.0, 5000.0, 5000.0, 'Units / Loads'),
  ('bsi_bricks', 2, 'Bricks', 10000.0, 50000.0, 35000.0, 0.0, 25000.0, 'Units'),
  ('bsi_diesel', 3, 'Diesel', 2000.0, 0.0, 800.0, 800.0, 1200.0, 'Liters'),
  ('bsi_msand', 4, 'Msand', 1500.0, 0.0, 500.0, 500.0, 1000.0, 'Tons / Loads'),
  ('bsi_wood', 5, 'Wood', 5000.0, 0.0, 2000.0, 2000.0, 3000.0, 'Tons')
ON CONFLICT (item) DO NOTHING;

INSERT INTO public.brick_stock_entries (id, stock_item_id, s_no, date, item, stock_opening, current_production, sales, material_usage, material_inflow, pending_stock, type, quantity, batch_no, vehicle_number, customer_name, notes, balance_after)
VALUES
  ('bse_s1', 'bsi_soil', 1, '2026-09-01', 'Soil', 10000.0, 0.0, 5000.0, 5000.0, 0.0, 5000.0, 'usage', 5000.0, '', '', '', 'Soil used for mixing', 5000.0),
  ('bse_b1', 'bsi_bricks', 1, '2026-09-01', 'Bricks', 10000.0, 50000.0, 35000.0, 0.0, 50000.0, 25000.0, 'production', 50000.0, 'Kiln Chamber #3 & #4', 'TN 58 B 7712', 'Kabibullah Rahman', 'High quality batch', 25000.0),
  ('bse_d1', 'bsi_diesel', 1, '2026-09-01', 'Diesel', 2000.0, 0.0, 800.0, 800.0, 0.0, 1200.0, 'usage', 800.0, '', 'TN 58 Tractor', '', 'Tractor generator and pump usage', 1200.0),
  ('bse_m1', 'bsi_msand', 1, '2026-09-01', 'Msand', 1500.0, 0.0, 500.0, 500.0, 0.0, 1000.0, 'usage', 500.0, '', 'TN 58 Tipper', '', 'Used for chamber moulds', 1000.0),
  ('bse_w1', 'bsi_wood', 1, '2026-09-01', 'Wood', 5000.0, 0.0, 2000.0, 2000.0, 0.0, 3000.0, 'usage', 2000.0, '', 'TN 58 Lorry', '', 'Kiln burning fuel batch 1', 3000.0)
ON CONFLICT (id) DO NOTHING;

-- 6. SEED BRICK PRODUCTION EXPENSES
INSERT INTO public.brick_production_expenses (id, s_no, date, category, expense_name, quantity, unit, rate, total_amount, payment_mode, notes)
VALUES
  ('bpe_01', 1, '2026-03-01', 'Soil', 'Soil', 5.0, 'Units', 4500.00, 22500.00, 'Cash', 'Soil for brick mixture'),
  ('bpe_02', 2, '2026-02-28', 'Wood', 'Wood', 10.0, 'Units', 3800.00, 38000.00, 'Cash', 'Wood for kiln burning'),
  ('bpe_03', 3, '2026-02-27', 'Msand Tust', 'Msand Tust', 4.0, 'Units', 3200.00, 12800.00, 'Cash', 'Msand Tust for table moulding'),
  ('bpe_04', 4, '2026-02-26', 'Disel', 'Disel', 150.0, 'Units', 95.00, 14250.00, 'UPI', 'Diesel for tractors and pugmill engine'),
  ('bpe_05', 5, '2026-02-25', 'Oil', 'Oil', 2.0, 'Units', 3500.00, 7000.00, 'Cash', 'Engine oil change for brick machinery'),
  ('bpe_06', 6, '2026-02-24', 'Jcb - rent', 'Jcb - rent', 12.0, 'Units', 1400.00, 16800.00, 'HDFC Bank', 'Clay soil digging & mixing excavation'),
  ('bpe_07', 7, '2026-02-23', 'Tractor - rent', 'Tractor - rent', 3.0, 'Units', 2500.00, 7500.00, 'Cash', 'Tractor internal transport'),
  ('bpe_08', 8, '2026-02-22', 'Machine expense', 'Machine expense', 1.0, 'Units', 8500.00, 8500.00, 'Cash', 'Pugmill roller bearing replacement & welding')
ON CONFLICT (id) DO NOTHING;
