import React, { useState, useRef, useEffect } from 'react';
import { Integration, Theme, UserProfile } from '../types';
import { Plus, Trash2, Edit2, CheckCircle, XCircle, RefreshCw, ShoppingCart, CreditCard, X, Save, AlertCircle, Loader2, Moon, Sun, Monitor, User, Upload, Camera } from 'lucide-react';

interface SettingsProps {
  integrations: Integration[];
  onUpdateIntegrations: (integrations: Integration[]) => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const Settings: React.FC<SettingsProps> = ({ integrations, onUpdateIntegrations, currentTheme, onThemeChange, userProfile, onUpdateProfile }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'success' | 'failed'>('none');
  
  // Profile local state
  const [profileData, setProfileData] = useState<UserProfile>(userProfile);
  const [profileSaved, setProfileSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProfileData(userProfile);
  }, [userProfile]);

  const [formData, setFormData] = useState<Partial<Integration>>({
    type: 'WooCommerce',
    name: '',
    status: 'active',
    credentials: {
      url: '',
      consumerKey: '',
      consumerSecret: '',
      accessToken: '',
      applicationId: ''
    }
  });

  const handleOpenModal = (integration?: Integration) => {
    if (integration) {
      setFormData(integration);
      setEditingId(integration.id);
    } else {
      setFormData({
        type: 'WooCommerce',
        name: '',
        status: 'active',
        credentials: { url: '', consumerKey: '', consumerSecret: '', accessToken: '', applicationId: '' }
      });
      setEditingId(null);
    }
    setConnectionStatus('none');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this account? This will stop syncing immediately.')) {
      onUpdateIntegrations(integrations.filter(i => i.id !== id));
    }
  };

  const handleTestConnection = () => {
    setIsTestingConnection(true);
    setConnectionStatus('none');
    // Simulate API check
    setTimeout(() => {
      setIsTestingConnection(false);
      setConnectionStatus('success');
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newIntegration: Integration = {
      ...formData as Integration,
      id: editingId || Math.random().toString(36).substr(2, 9),
      lastSynced: new Date().toISOString()
    };

    if (editingId) {
      onUpdateIntegrations(integrations.map(i => i.id === editingId ? newIntegration : i));
    } else {
      onUpdateIntegrations([...integrations, newIntegration]);
    }
    setIsModalOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCredentialChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      credentials: { ...prev.credentials, [field]: value }
    }));
  };

  // Profile Handlers
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setProfileSaved(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, avatar: reader.result as string }));
        setProfileSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileData);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Integrations & Settings</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your connected accounts, synchronization preferences, and appearance.</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
         <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Profile Settings</h3>
         <form onSubmit={handleSaveProfile} className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex flex-col items-center gap-3">
               <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-sm">
                    {profileData.avatar ? (
                      <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {profileData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 p-1.5 rounded-full shadow-md border border-gray-100 dark:border-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <Camera size={14} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleAvatarUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
               </div>
               <p className="text-xs text-gray-500 dark:text-gray-400">Click camera icon to upload</p>
            </div>

            <div className="flex-1 w-full space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                    <input 
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                   <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <input 
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
               </div>
               <div className="flex items-center justify-end pt-2">
                 <button 
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                 >
                    {profileSaved ? <CheckCircle size={18} /> : <Save size={18} />}
                    {profileSaved ? 'Saved!' : 'Save Changes'}
                 </button>
               </div>
            </div>
         </form>
      </div>

      {/* Theme Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Appearance</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => onThemeChange('light')}
            className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${
              currentTheme === 'light' 
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-500' 
                : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <Sun size={20} />
            <span className="font-medium">Light</span>
          </button>
          <button
            onClick={() => onThemeChange('dark')}
            className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${
              currentTheme === 'dark' 
                 ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-500' 
                 : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <Moon size={20} />
            <span className="font-medium">Dark</span>
          </button>
          <button
            onClick={() => onThemeChange('system')}
            className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${
              currentTheme === 'system' 
                 ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-500' 
                 : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <Monitor size={20} />
            <span className="font-medium">System</span>
          </button>
        </div>
      </div>

      {/* Integrations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Connected Accounts</h3>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium text-sm"
          >
            <Plus size={16} />
            Connect New Account
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors group bg-gray-50/50 dark:bg-gray-800">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    integration.type === 'WooCommerce' 
                      ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' 
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {integration.type === 'WooCommerce' ? <ShoppingCart size={24} /> : <CreditCard size={24} />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{integration.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        integration.status === 'active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {integration.status === 'active' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                        {integration.status === 'active' ? 'Connected' : 'Error'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {integration.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(integration)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-gray-700 dark:hover:text-indigo-400 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(integration.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-white dark:hover:bg-gray-700 dark:hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <RefreshCw size={12} className={integration.status === 'active' ? '' : 'text-red-400'} />
                  Last synced: {new Date(integration.lastSynced).toLocaleString()}
                </div>
                <button className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">Sync Now</button>
              </div>
            </div>
          ))}

          {integrations.length === 0 && (
            <div className="col-span-1 md:col-span-2 py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                <AlertCircle className="text-gray-400" size={24} />
              </div>
              <h4 className="text-gray-900 dark:text-white font-medium">No accounts connected</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-xs">Connect your WooCommerce or Square accounts to start syncing inventory.</p>
            </div>
          )}
        </div>
      </div>

      {/* Integration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingId ? 'Edit Connection' : 'Connect New Account'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${
                    formData.type === 'WooCommerce' 
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}>
                    <input 
                      type="radio" 
                      name="type" 
                      value="WooCommerce" 
                      checked={formData.type === 'WooCommerce'} 
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="hidden" 
                    />
                    <ShoppingCart size={24} className={formData.type === 'WooCommerce' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'} />
                    <span className="font-medium text-sm">WooCommerce</span>
                  </label>
                  <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${
                    formData.type === 'Square' 
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}>
                    <input 
                      type="radio" 
                      name="type" 
                      value="Square" 
                      checked={formData.type === 'Square'} 
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="hidden" 
                    />
                    <CreditCard size={24} className={formData.type === 'Square' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'} />
                    <span className="font-medium text-sm">Square</span>
                  </label>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Label</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g. Main Store" 
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" 
                    />
                  </div>

                  {formData.type === 'WooCommerce' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store URL</label>
                        <input 
                          type="url" 
                          value={formData.credentials?.url}
                          onChange={(e) => handleCredentialChange('url', e.target.value)}
                          placeholder="https://myshop.com" 
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Consumer Key</label>
                        <input 
                          type="text" 
                          value={formData.credentials?.consumerKey}
                          onChange={(e) => handleCredentialChange('consumerKey', e.target.value)}
                          placeholder="ck_xxxxxxxxxxxx" 
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Consumer Secret</label>
                        <input 
                          type="password" 
                          value={formData.credentials?.consumerSecret}
                          onChange={(e) => handleCredentialChange('consumerSecret', e.target.value)}
                          placeholder="cs_xxxxxxxxxxxx" 
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono text-sm" 
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application ID</label>
                        <input 
                          type="text" 
                          value={formData.credentials?.applicationId}
                          onChange={(e) => handleCredentialChange('applicationId', e.target.value)}
                          placeholder="sq0idp-xxxxxxxx" 
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Access Token</label>
                        <input 
                          type="password" 
                          value={formData.credentials?.accessToken}
                          onChange={(e) => handleCredentialChange('accessToken', e.target.value)}
                          placeholder="EAAAxxxxxxxx" 
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono text-sm" 
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-4">
                   <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    className="text-sm font-medium px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isTestingConnection ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    {isTestingConnection ? 'Testing...' : 'Test Connection'}
                  </button>

                  {connectionStatus === 'success' && (
                    <div className="text-sm text-green-700 dark:text-green-400 flex items-center gap-1.5 animate-in fade-in">
                      <CheckCircle size={16} />
                      <span>Verified!</span>
                    </div>
                  )}
                  {connectionStatus === 'failed' && (
                    <div className="text-sm text-red-700 dark:text-red-400 flex items-center gap-1.5 animate-in fade-in">
                      <XCircle size={16} />
                      <span>Connection failed</span>
                    </div>
                  )}
                </div>

              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 transition-colors flex items-center gap-2"
                >
                  <Save size={18} />
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};