import React, { useState } from 'react';
import { Product } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Package, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { analyzeInventoryInsights } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  products: Product[];
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export const Dashboard: React.FC<DashboardProps> = ({ products }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const navigate = useNavigate();

  const totalValue = products.reduce((acc, curr) => acc + (curr.price * curr.stockLevel), 0);
  const lowStockCount = products.filter(p => p.stockLevel < 10 && p.stockLevel > 0).length;
  const outOfStockCount = products.filter(p => p.stockLevel === 0).length;

  const categoryData = products.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: curr.category, value: 1 });
    }
    return acc;
  }, []);

  const handleGetInsights = async () => {
    setLoadingInsights(true);
    const text = await analyzeInventoryInsights(products);
    setInsights(text);
    setLoadingInsights(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Inventory Value</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">${totalValue.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Products</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</h3>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Package size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Low Stock Alerts</p>
              <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{lowStockCount}</h3>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-500">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Sync Status</p>
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-500">Healthy</h3>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-500">
              <RefreshCw size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Inventory by Category</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--tw-border-opacity, 0.2)" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="name" tick={{fontSize: 12, fill: '#888888'}} />
                  <YAxis tick={{fontSize: 12, fill: '#888888'}} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}} 
                    contentStyle={{ 
                        backgroundColor: 'var(--tw-colors-gray-800, #1f2937)', 
                        borderColor: 'var(--tw-colors-gray-700, #374151)',
                        color: 'var(--tw-colors-white, #fff)',
                        borderRadius: '0.5rem'
                    }}
                    itemStyle={{ color: '#8884d8' }} // Default, but overridden usually
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#4F46E5" 
                    radius={[4, 4, 0, 0]} 
                    cursor="pointer"
                    onClick={(data) => {
                      navigate(`/inventory?category=${encodeURIComponent(data.name)}`);
                    }}
                  />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Sparkles size={18} className="text-purple-500" />
              AI Insights
            </h3>
            <button 
              onClick={handleGetInsights}
              disabled={loadingInsights}
              className="text-xs bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-medium py-1 px-3 rounded-full transition-colors"
            >
              {loadingInsights ? 'Thinking...' : 'Analyze'}
            </button>
          </div>
          <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-300 overflow-y-auto border border-transparent dark:border-gray-700">
            {insights ? (
              <div className="whitespace-pre-wrap">{insights}</div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-500">
                <Sparkles size={32} className="mb-2 opacity-20" />
                <p>Click "Analyze" to get AI-powered inventory recommendations.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};