
import React, { useState, useEffect, useRef } from 'react';
import { Product, Platform, ProductVariation, Attribute } from '../types';
import { X, Sparkles, Loader2, Image as ImageIcon, Trash2, Link as LinkIcon, Upload, Plus, Layers, AlertCircle, Wand2, Package } from 'lucide-react';
import { generateProductDescription } from '../services/geminiService';
import { translateToSquare, translateToWooCommerce } from '../services/platformAdapter';

interface ProductFormProps {
  initialData?: Product;
  onSave: (product: Product) => void;
  onClose: () => void;
  attributes: Attribute[];
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSave, onClose, attributes }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    price: 0,
    stockLevel: 0,
    category: 'Accessories',
    description: '',
    platforms: Platform.WooCommerce,
    image: 'https://picsum.photos/200/200?random=10',
    hasVariations: false,
    variations: [],
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 }
  });
  
  // Variation editing state
  const [editingVariation, setEditingVariation] = useState<Partial<ProductVariation> | null>(null);
  const [isAddingVariation, setIsAddingVariation] = useState(false);
  const [variationName, setVariationName] = useState('');
  const [variationSku, setVariationSku] = useState('');
  const [variationPrice, setVariationPrice] = useState(0);
  const [variationStock, setVariationStock] = useState(0);
  
  // Attribute Generator State
  const [selectedAttrId, setSelectedAttrId] = useState<string>('');
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [genPrice, setGenPrice] = useState<number>(0);
  const [genStock, setGenStock] = useState<number>(10);

  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (formData.hasVariations && formData.variations) {
        const totalStock = formData.variations.reduce((acc, curr) => acc + curr.stockLevel, 0);
        setFormData(prev => ({ ...prev, stockLevel: totalStock }));
    }
  }, [formData.variations, formData.hasVariations]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['price', 'stockLevel', 'weight'].includes(name) ? parseFloat(value) || 0 : value
    }));
  };

  const handleDimensionChange = (field: 'length' | 'width' | 'height', value: string) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        ...(prev.dimensions || {}),
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) return;
    setIsGenerating(true);
    const desc = await generateProductDescription(formData.name || '', formData.category || 'General', formData.price || 0);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await convertFileToBase64(file);
        setFormData(prev => ({ ...prev, image: base64 }));
      } catch (error) {
        console.error("Error uploading image", error);
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const openGenerator = () => {
    setGenPrice(formData.price || 0);
    setGenStock(10);
    setIsGeneratorOpen(true);
    setIsAddingVariation(false);
  };

  // Manual Variation Add
  const addVariation = () => {
    if (!variationName) return;
    
    const parts = variationName.split('-').map(s => s.trim());
    const attributesList = parts.length > 1 
        ? [{ name: 'Option 1', option: parts[0] }, { name: 'Option 2', option: parts[1] }] 
        : [{ name: 'Attribute', option: parts[0] }];

    const newVariation: ProductVariation = {
        id: Math.random().toString(36).substr(2, 9),
        name: variationName,
        sku: variationSku || `${formData.sku}-${variationName.replace(/\s+/g, '')}`,
        price: variationPrice || (formData.price || 0),
        stockLevel: variationStock,
        attributes: attributesList
    };

    setFormData(prev => ({
        ...prev,
        variations: [...(prev.variations || []), newVariation]
    }));

    setVariationName('');
    setVariationSku('');
    setVariationPrice(formData.price || 0);
    setVariationStock(0);
    setIsAddingVariation(false);
  };

  const removeVariation = (id: string) => {
    setFormData(prev => ({
        ...prev,
        variations: prev.variations?.filter(v => v.id !== id)
    }));
  };
  
  // Attribute Generator Logic
  const generateFromAttributes = () => {
      if (!selectedAttrId || selectedTerms.length === 0) return;
      
      const attr = attributes.find(a => a.id === selectedAttrId);
      if (!attr) return;

      const newVariations: ProductVariation[] = selectedTerms.map(term => ({
          id: Math.random().toString(36).substr(2, 9),
          name: `${term}`,
          sku: `${formData.sku}-${term.toUpperCase()}`,
          price: genPrice,
          stockLevel: genStock,
          attributes: [{ name: attr.name, option: term }]
      }));

      setFormData(prev => ({
          ...prev,
          variations: [...(prev.variations || []), ...newVariations]
      }));
      
      setIsGeneratorOpen(false);
      setSelectedTerms([]);
      setSelectedAttrId('');
  };

  const toggleTerm = (term: string) => {
      if (selectedTerms.includes(term)) {
          setSelectedTerms(prev => prev.filter(t => t !== term));
      } else {
          setSelectedTerms(prev => [...prev, term]);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.sku) {
      const finalProduct = {
        ...formData,
        id: formData.id || Math.random().toString(36).substr(2, 9),
        lastSynced: new Date().toISOString()
      } as Product;
      
      console.log('WooCommerce Payload:', translateToWooCommerce(finalProduct));
      console.log('Square Payload:', translateToSquare(finalProduct));

      onSave(finalProduct);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {initialData ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Image Section */}
            <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Product Image</label>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-32 h-32 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden shrink-0 relative group">
                {formData.image ? (
                   <>
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all backdrop-blur-sm"
                    >
                      <Trash2 size={24} />
                    </button>
                   </>
                ) : (
                  <ImageIcon className="text-gray-300 dark:text-gray-600" size={32} />
                )}
              </div>
              
              <div className="flex-1 space-y-3 w-full">
                 <div>
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        ref={fileInputRef}
                        className="hidden"
                        id="image-upload"
                    />
                    <label 
                        htmlFor="image-upload"
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer w-full sm:w-auto justify-center sm:justify-start font-medium text-sm"
                    >
                        <Upload size={16} />
                        Upload Image
                    </label>
                 </div>
                 <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <LinkIcon size={14} />
                    </span>
                    <input 
                      type="text" 
                      placeholder="Or paste image URL..." 
                      value={formData.image || ''} 
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" 
                    />
                 </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Base SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Product Type Toggle */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Layers size={16} />
                    Product Structure
                </label>
                <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, hasVariations: false }))}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${!formData.hasVariations ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        Simple
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, hasVariations: true }))}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${formData.hasVariations ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        Variable
                    </button>
                </div>
            </div>
            
            {!formData.hasVariations ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Price ($)</label>
                   <input
                     type="number"
                     name="price"
                     value={formData.price}
                     onChange={handleChange}
                     step="0.01"
                     min="0"
                     className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stock Level</label>
                   <input
                     type="number"
                     name="stockLevel"
                     value={formData.stockLevel}
                     onChange={handleChange}
                     min="0"
                     className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                   />
                 </div>
               </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
                        <AlertCircle size={14} />
                        <span>Inventory is managed at the variation level for this product type.</span>
                    </div>

                    {/* Variations List */}
                    <div className="space-y-2">
                        {formData.variations?.map((v) => (
                            <div key={v.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white text-sm">{v.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex gap-2">
                                        <span>SKU: {v.sku}</span>
                                        <span>•</span>
                                        <span>Stock: {v.stockLevel}</span>
                                        <span>•</span>
                                        <span>${v.price}</span>
                                    </div>
                                </div>
                                <button type="button" onClick={() => removeVariation(v.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons: Add Manual or Generate */}
                    <div className="flex gap-2">
                         {isGeneratorOpen ? (
                             <div className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-900 animate-in fade-in slide-in-from-top-2">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Wand2 size={14} className="text-indigo-500" /> Generate Variations
                                </h4>
                                <div className="space-y-3">
                                    <select 
                                        value={selectedAttrId}
                                        onChange={(e) => {
                                            setSelectedAttrId(e.target.value);
                                            setSelectedTerms([]);
                                        }}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white outline-none"
                                    >
                                        <option value="">Select Attribute...</option>
                                        {attributes.map(attr => (
                                            <option key={attr.id} value={attr.id}>{attr.name}</option>
                                        ))}
                                    </select>
                                    
                                    {selectedAttrId && (
                                        <div className="flex flex-wrap gap-2">
                                            {attributes.find(a => a.id === selectedAttrId)?.terms.map(term => (
                                                <button
                                                    key={term}
                                                    type="button"
                                                    onClick={() => toggleTerm(term)}
                                                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                                                        selectedTerms.includes(term)
                                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                                                    }`}
                                                >
                                                    {term}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Var Price</label>
                                            <input 
                                                type="number" 
                                                value={genPrice}
                                                onChange={(e) => setGenPrice(parseFloat(e.target.value))}
                                                className="w-full px-2 py-1.5 text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Var Stock</label>
                                            <input 
                                                type="number" 
                                                value={genStock}
                                                onChange={(e) => setGenStock(parseFloat(e.target.value))}
                                                className="w-full px-2 py-1.5 text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 mt-2">
                                        <button onClick={() => setIsGeneratorOpen(false)} type="button" className="px-3 py-1.5 text-xs font-medium text-gray-500">Cancel</button>
                                        <button 
                                            onClick={generateFromAttributes}
                                            disabled={!selectedAttrId || selectedTerms.length === 0}
                                            type="button" 
                                            className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            Generate {selectedTerms.length > 0 ? selectedTerms.length : ''} Variations
                                        </button>
                                    </div>
                                </div>
                             </div>
                         ) : isAddingVariation ? (
                             <div className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-900 space-y-3 animate-in fade-in slide-in-from-top-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Name (e.g. Small - Red)"
                                        value={variationName}
                                        onChange={e => setVariationName(e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="SKU (Optional)"
                                        value={variationSku}
                                        onChange={e => setVariationSku(e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={variationPrice}
                                        onChange={e => setVariationPrice(parseFloat(e.target.value))}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Stock"
                                        value={variationStock}
                                        onChange={e => setVariationStock(parseFloat(e.target.value))}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setIsAddingVariation(false)} type="button" className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400">Cancel</button>
                                    <button onClick={addVariation} type="button" className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Add</button>
                                </div>
                            </div>
                         ) : (
                             <>
                                <button
                                    type="button"
                                    onClick={() => { setIsAddingVariation(true); setIsGeneratorOpen(false); }}
                                    className="flex-1 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} />
                                    Add Manually
                                </button>
                                <button
                                    type="button"
                                    onClick={openGenerator}
                                    className="flex-1 py-2 border border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Wand2 size={16} />
                                    Generate from Attributes
                                </button>
                             </>
                         )}
                    </div>
                </div>
            )}
          </div>

          {/* Shipping Information Section */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Package size={16} /> Shipping Information
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Weight (kg)</label>
                      <input
                          type="number"
                          name="weight"
                          value={formData.weight || ''}
                          onChange={handleChange}
                          placeholder="0.0"
                          step="0.1"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Length (cm)</label>
                      <input
                          type="number"
                          value={formData.dimensions?.length || ''}
                          onChange={(e) => handleDimensionChange('length', e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Width (cm)</label>
                      <input
                          type="number"
                          value={formData.dimensions?.width || ''}
                          onChange={(e) => handleDimensionChange('width', e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Height (cm)</label>
                      <input
                          type="number"
                          value={formData.dimensions?.height || ''}
                          onChange={(e) => handleDimensionChange('height', e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                      />
                  </div>
              </div>
          </div>

          {/* Common Fields */}
          <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="Accessories">Accessories</option>
                <option value="Electronics">Electronics</option>
                <option value="Apparel">Apparel</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
              </select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGenerating || !formData.name}
                title={!formData.name ? "Enter a product name first" : "Generate description using AI"}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {isGenerating ? 'Generating...' : 'Auto-Generate with AI'}
              </button>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
              placeholder="Detailed product description..."
            />
          </div>

           <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sync Platforms</label>
              <select
                name="platforms"
                value={formData.platforms}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value={Platform.WooCommerce}>WooCommerce Only</option>
                <option value={Platform.Square}>Square Only</option>
                <option value={Platform.Both}>Sync Both</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                Data will be automatically formatted for each platform (Attributes for WooCommerce, Item Options for Square).
              </p>
            </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 transition-all"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};