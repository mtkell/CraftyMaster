
import React, { useState, useMemo, useEffect } from 'react';
import { Product, Platform } from '../types';
import { Search, Edit2, Trash2, Plus, ArrowUpDown, Filter, Image as ImageIcon, Box, AlertTriangle, Layers } from 'lucide-react';
import { CATEGORIES } from '../services/mockData';
import { useSearchParams } from 'react-router-dom';

interface InventoryListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({ products, onEdit, onDelete, onAdd }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedStockStatus, setSelectedStockStatus] = useState('All');
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('All');
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        
        let matchesStock = true;
        if (selectedStockStatus === 'Out of Stock') {
            matchesStock = p.stockLevel === 0;
        } else if (selectedStockStatus === 'Low Stock') {
            matchesStock = p.stockLevel > 0 && p.stockLevel < 10;
        } else if (selectedStockStatus === 'In Stock') {
            matchesStock = p.stockLevel >= 10;
        }

        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        if (a[sortField]! < b[sortField]!) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortField]! > b[sortField]!) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [products, searchTerm, selectedCategory, selectedStockStatus, sortField, sortDirection]);

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    if (newCategory === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: newCategory });
    }
  };

  const confirmDelete = () => {
    if (productToDelete) {
      onDelete(productToDelete);
      setProductToDelete(null);
    }
  };

  // Helper to format price for display (Range for variations)
  const formatPrice = (product: Product) => {
    if (product.hasVariations && product.variations && product.variations.length > 0) {
      const prices = product.variations.map(v => v.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      if (min === max) return `$${min.toFixed(2)}`;
      return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
    }
    return `$${product.price.toFixed(2)}`;
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
        {/* Controls Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
            <div className="relative flex-1 sm:w-64 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all"
              />
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full sm:w-auto pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none text-gray-600 dark:text-gray-300 cursor-pointer"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="relative flex-1 sm:flex-none">
                <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={selectedStockStatus}
                  onChange={(e) => setSelectedStockStatus(e.target.value)}
                  className="w-full sm:w-auto pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none text-gray-600 dark:text-gray-300 cursor-pointer"
                >
                  <option value="All">All Stock Status</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>
          
          <button
            onClick={onAdd}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 font-medium"
          >
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">Product <ArrowUpDown size={14} /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('sku')}>
                  <div className="flex items-center gap-2">SKU <ArrowUpDown size={14} /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('stockLevel')}>
                  <div className="flex items-center gap-2">Stock <ArrowUpDown size={14} /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('price')}>
                  <div className="flex items-center gap-2">Price <ArrowUpDown size={14} /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('lastSynced')}>
                  <div className="flex items-center gap-2">Last Synced <ArrowUpDown size={14} /></div>
                </th>
                <th className="px-6 py-4">Platforms</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200 dark:border-gray-600">
                          {product.image ? (
                              <img src={product.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                              <ImageIcon size={18} className="text-gray-400" />
                          )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          {product.name}
                          {product.hasVariations && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" title="Variable Product">
                              <Layers size={10} className="mr-1" />
                              {product.variations?.length}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{product.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stockLevel === 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                      product.stockLevel < 10 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                      'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                    }`}>
                      {product.stockLevel === 0 ? 'Out of Stock' : `${product.stockLevel} units`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-200">
                    {formatPrice(product)}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(product.lastSynced).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {(product.platforms === Platform.WooCommerce || product.platforms === Platform.Both) && (
                        <span className="w-6 h-6 rounded flex items-center justify-center bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 text-[10px] font-bold" title="WooCommerce">W</span>
                      )}
                      {(product.platforms === Platform.Square || product.platforms === Platform.Both) && (
                        <span className="w-6 h-6 rounded flex items-center justify-center bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-[10px] font-bold" title="Square">S</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(product)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setProductToDelete(product.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="opacity-20" />
                      <p>No products found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200 border border-transparent dark:border-gray-700">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Product?</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3 w-full mt-4">
                <button
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-red-900/50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
