import type { Site } from '../types';

export const INITIAL_SITES: Site[] = [
  {
    id: 'site-aurum-01',
    siteName: 'The Aurum Sky Residences (Tower A)',
    clientName: 'Mr. Rajesh Vardhan',
    siteAddress: 'Plot 42, Road No. 36, Jubilee Hills, Hyderabad',
    contactNumber: '+91 98401 23456',
    email: 'rajesh.vardhan@vardhangroup.in',
    projectType: 'Commercial High-Rise',
    status: 'Active Construction',
    startDate: '2025-11-10',
    estimatedCompletion: '2027-04-30',
    notes: 'Structural diagrid core with high-tensile steel reinforcements and acoustic double-glazed curtain walls.',
    createdAt: '2025-11-10T10:00:00Z',
    advances: [
      {
        id: 'adv-aurum-101',
        date: '2025-11-15',
        paymentMode: 'Bank Transfer',
        amount: 2000000,
        referenceNotes: 'RTGS: HDFC0001289 - Initial Site Mobilization Advance',
        receivedBy: 'Finance Dept',
        createdAt: '2025-11-15T11:00:00Z'
      },
      {
        id: 'adv-aurum-102',
        date: '2026-01-05',
        paymentMode: 'UPI',
        amount: 500000,
        referenceNotes: 'UPI/2601050981/Foundation Stage Clearance',
        receivedBy: 'Site Accounts',
        createdAt: '2026-01-05T14:30:00Z'
      },
      {
        id: 'adv-aurum-103',
        date: '2026-02-18',
        paymentMode: 'Bank Transfer',
        amount: 2000000,
        referenceNotes: 'NEFT: SBIN0091223 - Slab 3 Casting Advance tranche',
        receivedBy: 'Finance Dept',
        createdAt: '2026-02-18T09:15:00Z'
      }
    ],
    expenses: [
      {
        id: 'exp-aurum-201',
        date: '2025-11-20',
        category: 'Heavy Equipment & Crane',
        vendorPayee: 'Apex Heavy Haulage & Cranes Ltd',
        quantity: 12,
        unit: 'Days',
        unitRate: 35000,
        totalAmount: 420000,
        paymentStatus: 'Paid',
        billInvoiceRef: 'INV-APX-8821',
        notes: '50-ton hydraulic crawler crane for excavation piling',
        createdAt: '2025-11-20T16:00:00Z'
      },
      {
        id: 'exp-aurum-202',
        date: '2025-12-05',
        category: 'Steel Reinforcement',
        vendorPayee: 'Tata Tiscon Fe 550D Authorized Hub',
        quantity: 18,
        unit: 'Tons',
        unitRate: 64500,
        totalAmount: 1161000,
        paymentStatus: 'Paid',
        billInvoiceRef: 'TT-HYD-4091',
        notes: 'Primary column vertical rebar consignment batch #1',
        createdAt: '2025-12-05T12:00:00Z'
      },
      {
        id: 'exp-aurum-203',
        date: '2026-01-12',
        category: 'Cement & Concrete',
        vendorPayee: 'UltraTech ReadyMix RMC Hub',
        quantity: 140,
        unit: 'Cu.M',
        unitRate: 4850,
        totalAmount: 679000,
        paymentStatus: 'Paid',
        billInvoiceRef: 'UT-RMC-9902',
        notes: 'M40 grade concrete pour for basement raft slab',
        createdAt: '2026-01-12T18:00:00Z'
      },
      {
        id: 'exp-aurum-204',
        date: '2026-02-02',
        category: 'Labor & Contractor',
        vendorPayee: 'Shree Balaji Shuttering & Masonry Crew',
        quantity: 24,
        unit: 'Days',
        unitRate: 22000,
        totalAmount: 528000,
        paymentStatus: 'Paid',
        billInvoiceRef: 'WAGE-SB-W4',
        notes: 'Formwork carpentry and steel tying crew wages',
        createdAt: '2026-02-02T19:30:00Z'
      },
      {
        id: 'exp-aurum-205',
        date: '2026-02-20',
        category: 'Electrical & Plumbing',
        vendorPayee: 'Finolex & Astral Conduit Depot',
        quantity: 1,
        unit: 'Lump Sum',
        unitRate: 337400,
        totalAmount: 337400,
        paymentStatus: 'Paid',
        billInvoiceRef: 'DEPOT-ELE-771',
        notes: 'Fire-retardant PVC conduits & embedded drainage pipes',
        createdAt: '2026-02-20T10:00:00Z'
      }
    ]
  },
  {
    id: 'site-vanguard-02',
    siteName: 'Vanguard Horizon Commercial Hub',
    clientName: 'Tariq Al-Mansoor (Al-Mansoor Holdings)',
    siteAddress: 'Financial District Phase 2, Gachibowli, Hyderabad',
    contactNumber: '+91 99887 65432',
    email: 'tariq@almansoorholdings.ae',
    projectType: 'Corporate Campus',
    status: 'Active Construction',
    startDate: '2025-09-01',
    estimatedCompletion: '2026-12-15',
    notes: 'Grade-A LEED Platinum office floors with seismic isolation dampers.',
    createdAt: '2025-09-01T08:00:00Z',
    advances: [
      {
        id: 'adv-van-101',
        date: '2025-09-05',
        paymentMode: 'Bank Transfer',
        amount: 4000000,
        referenceNotes: 'Wire Transfer / Swift Ref #AUH-88301 - Phase 1 advance',
        receivedBy: 'Corporate Accounts',
        createdAt: '2025-09-05T12:00:00Z'
      },
      {
        id: 'adv-van-102',
        date: '2025-12-20',
        paymentMode: 'Bank Transfer',
        amount: 4000000,
        referenceNotes: 'Wire Transfer / Swift Ref #AUH-99210 - Superstructure milestone',
        receivedBy: 'Corporate Accounts',
        createdAt: '2025-12-20T11:00:00Z'
      }
    ],
    expenses: [
      {
        id: 'exp-van-201',
        date: '2025-10-04',
        category: 'Steel Reinforcement',
        vendorPayee: 'JSW Steel Structural Division',
        quantity: 35,
        unit: 'Tons',
        unitRate: 66000,
        totalAmount: 2310000,
        paymentStatus: 'Paid',
        billInvoiceRef: 'JSW-HYD-119',
        notes: 'Heavy structural I-beams and welded shear studs',
        createdAt: '2025-10-04T14:00:00Z'
      },
      {
        id: 'exp-van-202',
        date: '2025-11-18',
        category: 'Cement & Concrete',
        vendorPayee: 'ACC Concrete Tech RMC Hub',
        quantity: 320,
        unit: 'Cu.M',
        unitRate: 5100,
        totalAmount: 1632000,
        paymentStatus: 'Paid',
        billInvoiceRef: 'ACC-RMC-5421',
        notes: 'M50 high-early-strength mix for core shear walls',
        createdAt: '2025-11-18T10:00:00Z'
      },
      {
        id: 'exp-van-203',
        date: '2025-12-28',
        category: 'Heavy Equipment & Crane',
        vendorPayee: 'L&T Heavy Machinery Leasing',
        quantity: 1,
        unit: 'Lump Sum',
        unitRate: 1450000,
        totalAmount: 1450000,
        paymentStatus: 'Paid',
        billInvoiceRef: 'LT-EQP-0092',
        notes: 'Tower crane monthly erection & certified operator pack',
        createdAt: '2025-12-28T16:00:00Z'
      },
      {
        id: 'exp-van-204',
        date: '2026-01-30',
        category: 'Labor & Contractor',
        vendorPayee: 'Vanguard Site Force Contracting',
        quantity: 1,
        unit: 'Lump Sum',
        unitRate: 1458000,
        totalAmount: 1458000,
        paymentStatus: 'Paid',
        billInvoiceRef: 'INV-VFC-JAN',
        notes: 'Floor 1-4 slab casting labor package with overtime',
        createdAt: '2026-01-30T17:00:00Z'
      }
    ]
  },
  {
    id: 'site-elysium-03',
    siteName: 'Elysium Private Coastal Villa 09',
    clientName: 'Dr. Shalini Mehta & Vikram Mehta',
    siteAddress: 'Beachfront Road, Neelankarai, ECR, Chennai',
    contactNumber: '+91 98200 11223',
    email: 'shalini.mehta@apollohospitals.org',
    projectType: 'Luxury Villa',
    status: 'Finishing & Interior',
    startDate: '2025-06-15',
    estimatedCompletion: '2026-05-15',
    notes: 'Custom cantilevered infinity pool, marine-grade architectural concrete, and imported Italian travertine.',
    createdAt: '2025-06-15T09:00:00Z',
    advances: [
      {
        id: 'adv-ely-101',
        date: '2025-06-20',
        paymentMode: 'Bank Transfer',
        amount: 1500000,
        referenceNotes: 'HDFC IMPS / Contract Signing Advance',
        receivedBy: 'Accounts',
        createdAt: '2025-06-20T10:00:00Z'
      },
      {
        id: 'adv-ely-102',
        date: '2025-10-10',
        paymentMode: 'Cheque',
        amount: 1000000,
        referenceNotes: 'Cheque #400921 ICICI - Roof Slab Milestone',
        receivedBy: 'Site PM',
        createdAt: '2025-10-10T14:00:00Z'
      }
    ],
    expenses: [
      {
        id: 'exp-ely-201',
        date: '2025-07-15',
        category: 'Masonry & Bricks',
        vendorPayee: 'Coromandel Aerated Blocks',
        quantity: 3200,
        unit: 'Units',
        unitRate: 95,
        totalAmount: 304000,
        paymentStatus: 'Paid',
        billInvoiceRef: 'INV-AAC-881',
        notes: 'High thermal-insulation AAC autoclaved blocks',
        createdAt: '2025-07-15T11:00:00Z'
      },
      {
        id: 'exp-ely-202',
        date: '2025-09-22',
        category: 'Interior & Finishing',
        vendorPayee: 'Marmi Graniti Italian Travertine Importers',
        quantity: 850,
        unit: 'Sq.Ft',
        unitRate: 1150,
        totalAmount: 977500,
        paymentStatus: 'Paid',
        billInvoiceRef: 'INV-MGI-042',
        notes: 'Navona Roman Travertine honed slabs for living pavilion',
        createdAt: '2025-09-22T15:00:00Z'
      },
      {
        id: 'exp-ely-203',
        date: '2025-11-05',
        category: 'Electrical & Plumbing',
        vendorPayee: 'Lutron Smart Automation & Kohler Fittings',
        quantity: 1,
        unit: 'Lump Sum',
        unitRate: 780000,
        totalAmount: 780000,
        paymentStatus: 'Paid',
        billInvoiceRef: 'LUT-CHN-310',
        notes: 'DALI dimming modules, concealed rain showers & copper piping',
        createdAt: '2025-11-05T16:00:00Z'
      },
      {
        id: 'exp-ely-204',
        date: '2026-01-20',
        category: 'Labor & Contractor',
        vendorPayee: 'Master Woodcraft & Glass Artisans',
        quantity: 30,
        unit: 'Days',
        unitRate: 20616.6666,
        totalAmount: 618500,
        paymentStatus: 'Paid',
        billInvoiceRef: 'ARTISAN-SETTLE-02',
        notes: 'Teak ceiling cladding and structural glass balustrades',
        createdAt: '2026-01-20T17:00:00Z'
      }
    ]
  },
  {
    id: 'site-zenith-04',
    siteName: 'Zenith Sky Atrium & R&D Campus',
    clientName: 'Nexus Cloud Infrastructure Ltd (Mr. Arun Sundar)',
    siteAddress: 'Outer Ring Road, Marathahalli-Sarjapur Junction, Bengaluru',
    contactNumber: '+91 97112 33445',
    email: 'facilities@nexuscloud.io',
    projectType: 'Commercial High-Rise',
    status: 'Planning',
    startDate: '2026-02-01',
    estimatedCompletion: '2027-11-30',
    notes: '22-storey commercial workspace with hyper-efficient HVAC and open-span atrium.',
    createdAt: '2026-02-01T10:00:00Z',
    advances: [
      {
        id: 'adv-zen-101',
        date: '2026-02-05',
        paymentMode: 'Bank Transfer',
        amount: 5000000,
        referenceNotes: 'RTGS / KKBK000018 - Project Inception Mobilization Deposit',
        receivedBy: 'Treasury',
        createdAt: '2026-02-05T12:00:00Z'
      }
    ],
    expenses: [
      {
        id: 'exp-zen-201',
        date: '2026-02-10',
        category: 'Architectural & Survey',
        vendorPayee: 'Geotech Precision Soil & Sonic Testing',
        quantity: 1,
        unit: 'Lump Sum',
        unitRate: 380000,
        totalAmount: 380000,
        paymentStatus: 'Paid',
        billInvoiceRef: 'GEO-BLR-109',
        notes: 'Deep borehole core drilling & plate load bearing report',
        createdAt: '2026-02-10T14:00:00Z'
      },
      {
        id: 'exp-zen-202',
        date: '2026-02-18',
        category: 'Permits & Structural',
        vendorPayee: 'BBMP / Structural Safety Directorate Clearance',
        quantity: 1,
        unit: 'Lump Sum',
        unitRate: 1040000,
        totalAmount: 1040000,
        paymentStatus: 'Paid',
        billInvoiceRef: 'GOVT-CHAL-44910',
        notes: 'Statutory approval plan sanctions & environmental clearance fee',
        createdAt: '2026-02-18T16:00:00Z'
      }
    ]
  }
];
