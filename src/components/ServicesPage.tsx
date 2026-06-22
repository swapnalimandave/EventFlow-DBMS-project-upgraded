import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../firebase';
import { collection, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Service } from '../types';
import { Layers, Plus, Pencil, Trash, Search, X, DollarSign, Tag, Info } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const { services, vendors, addNotification } = useApp();
  const [searchString, setSearchString] = useState('');
  
  // Modals / Form toggles
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [cost, setCost] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetFormState = () => {
    setName('');
    setVendorId('');
    setCost('');
    setDescription('');
    setEditingService(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !vendorId || !cost) {
      alert('Name, Vendor selection and Cost are required.');
      return;
    }
    setIsSubmitting(true);

    const vendorObj = vendors.find(v => v.id === vendorId);
    const vendorName = vendorObj ? vendorObj.name : 'Unknown Vendor';

    try {
      if (editingService) {
        // Update Action
        const docRef = doc(db, 'services', editingService.id);
        await updateDoc(docRef, {
          name,
          vendorId,
          vendorName,
          cost: Number(cost) || 0,
          description
        });
        addNotification('Service Updated', `Changed details for service packet "${name}".`);
      } else {
        // Insert Action
        await addDoc(collection(db, 'services'), {
          name,
          vendorId,
          vendorName,
          cost: Number(cost) || 0,
          description,
          createdAt: Date.now()
        });
        addNotification('Service Created', `Registered new service packet "${name}".`);
      }
      resetFormState();
      setShowAddModal(false);
    } catch (err) {
      console.error('Error writing service:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (s: Service) => {
    setEditingService(s);
    setName(s.name);
    setVendorId(s.vendorId);
    setCost(String(s.cost));
    setDescription(s.description || '');
    setShowAddModal(true);
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete service packet "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'services', id));
      addNotification('Service Deleted', `Removed service packet "${name}".`);
    } catch (err) {
      console.error('Error deleting service:', err);
    }
  };

  // Filter list
  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchString.toLowerCase()) || 
    (s.description || '').toLowerCase().includes(searchString.toLowerCase()) || 
    (s.vendorName || '').toLowerCase().includes(searchString.toLowerCase())
  );

  return (
    <div id="services-page-container" className="space-y-6 text-left">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans font-black text-2xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-indigo-505 animate-pulse" /> Vendor Services Directory
          </h1>
          <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-1">
            Map specific packages (Catering Menus, DJ Sound set, Floral arrangements) alongside pricing grids.
          </p>
        </div>
        <button
          onClick={() => { resetFormState(); setShowAddModal(true); }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" /> Log Service Package
        </button>
      </div>

      {/* Search / Filter Actions */}
      <div className="relative max-w-sm">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450 dark:text-slate-500">
          <Search className="h-4.5 w-4.5" />
        </div>
        <input
          type="text"
          value={searchString}
          onChange={(e) => setSearchString(e.target.value)}
          placeholder="Filter services by title or description..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-sans text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
        />
      </div>

      {/* Grid view */}
      {filteredServices.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl shadow-sm">
          <Layers className="h-10 w-10 text-slate-355 mx-auto mb-3" />
          <p className="font-sans text-sm text-slate-500 dark:text-slate-450">No service packages registered. Select Log Service above to start.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl p-5 shadow-sm hover:shadow relative group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-955/20 flex items-center justify-center text-purple-650 dark:text-purple-400">
                    <Layers className="h-5.5 w-5.5" />
                  </div>
                  
                  {/* Action triggers */}
                  <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditClick(s)}
                      className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-555 dark:text-slate-400 hover:text-indigo-600 transition"
                      title="Edit package parameters"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(s.id, s.name)}
                      className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-555 dark:text-slate-405 hover:text-rose-600 transition"
                      title="Remove package"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-sans font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {s.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Tag className="h-3 w-3 text-slate-400" />
                  <span className="font-sans text-xxs text-slate-500 font-bold truncate">
                    Vendor: {s.vendorName || 'Independent'}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex flex-col gap-2.5 text-slate-655 dark:text-slate-355 font-sans text-xs">
                  <div className="flex items-center gap-1.5 text-indigo-650 dark:text-indigo-400 font-black text-sm">
                    <DollarSign className="h-4 w-4 shrink-0" />
                    <span>${s.cost.toLocaleString()}</span>
                  </div>
                  {s.description && (
                    <div className="flex gap-2.5 pt-1 border-t border-slate-50 dark:border-slate-800 mt-1">
                      <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-xxs leading-relaxed italic line-clamp-3">{s.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reg/Edit Modal Popup */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 w-full max-w-md animate-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-sans font-black text-lg text-slate-900 dark:text-white">
                {editingService ? 'Edit Package Parameters' : 'Register Service Package'}
              </h2>
              <button
                onClick={() => { resetFormState(); setShowAddModal(false); }}
                className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xxs font-bold uppercase tracking-widest text-slate-500 pl-1 mb-1.5">
                  Service Title Name (Required)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Premium 4-Course French Catering"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-505 rounded-xl outline-none text-xs font-sans text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-widest text-slate-500 pl-1 mb-1.5">
                  Link Associated Merchant (Required)
                </label>
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-800 focus:border-indigo-505 rounded-xl outline-none text-xs font-sans text-slate-900 dark:text-white cursor-pointer"
                  required
                >
                  <option value="" disabled>-- Select Vendor --</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-widest text-slate-505 pl-1 mb-1.5">
                  Cost Package Price (USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <DollarSign className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="1500"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-505 rounded-xl outline-none text-xs font-sans text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-widest text-slate-500 pl-1 mb-1.5">
                  Package Description Features
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe inclusions (e.g. servers included, cleanup services, cutlery setup)..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-800 focus:border-indigo-505 rounded-xl outline-none text-xs font-sans text-slate-900 dark:text-white h-24 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => { resetFormState(); setShowAddModal(false); }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-sans font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : editingService ? (
                    'Save Changes'
                  ) : (
                    'Create Package'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default ServicesPage;
