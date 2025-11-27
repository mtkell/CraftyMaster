
import { Product, ProductVariation } from "../types";

/**
 * WooCommerce Structure:
 * - Variable Product has type='variable'
 * - Attributes are defined at parent level
 * - Variations are separate endpoints/objects linked to parent
 */
export const translateToWooCommerce = (product: Product) => {
  if (!product.hasVariations) {
    return {
      name: product.name,
      type: 'simple',
      regular_price: product.price.toString(),
      description: product.description,
      sku: product.sku,
      manage_stock: true,
      stock_quantity: product.stockLevel,
      categories: [{ name: product.category }]
    };
  }

  // Logic for Variable Product
  // 1. Extract all unique attribute names and options
  const attributesMap = new Map<string, Set<string>>();
  product.variations?.forEach(v => {
    v.attributes.forEach(attr => {
      if (!attributesMap.has(attr.name)) {
        attributesMap.set(attr.name, new Set());
      }
      attributesMap.get(attr.name)?.add(attr.option);
    });
  });

  const wooAttributes = Array.from(attributesMap.entries()).map(([name, options]) => ({
    name,
    visible: true,
    variation: true,
    options: Array.from(options)
  }));

  const wooVariations = product.variations?.map(v => ({
    regular_price: v.price.toString(),
    sku: v.sku,
    manage_stock: true,
    stock_quantity: v.stockLevel,
    attributes: v.attributes.map(a => ({
      name: a.name,
      option: a.option
    }))
  }));

  return {
    name: product.name,
    type: 'variable',
    description: product.description,
    sku: product.sku, // Parent SKU
    attributes: wooAttributes,
    _variations_payload: wooVariations // In real API, these are created sequentially
  };
};

/**
 * Square Structure:
 * - Everything is a CatalogItem
 * - item_data.variations is a list of CatalogItemVariation
 * - Even simple items have 1 variation
 */
export const translateToSquare = (product: Product) => {
  let squareVariations;

  if (product.hasVariations && product.variations) {
    squareVariations = product.variations.map(v => ({
      type: 'ITEM_VARIATION',
      id: `#${v.id}`, // Temporary ID for creation
      item_variation_data: {
        item_id: `#${product.id}`,
        name: v.name, // e.g. "Small - Blue"
        sku: v.sku,
        pricing_type: 'FIXED_PRICING',
        price_money: {
          amount: Math.round(v.price * 100), // Square uses cents
          currency: 'USD'
        },
        location_overrides: [{ track_inventory: true }] // Stock is handled via Inventory API, not Catalog
      }
    }));
  } else {
    // Simple product is just one variation in Square
    squareVariations = [{
      type: 'ITEM_VARIATION',
      id: '#regular',
      item_variation_data: {
        item_id: `#${product.id}`,
        name: 'Regular',
        sku: product.sku,
        pricing_type: 'FIXED_PRICING',
        price_money: {
            amount: Math.round(product.price * 100),
            currency: 'USD'
        }
      }
    }];
  }

  return {
    idempotency_key: crypto.randomUUID(),
    object: {
      type: 'ITEM',
      id: `#${product.id}`,
      item_data: {
        name: product.name,
        description: product.description,
        variations: squareVariations
      }
    }
  };
};
