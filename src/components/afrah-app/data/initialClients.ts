import type { Client } from '../types';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'bbabb6e0-56fa-42c3-addc-37b2ea130731',
    name: 'Rajeshwar Singhania',
    phone: '+91 98450 11234',
    address: 'MG Road, Level 14, Prestige Tower, Bengaluru',
    advancePayments: [
      { id: '23ec838b-4d8e-427c-b587-851d5060791a', sNo: 1, date: '2026-01-05', amount: 500000, mode: 'HDFC Bank' },
      { id: 'dfb43db8-d748-44f8-badc-daacee61df4f', sNo: 2, date: '2026-01-15', amount: 350000, mode: 'UPI' },
      { id: '7e975cc3-d8d5-4e18-bd1d-674f21b12db8', sNo: 3, date: '2026-01-28', amount: 400000, mode: 'Cheque' },
      { id: '1f478d94-d938-4cd4-8297-f1f326ab3bf0', sNo: 4, date: '2026-02-05', amount: 250000, mode: 'State Bank of India (SBI)' },
      { id: '973f020b-ef4d-4b45-b9ce-bd00b0e644c7', sNo: 5, date: '2026-02-12', amount: 300000, mode: 'Cash' },
      { id: 'c48da8c7-b7c5-4a66-824a-cb29cec7508d', sNo: 6, date: '2026-02-18', amount: 200000, mode: 'UPI' },
      { id: '42c51343-195b-4fe0-9760-2d7e48383655', sNo: 7, date: '2026-02-22', amount: 450000, mode: 'ICICI Bank' },
      { id: '0259d407-6108-40a5-9ef7-683337030650', sNo: 8, date: '2026-02-25', amount: 150000, mode: 'Cheque' }
    ],
    expenses: [
      { id: '81f990ee-af38-4632-8957-b80770d90e80', sNo: 1, date: '2026-01-08', expenseName: 'Mason team', quantity: 12, rate: 1200, totalAmount: 14400 },
      { id: 'fe8ffc8b-2ff0-4395-b8f7-9fe2ae173ec4', sNo: 2, date: '2026-01-10', expenseName: 'Brick', quantity: 10000, rate: 12, totalAmount: 120000 },
      { id: '95290d69-26ce-409f-903c-50592868e664', sNo: 3, date: '2026-01-12', expenseName: 'M-Sand', quantity: 6, rate: 18500, totalAmount: 111000 },
      { id: '4dd320c5-46d9-4630-a0cb-9b0b51bde32e', sNo: 4, date: '2026-01-16', expenseName: 'Jelly', quantity: 5, rate: 14500, totalAmount: 72500 },
      { id: '635b2562-c546-4854-a109-c532e7b02102', sNo: 5, date: '2026-01-20', expenseName: 'Cement', quantity: 250, rate: 420, totalAmount: 105000 },
      { id: '63f55e44-c248-442e-a03a-75bc4a240e32', sNo: 6, date: '2026-01-25', expenseName: 'Steel', quantity: 4, rate: 68000, totalAmount: 272000 },
      { id: '724b864b-835e-40ba-96f4-be125b49c07c', sNo: 7, date: '2026-02-01', expenseName: 'Paint', quantity: 20, rate: 4200, totalAmount: 84000 },
      { id: 'fa90bcc5-8abf-473b-ac2f-ccbd057a4f47', sNo: 8, date: '2026-02-03', expenseName: 'Centring wages', quantity: 1, rate: 55000, totalAmount: 55000 },
      { id: '21cfb7a5-e1ed-4af0-9112-6b47d746d059', sNo: 9, date: '2026-02-06', expenseName: 'Other expenses', quantity: 1, rate: 15000, totalAmount: 15000 },
      { id: '487ed7e5-8008-40e5-877e-1e93322d6adc', sNo: 10, date: '2026-02-08', expenseName: 'Painter', quantity: 6, rate: 1100, totalAmount: 6600 },
      { id: '248baed4-d3b6-4cec-a573-0d4bc8f496ab', sNo: 11, date: '2026-02-11', expenseName: 'Gravel', quantity: 4, rate: 12000, totalAmount: 48000 },
      { id: '100f1fa4-112a-4c77-927f-1a78fa9ddf13', sNo: 12, date: '2026-02-14', expenseName: 'Carpenter (other)', quantity: 3, rate: 18000, totalAmount: 54000 },
      { id: '10556c20-e8b2-461f-8ef3-343bb8cc5f5a', sNo: 13, date: '2026-02-17', expenseName: 'Set work', quantity: 1, rate: 35000, totalAmount: 35000 },
      { id: '6baadc27-4fc1-4eef-b787-c16259b7fd4c', sNo: 14, date: '2026-02-19', expenseName: 'Electrical things', quantity: 1, rate: 62000, totalAmount: 62000 },
      { id: '4bc68246-b8f0-4662-a182-96543685c465', sNo: 15, date: '2026-02-21', expenseName: 'Electrician', quantity: 3, rate: 1200, totalAmount: 3600 },
      { id: '335a1071-c9a9-4d1d-802d-19cb98b55b38', sNo: 16, date: '2026-02-23', expenseName: 'Tile', quantity: 1500, rate: 65, totalAmount: 97500 },
      { id: '03000609-727e-403f-a453-be78e2474f39', sNo: 17, date: '2026-02-25', expenseName: 'Tile team wages', quantity: 1, rate: 32000, totalAmount: 32000 }
    ]
  },
  {
    id: '5e84ecd5-6119-4adc-9b6e-f56e852d1248',
    name: 'Ramesh Patel',
    phone: '+91 98200 45678',
    address: 'Plot 18, Lakeview Enclave, Bengaluru',
    advancePayments: [
      { id: '1468226e-a2f4-451f-aa1d-38483aea2296', sNo: 1, date: '2026-02-05', amount: 400000, mode: 'HDFC Bank' },
      { id: 'b01c9104-8a2f-457a-a805-19513d5a5315', sNo: 2, date: '2026-02-15', amount: 250000, mode: 'Cash' },
      { id: '3b280f91-4bba-40fe-b443-e91f41fab715', sNo: 3, date: '2026-02-20', amount: 350000, mode: 'UPI' },
      { id: 'f594db5f-2903-4787-8021-eb0c48853429', sNo: 4, date: '2026-02-24', amount: 180000, mode: 'Cheque' }
    ],
    expenses: [
      { id: '462122c4-2553-459c-91b8-6b0c5ac11ecd', sNo: 1, date: '2026-02-06', expenseName: 'Jelly', quantity: 3, rate: 14500, totalAmount: 43500 },
      { id: '5889d46b-99c1-4123-a041-84f431d4b5cc', sNo: 2, date: '2026-02-08', expenseName: 'Centring wages', quantity: 1, rate: 45000, totalAmount: 45000 },
      { id: '0aaee43c-1bc2-4ee3-a730-b9e653eb573e', sNo: 3, date: '2026-02-11', expenseName: 'Tile', quantity: 1200, rate: 65, totalAmount: 78000 },
      { id: '1c900030-b2d8-4391-853b-3fde6bfb8c1d', sNo: 4, date: '2026-02-18', expenseName: 'Tile team wages', quantity: 1, rate: 28000, totalAmount: 28000 },
      { id: 'f0b5d6cf-304f-4ad9-845a-0f2c68238a06', sNo: 5, date: '2026-02-20', expenseName: 'Mason team', quantity: 8, rate: 1200, totalAmount: 9600 },
      { id: 'e0dc9226-1d37-49a3-94f4-ade5e8277bf8', sNo: 6, date: '2026-02-22', expenseName: 'Brick', quantity: 8000, rate: 12, totalAmount: 96000 }
    ]
  },
  {
    id: '4a0c95af-22f7-4705-94b4-745068f10496',
    name: 'Nandini Kothari',
    phone: '+91 97112 44556',
    address: 'Worli Sea Face, Mumbai',
    advancePayments: [
      { id: 'e1689eb6-7248-4ac2-b9da-2947016188e3', sNo: 1, date: '2026-02-01', amount: 600000, mode: 'HDFC Bank' },
      { id: '405c6d2b-d52c-4b97-ab44-c88e1574585c', sNo: 2, date: '2026-02-10', amount: 450000, mode: 'UPI' }
    ],
    expenses: [
      { id: '0a63046f-8b0c-47ac-9f16-e9990487cb27', sNo: 1, date: '2026-02-03', expenseName: 'Paint', quantity: 15, rate: 4200, totalAmount: 63000 },
      { id: 'b7ea8346-fa75-4d39-a2c9-28350b8f4001', sNo: 2, date: '2026-02-07', expenseName: 'Painter', quantity: 4, rate: 1100, totalAmount: 4400 },
      { id: '99c1b0ce-710e-475f-842f-1a9c79aa9e0e', sNo: 3, date: '2026-02-12', expenseName: 'Electrical things', quantity: 1, rate: 52000, totalAmount: 52000 },
      { id: '7f0a4ef1-d58d-4e37-aa6a-959978237108', sNo: 4, date: '2026-02-15', expenseName: 'Electrician', quantity: 2, rate: 1200, totalAmount: 2400 }
    ]
  },
  {
    id: '242a172a-ea3e-4c8a-bb94-afc1c4219056',
    name: 'Dr. Jayaprakash Raman',
    phone: '+91 94440 88712',
    address: 'Plot 44, Genome Valley, Hyderabad',
    advancePayments: [
      { id: 'a520fe19-7fe2-441e-a6fb-ea0a98b5313c', sNo: 1, date: '2026-01-28', amount: 750000, mode: 'ICICI Bank' }
    ],
    expenses: [
      { id: '85538f60-6cce-473b-8de3-17dc034b95d2', sNo: 1, date: '2026-02-02', expenseName: 'Gravel', quantity: 5, rate: 12000, totalAmount: 60000 },
      { id: '3000b398-b733-4b85-8d09-283bf1ef0400', sNo: 2, date: '2026-02-06', expenseName: 'Carpenter (other)', quantity: 2, rate: 18000, totalAmount: 36000 }
    ]
  },
  {
    id: 'dccf434c-817d-48cd-b8cc-5f41a8b88aa7',
    name: 'Dr. Vikramaditya Reddy',
    phone: '+91 99001 77623',
    address: 'Plot 7, Sadashivanagar, Bengaluru'
  },
  {
    id: '395e8719-b926-4e8a-b607-c59c32da0392',
    name: 'Manish Chawla',
    phone: '+91 98100 23456',
    address: 'DLF Cyber City, Sector 24, Gurugram'
  },
  {
    id: '34e2867b-39c4-4eb8-9a0b-a642f348f090',
    name: 'Ananya Deshmukh',
    phone: '+91 98201 44321',
    address: 'Nariman Point, Express Towers, Mumbai'
  },
  {
    id: '4e4021fd-e9bb-49c9-9d15-240af075464f',
    name: 'Karthik Sundaram',
    phone: '+91 98410 77890',
    address: 'Anna Nagar West Extension, Chennai'
  },
  {
    id: '86a4c29c-a4d9-498b-9a26-029d876b41e6',
    name: 'Rohan Mehra',
    phone: '+91 98180 55432',
    address: 'Golf Course Road, Sector 54, Gurugram'
  },
  {
    id: '69e3ed41-d594-41a5-a2b0-d05b4c9b0edd',
    name: 'Sunita Agarwal',
    phone: '+91 98300 99123',
    address: 'Salt Lake Sector V, Kolkata'
  },
  {
    id: '72a7d677-a89e-43d1-9ba4-a21618a625a0',
    name: 'Vikramaditya Birla',
    phone: '+91 98290 33412',
    address: 'C-Scheme, Ashok Nagar, Jaipur'
  },
  {
    id: '7a274f5d-1b53-4638-afa1-4a95d7bfb166',
    name: 'Divya Narang',
    phone: '+91 98765 12345',
    address: 'Bandra-Kurla Complex (BKC), Mumbai'
  },
  {
    id: '3160c4d6-26d2-48c6-9232-daacdf9d45a4',
    name: 'Arvind Swaminathan',
    phone: '+91 94441 55678',
    address: 'OMR IT Expressway, Sholinganallur, Chennai'
  },
  {
    id: '5061afa9-a926-4534-8224-329351c28143',
    name: 'Meera Nambiar',
    phone: '+91 98470 66789',
    address: 'Marine Drive, Kochi, Kerala'
  },
  {
    id: '0e6b7419-434f-4167-8826-16e7f422ec83',
    name: 'Pradeep Kulkarni',
    phone: '+91 98220 88901',
    address: 'Senapati Bapat Road, Pune'
  },
  {
    id: 'cc0afb2d-fdd3-400d-a040-1f6ccfc77733',
    name: 'Siddharth Singhal',
    phone: '+91 98110 44567',
    address: 'Barakhamba Road, Connaught Place, New Delhi'
  },
  {
    id: '2f74ee81-789b-4ee5-9bf9-ed7c030d7279',
    name: 'Alok Vardhan',
    phone: '+91 98660 77123',
    address: 'HITEC City Phase 2, Madhapur, Hyderabad'
  },
  {
    id: '7046f296-7347-4f32-ac6b-f8f78008f1de',
    name: 'Tanvi Shah',
    phone: '+91 98250 88345',
    address: 'SG Highway, Prahlad Nagar, Ahmedabad'
  },
  {
    id: '5b4480e7-1a36-460c-90bc-daae5a53b2bc',
    name: 'Harish Subramanian',
    phone: '+91 94430 22345',
    address: 'Race Course Road, Coimbatore'
  },
  {
    id: '8fb90db3-be97-4f1f-939a-49ef408b66a0',
    name: 'Pooja Bhatia',
    phone: '+91 98150 66789',
    address: 'Sector 17-C, Chandigarh'
  },
  {
    id: '05b07b72-b46f-48a3-8f8d-af9c70f33243',
    name: 'Raghavendra Rao',
    phone: '+91 98800 11987',
    address: 'Indiranagar 100ft Road, Bengaluru'
  },
  {
    id: '621f8098-63f9-436a-9389-ab20fa5676d3',
    name: 'Neha Sengupta',
    phone: '+91 98310 44567',
    address: 'Park Street Heritage Enclave, Kolkata'
  },
  {
    id: '1c2ac2e1-6445-47f7-9e3f-21309bb67353',
    name: 'Devendra Rathore',
    phone: '+91 98291 55678',
    address: 'Tonk Road, Civil Lines, Jaipur'
  },
  {
    id: '0ae93fb8-08df-4a4d-8010-792b4bb15e59',
    name: 'Ashwin Varma',
    phone: '+91 98471 22345',
    address: 'Kowdiar Palace Road, Thiruvananthapuram'
  },
  {
    id: '28abee76-c31a-4c9d-9144-0d327d2d0044',
    name: 'Shruti Hegde',
    phone: '+91 98860 33456',
    address: 'Koramangala 4th Block, Bengaluru'
  },
  {
    id: 'd885036d-98f6-46a3-ab61-d67ba657eae6',
    name: 'Gautam Kapur',
    phone: '+91 98101 66789',
    address: 'Greater Kailash II, New Delhi'
  },
  {
    id: 'c9f601db-d911-4a2d-af1b-0628598b63ae',
    name: 'Pallavi Joshi',
    phone: '+91 98221 77890',
    address: 'Koregaon Park North Main Road, Pune'
  },
  {
    id: 'bf4e208e-8113-4c38-be93-9f8fd9b9de81',
    name: 'Brijesh Patel',
    phone: '+91 98240 11234',
    address: 'Science City Road, Sola, Ahmedabad'
  },
  {
    id: '1a76c492-b040-4b39-ad9e-e7f4c74f54d2',
    name: 'Srivatsan Parthasarathy',
    phone: '+91 98400 55678',
    address: 'Nungambakkam High Road, Chennai'
  },
  {
    id: 'bd5f2b9a-de7f-4560-b6b0-3d0c781cf759',
    name: 'Tarun Oberoi',
    phone: '+91 98181 22345',
    address: 'DLF Phase 1, Silver Oaks Avenue, Gurugram'
  },
  {
    id: '3a8bc4ee-c210-4c2c-8609-38ca1d032ffa',
    name: 'Sandhya Murthy',
    phone: '+91 98451 88901',
    address: 'Malleshwaram 15th Cross, Bengaluru'
  },
  {
    id: '81073281-b5bc-46e0-9dc2-e730682ad38b',
    name: 'Kunal Malhotra',
    phone: '+91 98111 77890',
    address: 'Vasant Vihar Enclave, New Delhi'
  },
  {
    id: '3b980369-5e8a-40ed-a96d-7e82b10a3a29',
    name: 'Rituja Sawant',
    phone: '+91 98202 99012',
    address: 'Powai Hiranandani Gardens, Mumbai'
  },
  {
    id: 'ee594453-6798-4753-bd02-4ba7c2cdf04e',
    name: 'Venkatachalam Chettiar',
    phone: '+91 98420 33456',
    address: 'TTK Road, Alwarpet, Chennai'
  },
  {
    id: '3009009e-2899-4828-98da-e250dd4f5ed6',
    name: 'Aditi Roy Chowdhury',
    phone: '+91 98301 66789',
    address: 'Ballygunge Circular Road, Kolkata'
  },
  {
    id: '8e6d6cbf-7ca8-45ef-9c75-957f6aadccb1',
    name: 'Chirag Doshi',
    phone: '+91 98251 44567',
    address: 'Satellite Road, Vastrapur, Ahmedabad'
  },
  {
    id: '951bb0b5-353d-43c8-8a09-a3454e9dc8e9',
    name: 'Madhavan Pillai',
    phone: '+91 98460 77890',
    address: 'Panampilly Nagar, Kochi, Kerala'
  },
  {
    id: '86025331-15e3-41c8-9661-cc4aac4d452f',
    name: 'Ishaan Grover',
    phone: '+91 98102 33456',
    address: 'Noida Expressway, Sector 128, Noida'
  },
  {
    id: '695287c7-b218-4188-b447-6ad4bf24e26d',
    name: 'Lavanya Krishnan',
    phone: '+91 98401 88901',
    address: 'Besant Nagar Beach Avenue, Chennai'
  },
  {
    id: '795f4366-0629-4f37-a6ec-bf5bb9018f58',
    name: 'Sanjeev Bajaj',
    phone: '+91 98222 55678',
    address: 'Kalyani Nagar, Pune'
  },
  {
    id: 'cd88a7cd-aed3-4c70-bc81-1f070664e65b',
    name: 'Deepa Raghavan',
    phone: '+91 98801 66789',
    address: 'Jayanagar 7th Block, Bengaluru'
  },
  {
    id: 'e2f49e97-1b21-4b5a-a2ab-c0e02341bfd4',
    name: 'Sameer Khan',
    phone: '+91 98900 11234',
    address: 'Banjara Hills Road No 3, Hyderabad'
  },
  {
    id: '8676adce-f01e-49d3-8bab-03a1a78ad489',
    name: 'Aniket Sengupta',
    phone: '+91 98311 22345',
    address: 'Rajarhat New Town Action Area 1, Kolkata'
  },
  {
    id: 'f4450e11-4132-49ef-8680-0d03d101f7d2',
    name: 'Shalini Mittal',
    phone: '+91 98112 88901',
    address: 'Punjabi Bagh West, New Delhi'
  },
  {
    id: '9128889c-2f53-487d-bb06-35f7385372ae',
    name: 'Nikhil Kamat',
    phone: '+91 98861 77890',
    address: 'Lavelle Road, Ashok Nagar, Bengaluru'
  },
  {
    id: '4075ffda-524a-4928-a69f-b3a96b0029e0',
    name: 'Preeti Chauhan',
    phone: '+91 98292 66789',
    address: 'Vaishali Nagar, Jaipur'
  },
  {
    id: '6a509786-8b8f-425d-888a-ce025468a549',
    name: 'Varun Thacker',
    phone: '+91 98203 11234',
    address: 'Juhu Tara Road, Mumbai'
  },
  {
    id: 'fc5b72eb-7fc2-411c-b94d-4a30bc6d5261',
    name: 'Suresh Naidu',
    phone: '+91 98480 55678',
    address: 'Gachibowli Financial District, Hyderabad'
  },
  {
    id: 'fdd4f57e-5e39-40e0-8dbd-eef2bb0fd8a6',
    name: 'Kavita Menon',
    phone: '+91 98472 88901',
    address: 'Kakkanad Infopark Road, Kochi'
  },
  {
    id: 'ba475a1e-d88e-45f1-bf6f-712dc3b7d82d',
    name: 'Rajesh Tibrewal',
    phone: '+91 98302 44567',
    address: 'Alipore Park Road, Kolkata'
  }
];
