
import { Product, Platform, Integration, UserProfile } from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Admin User',
  email: 'admin@syncmaster.ai',
  avatar: ''
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Premium Leather Satchel',
    sku: 'LTH-SAT-001',
    price: 129.99,
    stockLevel: 45,
    category: 'Accessories',
    description: 'Handcrafted genuine leather satchel with brass fittings.',
    platforms: Platform.Both,
    lastSynced: new Date().toISOString(),
    image: 'https://picsum.photos/200/200?random=1',
    hasVariations: false,
    variations: []
  },
  {
    id: '2',
    name: 'Wireless Noise-Canceling Headphones',
    sku: 'AUD-NC-002',
    price: 249.50,
    stockLevel: 8,
    category: 'Electronics',
    description: 'Immersive sound with 30-hour battery life.',
    platforms: Platform.WooCommerce,
    lastSynced: new Date(Date.now() - 86400000).toISOString(),
    image: 'https://picsum.photos/200/200?random=2',
    hasVariations: false,
    variations: []
  },
  {
    id: '3',
    name: 'Organic Cotton T-Shirt',
    sku: 'APP-TS-003',
    price: 25.00,
    stockLevel: 120,
    category: 'Apparel',
    description: 'Sustainably sourced 100% cotton tee.',
    platforms: Platform.Square,
    lastSynced: new Date().toISOString(),
    image: 'https://picsum.photos/200/200?random=3',
    hasVariations: true,
    variations: [
      {
        id: '3-1',
        name: 'Small - White',
        sku: 'APP-TS-003-S-W',
        price: 25.00,
        stockLevel: 40,
        attributes: [{ name: 'Size', option: 'Small' }, { name: 'Color', option: 'White' }]
      },
      {
        id: '3-2',
        name: 'Medium - White',
        sku: 'APP-TS-003-M-W',
        price: 25.00,
        stockLevel: 50,
        attributes: [{ name: 'Size', option: 'Medium' }, { name: 'Color', option: 'White' }]
      },
      {
        id: '3-3',
        name: 'Large - White',
        sku: 'APP-TS-003-L-W',
        price: 27.00,
        stockLevel: 30,
        attributes: [{ name: 'Size', option: 'Large' }, { name: 'Color', option: 'White' }]
      }
    ]
  },
  {
    id: '4',
    name: 'Ceramic Pour-Over Set',
    sku: 'KIT-PO-004',
    price: 45.00,
    stockLevel: 2,
    category: 'Home & Kitchen',
    description: 'Minimalist ceramic coffee dripper.',
    platforms: Platform.Both,
    lastSynced: new Date().toISOString(),
    image: 'https://picsum.photos/200/200?random=4',
    hasVariations: false,
    variations: []
  },
  {
    id: '5',
    name: 'Smart Fitness Tracker',
    sku: 'FIT-TR-005',
    price: 89.99,
    stockLevel: 0,
    category: 'Electronics',
    description: 'Track your steps, heart rate, and sleep.',
    platforms: Platform.WooCommerce,
    lastSynced: new Date(Date.now() - 100000).toISOString(),
    image: 'https://picsum.photos/200/200?random=5',
    hasVariations: false,
    variations: []
  }
];

export const CATEGORIES = ['All', 'Accessories', 'Electronics', 'Apparel', 'Home & Kitchen'];

export const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: '1',
    type: 'WooCommerce',
    name: 'Main Online Store',
    status: 'active',
    lastSynced: new Date().toISOString(),
    credentials: {
      url: 'https://myshop.com',
      consumerKey: 'ck_xxxxxxxxxxxx',
      consumerSecret: 'cs_xxxxxxxxxxxx'
    }
  },
  {
    id: '2',
    type: 'Square',
    name: 'Downtown POS',
    status: 'active',
    lastSynced: new Date(Date.now() - 3600000).toISOString(),
    credentials: {
      applicationId: 'sq0idp-xxxxxxxx',
      accessToken: 'EAAAxxxxxxxx'
    }
  }
];
