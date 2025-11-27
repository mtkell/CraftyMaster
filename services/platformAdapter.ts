import { Product, ProductVariation } from "../types";

/**
 * WooCommerce Structure:
 * - Variable Product has type='variable'
 * - Attributes are defined at parent level
 * - Variations are separate endpoints/objects linked to parent
 */
export const translateToWooCommerce = (product: Product) => {
  const commonData = {
    weight: product.weight?.toString(),
    dimensions: {
      length: product.dimensions?.length.toString(),
      width: product.dimensions?.width.toString(),
      height: product.dimensions?.height.toString()
    }
  };

  if (!product.hasVariations) {
    return {
      name: product.name,
      type: 'simple',
      regular_price: product.price.toString(),
      description: product.description,
      sku: product.sku,
      manage_stock: true,
      stock_quantity: product.stockLevel,
      categories: [{ name: product.category }],
      ...commonData
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
    _variations_payload: wooVariations, // In real API, these are created sequentially
    ...commonData
  };
};

/**
 * Square Structure:
 * - Uses CatalogItemOption for variation attributes (Size, Color)
 * - item_data.item_options defines the available options
 * - item_data.variations.item_variation_data.item_option_values links specific values
 */
export const translateToSquare = (product: Product) => {
  let squareVariations;
  let itemOptions: any[] = [];

  // Helper for generating IDs safely without relying on crypto.randomUUID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  if (product.hasVariations && product.variations) {
    // 1. Identify all unique Options (Attributes)
    const optionsMap = new Map<string, Set<string>>(); // Name -> Set of Values
    
    product.variations.forEach(v => {
      v.attributes.forEach(attr => {
         if (!optionsMap.has(attr.name)) {
             optionsMap.set(attr.name, new Set());
         }
         optionsMap.get(attr.name)?.add(attr.option);
      });
    });

    // 2. Create item_options definitions for Square
    // We need to generate temporary IDs for these options to reference them
    const optionIds: Record<string, string> = {}; 
    
    Array.from(optionsMap.entries()).forEach(([name, values], index) => {
        const optionId = `#opt_${index}`;
        optionIds[name] = optionId;
        
        itemOptions.push({
            type: 'ITEM_OPTION',
            id: optionId,
            item_option_data: {
                name: name,
                values: Array.from(values).map((val, valIndex) => ({
                    id: `${optionId}_val_${valIndex}`, // Temp ID
                    item_option_value_data: {
                        name: val
                    }
                }))
            }
        });
    });

    // 3. Map variations referencing these options
    squareVariations = product.variations.map(v => {
      // Find the specific value IDs for this variation
      const itemOptionValues = v.attributes.map(attr => {
          const optionId = optionIds[attr.name];
          const optionDef = itemOptions.find(o => o.id === optionId);
          const valueDef = optionDef?.item_option_data.values.find((val: any) => val.item_option_value_data.name === attr.option);
          
          return {
              item_option_id: optionId,
              item_option_value_id: valueDef?.id
          };
      });

      return {
        type: 'ITEM_VARIATION',
        id: `#${v.id}`,
        item_variation_data: {
          item_id: `#${product.id}`,
          name: v.name, // e.g. "Small - Blue"
          sku: v.sku,
          pricing_type: 'FIXED_PRICING',
          price_money: {
            amount: Math.round(v.price * 100),
            currency: 'USD'
          },
          track_inventory: true,
          item_option_values: itemOptionValues
        }
      };
    });

  } else {
    // Simple product
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

  const payload: any = {
    idempotency_key: generateId(),
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

  if (itemOptions.length > 0) {
      payload.object.item_data.item_options = itemOptions;
  }

  return payload;
};