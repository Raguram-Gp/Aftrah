import type { Client } from '../types';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'Rajeshwar Singhania',
    phone: '+91 98450 11234',
    address: 'MG Road, Level 14, Prestige Tower, Bengaluru',
    advancePayments: [
      { id: 'adv-1', sNo: 1, date: '2026-01-05', amount: 500000, mode: 'HDFC Bank' },
      { id: 'adv-2', sNo: 2, date: '2026-01-15', amount: 350000, mode: 'UPI' },
      { id: 'adv-3', sNo: 3, date: '2026-01-28', amount: 400000, mode: 'Cheque' },
      { id: 'adv-4', sNo: 4, date: '2026-02-05', amount: 250000, mode: 'State Bank of India (SBI)' },
      { id: 'adv-5', sNo: 5, date: '2026-02-12', amount: 300000, mode: 'Cash' },
      { id: 'adv-6', sNo: 6, date: '2026-02-18', amount: 200000, mode: 'UPI' },
      { id: 'adv-7', sNo: 7, date: '2026-02-22', amount: 450000, mode: 'ICICI Bank' },
      { id: 'adv-8', sNo: 8, date: '2026-02-25', amount: 150000, mode: 'Cheque' }
    ],
    expenses: [
      { id: 'exp-1', sNo: 1, date: '2026-01-08', expenseName: 'Mason team', quantity: 12, rate: 1200, totalAmount: 14400 },
      { id: 'exp-2', sNo: 2, date: '2026-01-10', expenseName: 'Brick', quantity: 10000, rate: 12, totalAmount: 120000 },
      { id: 'exp-3', sNo: 3, date: '2026-01-12', expenseName: 'M-Sand', quantity: 6, rate: 18500, totalAmount: 111000 },
      { id: 'exp-4', sNo: 4, date: '2026-01-16', expenseName: 'Jelly', quantity: 5, rate: 14500, totalAmount: 72500 },
      { id: 'exp-5', sNo: 5, date: '2026-01-20', expenseName: 'Cement', quantity: 250, rate: 420, totalAmount: 105000 },
      { id: 'exp-6', sNo: 6, date: '2026-01-25', expenseName: 'Steel', quantity: 4, rate: 68000, totalAmount: 272000 },
      { id: 'exp-7', sNo: 7, date: '2026-02-01', expenseName: 'Paint', quantity: 20, rate: 4200, totalAmount: 84000 },
      { id: 'exp-8', sNo: 8, date: '2026-02-03', expenseName: 'Centring wages', quantity: 1, rate: 55000, totalAmount: 55000 },
      { id: 'exp-9', sNo: 9, date: '2026-02-06', expenseName: 'Other expenses', quantity: 1, rate: 15000, totalAmount: 15000 },
      { id: 'exp-10', sNo: 10, date: '2026-02-08', expenseName: 'Painter', quantity: 6, rate: 1100, totalAmount: 6600 },
      { id: 'exp-11', sNo: 11, date: '2026-02-11', expenseName: 'Gravel', quantity: 4, rate: 12000, totalAmount: 48000 },
      { id: 'exp-12', sNo: 12, date: '2026-02-14', expenseName: 'Carpenter (other)', quantity: 3, rate: 18000, totalAmount: 54000 },
      { id: 'exp-13', sNo: 13, date: '2026-02-17', expenseName: 'Set work', quantity: 1, rate: 35000, totalAmount: 35000 },
      { id: 'exp-14', sNo: 14, date: '2026-02-19', expenseName: 'Electrical things', quantity: 1, rate: 62000, totalAmount: 62000 },
      { id: 'exp-15', sNo: 15, date: '2026-02-21', expenseName: 'Electrician', quantity: 3, rate: 1200, totalAmount: 3600 },
      { id: 'exp-16', sNo: 16, date: '2026-02-23', expenseName: 'Tile', quantity: 1500, rate: 65, totalAmount: 97500 },
      { id: 'exp-17', sNo: 17, date: '2026-02-25', expenseName: 'Tile team wages', quantity: 1, rate: 32000, totalAmount: 32000 }
    ]
  },
  {
    id: 'client-2',
    name: 'Ramesh Patel',
    phone: '+91 98200 45678',
    address: 'Plot 18, Lakeview Enclave, Bengaluru',
    advancePayments: [
      { id: 'adv-1', sNo: 1, date: '2026-02-05', amount: 400000, mode: 'HDFC Bank' },
      { id: 'adv-2', sNo: 2, date: '2026-02-15', amount: 250000, mode: 'Cash' },
      { id: 'adv-3', sNo: 3, date: '2026-02-20', amount: 350000, mode: 'UPI' },
      { id: 'adv-4', sNo: 4, date: '2026-02-24', amount: 180000, mode: 'Cheque' }
    ],
    expenses: [
      { id: 'exp-1', sNo: 1, date: '2026-02-06', expenseName: 'Jelly', quantity: 3, rate: 14500, totalAmount: 43500 },
      { id: 'exp-2', sNo: 2, date: '2026-02-08', expenseName: 'Centring wages', quantity: 1, rate: 45000, totalAmount: 45000 },
      { id: 'exp-3', sNo: 3, date: '2026-02-11', expenseName: 'Tile', quantity: 1200, rate: 65, totalAmount: 78000 },
      { id: 'exp-4', sNo: 4, date: '2026-02-18', expenseName: 'Tile team wages', quantity: 1, rate: 28000, totalAmount: 28000 },
      { id: 'exp-5', sNo: 5, date: '2026-02-20', expenseName: 'Mason team', quantity: 8, rate: 1200, totalAmount: 9600 },
      { id: 'exp-6', sNo: 6, date: '2026-02-22', expenseName: 'Brick', quantity: 8000, rate: 12, totalAmount: 96000 }
    ]
  },
  {
    id: 'client-3',
    name: 'Nandini Kothari',
    phone: '+91 97112 44556',
    address: 'Worli Sea Face, Mumbai',
    advancePayments: [
      { id: 'adv-1', sNo: 1, date: '2026-02-01', amount: 600000, mode: 'HDFC Bank' },
      { id: 'adv-2', sNo: 2, date: '2026-02-10', amount: 450000, mode: 'UPI' }
    ],
    expenses: [
      { id: 'exp-1', sNo: 1, date: '2026-02-03', expenseName: 'Paint', quantity: 15, rate: 4200, totalAmount: 63000 },
      { id: 'exp-2', sNo: 2, date: '2026-02-07', expenseName: 'Painter', quantity: 4, rate: 1100, totalAmount: 4400 },
      { id: 'exp-3', sNo: 3, date: '2026-02-12', expenseName: 'Electrical things', quantity: 1, rate: 52000, totalAmount: 52000 },
      { id: 'exp-4', sNo: 4, date: '2026-02-15', expenseName: 'Electrician', quantity: 2, rate: 1200, totalAmount: 2400 }
    ]
  },
  {
    id: 'client-4',
    name: 'Dr. Jayaprakash Raman',
    phone: '+91 94440 88712',
    address: 'Plot 44, Genome Valley, Hyderabad',
    advancePayments: [
      { id: 'adv-1', sNo: 1, date: '2026-01-28', amount: 750000, mode: 'ICICI Bank' }
    ],
    expenses: [
      { id: 'exp-1', sNo: 1, date: '2026-02-02', expenseName: 'Gravel', quantity: 5, rate: 12000, totalAmount: 60000 },
      { id: 'exp-2', sNo: 2, date: '2026-02-06', expenseName: 'Carpenter (other)', quantity: 2, rate: 18000, totalAmount: 36000 }
    ]
  },
  {
    id: 'client-5',
    name: 'Dr. Vikramaditya Reddy',
    phone: '+91 99001 77623',
    address: 'Plot 7, Sadashivanagar, Bengaluru'
  },
  {
    id: 'client-6',
    name: 'Manish Chawla',
    phone: '+91 98100 23456',
    address: 'DLF Cyber City, Sector 24, Gurugram'
  },
  {
    id: 'client-7',
    name: 'Ananya Deshmukh',
    phone: '+91 98201 44321',
    address: 'Nariman Point, Express Towers, Mumbai'
  },
  {
    id: 'client-8',
    name: 'Karthik Sundaram',
    phone: '+91 98410 77890',
    address: 'Anna Nagar West Extension, Chennai'
  },
  {
    id: 'client-9',
    name: 'Rohan Mehra',
    phone: '+91 98180 55432',
    address: 'Golf Course Road, Sector 54, Gurugram'
  },
  {
    id: 'client-10',
    name: 'Sunita Agarwal',
    phone: '+91 98300 99123',
    address: 'Salt Lake Sector V, Kolkata'
  },
  {
    id: 'client-11',
    name: 'Vikramaditya Birla',
    phone: '+91 98290 33412',
    address: 'C-Scheme, Ashok Nagar, Jaipur'
  },
  {
    id: 'client-12',
    name: 'Divya Narang',
    phone: '+91 98765 12345',
    address: 'Bandra-Kurla Complex (BKC), Mumbai'
  },
  {
    id: 'client-13',
    name: 'Arvind Swaminathan',
    phone: '+91 94441 55678',
    address: 'OMR IT Expressway, Sholinganallur, Chennai'
  },
  {
    id: 'client-14',
    name: 'Meera Nambiar',
    phone: '+91 98470 66789',
    address: 'Marine Drive, Kochi, Kerala'
  },
  {
    id: 'client-15',
    name: 'Pradeep Kulkarni',
    phone: '+91 98220 88901',
    address: 'Senapati Bapat Road, Pune'
  },
  {
    id: 'client-16',
    name: 'Siddharth Singhal',
    phone: '+91 98110 44567',
    address: 'Barakhamba Road, Connaught Place, New Delhi'
  },
  {
    id: 'client-17',
    name: 'Alok Vardhan',
    phone: '+91 98660 77123',
    address: 'HITEC City Phase 2, Madhapur, Hyderabad'
  },
  {
    id: 'client-18',
    name: 'Tanvi Shah',
    phone: '+91 98250 88345',
    address: 'SG Highway, Prahlad Nagar, Ahmedabad'
  },
  {
    id: 'client-19',
    name: 'Harish Subramanian',
    phone: '+91 94430 22345',
    address: 'Race Course Road, Coimbatore'
  },
  {
    id: 'client-20',
    name: 'Pooja Bhatia',
    phone: '+91 98150 66789',
    address: 'Sector 17-C, Chandigarh'
  },
  {
    id: 'client-21',
    name: 'Raghavendra Rao',
    phone: '+91 98800 11987',
    address: 'Indiranagar 100ft Road, Bengaluru'
  },
  {
    id: 'client-22',
    name: 'Neha Sengupta',
    phone: '+91 98310 44567',
    address: 'Park Street Heritage Enclave, Kolkata'
  },
  {
    id: 'client-23',
    name: 'Devendra Rathore',
    phone: '+91 98291 55678',
    address: 'Tonk Road, Civil Lines, Jaipur'
  },
  {
    id: 'client-24',
    name: 'Ashwin Varma',
    phone: '+91 98471 22345',
    address: 'Kowdiar Palace Road, Thiruvananthapuram'
  },
  {
    id: 'client-25',
    name: 'Shruti Hegde',
    phone: '+91 98860 33456',
    address: 'Koramangala 4th Block, Bengaluru'
  },
  {
    id: 'client-26',
    name: 'Gautam Kapur',
    phone: '+91 98101 66789',
    address: 'Greater Kailash II, New Delhi'
  },
  {
    id: 'client-27',
    name: 'Pallavi Joshi',
    phone: '+91 98221 77890',
    address: 'Koregaon Park North Main Road, Pune'
  },
  {
    id: 'client-28',
    name: 'Brijesh Patel',
    phone: '+91 98240 11234',
    address: 'Science City Road, Sola, Ahmedabad'
  },
  {
    id: 'client-29',
    name: 'Srivatsan Parthasarathy',
    phone: '+91 98400 55678',
    address: 'Nungambakkam High Road, Chennai'
  },
  {
    id: 'client-30',
    name: 'Tarun Oberoi',
    phone: '+91 98181 22345',
    address: 'DLF Phase 1, Silver Oaks Avenue, Gurugram'
  },
  {
    id: 'client-31',
    name: 'Sandhya Murthy',
    phone: '+91 98451 88901',
    address: 'Malleshwaram 15th Cross, Bengaluru'
  },
  {
    id: 'client-32',
    name: 'Kunal Malhotra',
    phone: '+91 98111 77890',
    address: 'Vasant Vihar Enclave, New Delhi'
  },
  {
    id: 'client-33',
    name: 'Rituja Sawant',
    phone: '+91 98202 99012',
    address: 'Powai Hiranandani Gardens, Mumbai'
  },
  {
    id: 'client-34',
    name: 'Venkatachalam Chettiar',
    phone: '+91 98420 33456',
    address: 'TTK Road, Alwarpet, Chennai'
  },
  {
    id: 'client-35',
    name: 'Aditi Roy Chowdhury',
    phone: '+91 98301 66789',
    address: 'Ballygunge Circular Road, Kolkata'
  },
  {
    id: 'client-36',
    name: 'Chirag Doshi',
    phone: '+91 98251 44567',
    address: 'Satellite Road, Vastrapur, Ahmedabad'
  },
  {
    id: 'client-37',
    name: 'Madhavan Pillai',
    phone: '+91 98460 77890',
    address: 'Panampilly Nagar, Kochi, Kerala'
  },
  {
    id: 'client-38',
    name: 'Ishaan Grover',
    phone: '+91 98102 33456',
    address: 'Noida Expressway, Sector 128, Noida'
  },
  {
    id: 'client-39',
    name: 'Lavanya Krishnan',
    phone: '+91 98401 88901',
    address: 'Besant Nagar Beach Avenue, Chennai'
  },
  {
    id: 'client-40',
    name: 'Sanjeev Bajaj',
    phone: '+91 98222 55678',
    address: 'Kalyani Nagar, Pune'
  },
  {
    id: 'client-41',
    name: 'Deepa Raghavan',
    phone: '+91 98801 66789',
    address: 'Jayanagar 7th Block, Bengaluru'
  },
  {
    id: 'client-42',
    name: 'Sameer Khan',
    phone: '+91 98900 11234',
    address: 'Banjara Hills Road No 3, Hyderabad'
  },
  {
    id: 'client-43',
    name: 'Aniket Sengupta',
    phone: '+91 98311 22345',
    address: 'Rajarhat New Town Action Area 1, Kolkata'
  },
  {
    id: 'client-44',
    name: 'Shalini Mittal',
    phone: '+91 98112 88901',
    address: 'Punjabi Bagh West, New Delhi'
  },
  {
    id: 'client-45',
    name: 'Nikhil Kamat',
    phone: '+91 98861 77890',
    address: 'Lavelle Road, Ashok Nagar, Bengaluru'
  },
  {
    id: 'client-46',
    name: 'Preeti Chauhan',
    phone: '+91 98292 66789',
    address: 'Vaishali Nagar, Jaipur'
  },
  {
    id: 'client-47',
    name: 'Varun Thacker',
    phone: '+91 98203 11234',
    address: 'Juhu Tara Road, Mumbai'
  },
  {
    id: 'client-48',
    name: 'Suresh Naidu',
    phone: '+91 98480 55678',
    address: 'Gachibowli Financial District, Hyderabad'
  },
  {
    id: 'client-49',
    name: 'Kavita Menon',
    phone: '+91 98472 88901',
    address: 'Kakkanad Infopark Road, Kochi'
  },
  {
    id: 'client-50',
    name: 'Rajesh Tibrewal',
    phone: '+91 98302 44567',
    address: 'Alipore Park Road, Kolkata'
  }
];
