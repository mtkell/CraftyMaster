
export enum Platform {
  WooCommerce = 'WooCommerce',
  Square = 'Square',
  Both = 'Both'
}

export enum StockStatus {
  InStock = 'In Stock',
  LowStock = 'Low Stock',
  OutOfStock = 'Out of Stock'
}

export type Theme = 'light' | 'dark' | 'system';

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

export interface Attribute {
  id: string;
  name: string; // e.g. Color
  slug: string; // e.g. pa_color
  terms: string[]; // e.g. Red, Blue, Green
}

export interface ProductVariation {
  id: string;
  name: string; // e.g., "Small - Blue"
  sku: string;
  price: number;
  stockLevel: number;
  attributes: { name: string; option: string }[];
}

export interface Product {
  id: string;
  name: string;
  sku: string; // Base SKU
  price: number; // Base price or starting price
  stockLevel: number; // Total stock
  category: string;
  description: string;
  platforms: Platform;
  lastSynced: string;
  image?: string;
  hasVariations: boolean;
  variations?: ProductVariation[];
  weight?: number; // in kg
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  syncIssues: number;
}

export interface Integration {
  id: string;
  type: 'WooCommerce' | 'Square';
  name: string;
  status: 'active' | 'error' | 'disconnected';
  lastSynced: string;
  credentials: {
    url?: string;
    consumerKey?: string;
    consumerSecret?: string;
    accessToken?: string;
    applicationId?: string;
  };
}