
import React, { useState } from 'react';
import { Attribute } from '../types';
import { Plus, Trash2, Edit2, RefreshCw, Download, Upload, X, Save, Tags } from 'lucide-react';

interface AttributesProps {
  attributes: Attribute[];
  onUpdateAttributes: (attributes: Attribute[]) => void;
}

export const Attributes: React.FC<AttributesProps> = ({ attributes, onUpdateAttributes }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<'import' | 'export' | null>(null);

  const [formData, setFormData] = useState<Partial<Attribute>>({
    name: '',
    slug: '',
    terms: []
  });
  const [termsInput, setTermsInput] = useState('');

  const handleOpenModal = (attribute?: Attribute) => {
    if (attribute) {
      setFormData(attribute);
      setTermsInput(attribute.terms.join(', '));
      setEditingId(attribute.id);
    } else {
      setFormData({ name: '', slug: '', terms: [] });
      setTermsInput('');
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this attribute?')) {
      onUpdateAttributes(attributes.filter(a => a.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const termsArray = termsInput.split(',').map(t => t.trim()).filter(t => t);
    
    const newAttribute: Attribute = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      name: formData.name || '',
      slug: formData.slug || formData.name?.toLowerCase().replace(/\s+/g, '-') || '',
      terms: termsArray
    };

    if (editingId) {
      onUpdateAttributes(attributes.map(a => a.id === editingId ? newAttribute : a));
    } else {
      onUpdateAttributes([...attributes, newAttribute]);
    }
    setIsModalOpen(false);
  };

  const handleImport = () => {
    setIsSyncing('import');
    setTimeout(() => {
        // Simulate importing 'Material' if not exists
        if (!attributes.find(a => a.name === 'Material')) {
             onUpdateAttributes([...attributes, { id: 'new-1', name: 'Material', slug: 'pa_material', terms: ['Cotton', 'Wool', 'Silk'] }]);
        }
        setIsSyncing(null);
        alert('Attributes imported from WooCommerce successfully.');
    }, 1500);
  };

  const handleExport = () => {
    setIsSyncing('export');
    setTimeout(() => {
        setIsSyncing(null);
        alert('Attributes exported to WooCommerce successfully.');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Attributes</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage global product attributes like Size, Color, and Material.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleImport}
                disabled={!!isSyncing}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
            >
                {isSyncing === 'import' ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                Import from Woo
            </button>
            <button 
                onClick={handleExport}
                disabled={!!isSyncing}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
            >
                {isSyncing === 'export' ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                Export to Woo
            </button>
            <button 
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 text-sm font-medium"
            >
                <Plus size={16} />
                Add Attribute
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-100 dark:border-gray-700">
                <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Slug</th>
                    <th className="px-6 py-4">Terms</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {attributes.map((attr) => (
                    <tr key={attr.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            <Tags size={16} className="text-indigo-500" />
                            {attr.name}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">{attr.slug}</td>
                        <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                                {attr.terms.map((term, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                                        {term}
                                    </span>
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleOpenModal(attr)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(attr.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                {attributes.length === 0 && (
                     <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                            No attributes defined. Add one to get started.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200">
             <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingId ? 'Edit Attribute' : 'New Attribute'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <X size={20} />
                </button>
             </div>
             <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Color"
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                    />
                </div>
                 <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Slug</label>
                    <input 
                        type="text" 
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="e.g. pa_color"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                    />
                    <p className="text-xs text-gray-400">Leave empty to auto-generate from name.</p>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Terms</label>
                    <textarea 
                        value={termsInput}
                        onChange={(e) => setTermsInput(e.target.value)}
                        placeholder="Red, Blue, Green"
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 outline-none resize-none"
                    />
                    <p className="text-xs text-gray-400">Comma-separated values.</p>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
                        <Save size={16} /> Save
                    </button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};
