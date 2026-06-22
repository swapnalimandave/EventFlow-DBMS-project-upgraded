import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Vendor } from '../types';
import { ShoppingBag, Plus, Pencil, Trash, Search, X, Layers, Phone, FileText } from 'lucide-react';

export const VendorsPage: React.FC = () => {
  const { vendors, addNotification } = useApp();
  const [searchString, setSearchString] = useState('');
  
  // Modals / Form toggles
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetFormState = () => {
    setName('');
    setCategory('');
    setContact('');
    setNotes('');
    setEditingVendor(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) return;
    setIsSubmitting(true);

    try {
      if (editingVendor) {
        // Update Action
        const docRef = doc(db, 'vendors', editingVendor.id);
        await updateDoc(docRef, {
          name,
          category,
          contact,
          notes
        });
        addNotification('Vendor Updated', `Vendor profile details for ${name} changed.`);
      } else {
        // Insert Action
        await addDoc(collection(db, 'vendors'), {
          name,
          category,
          contact,
          notes,
          createdAt: Date.now()
        });
        addNotification('Vendor Registered', `New vendor merchant ${name} added to hubs.`);
      }
      resetFormState();
      setShowAddModal(false);
    } catch (err) {
      console.error('Error writing vendor:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (v: Vendor) => {
    setEditingVendor(v);
    setName(v.name);
    setCategory(v.category);
    setContact(v.contact);
    setNotes(v.notes || '');
    setShowAddModal(true);
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete vendor "${name}"? This might impact linked services.`)) return;
    try {
      await deleteDoc(doc(db, 'vendors', id));
      addNotification('Vendor Removed', `Vendor "${name}" deleted from index.`);
    } catch (err) {
      console.error('Error deleting vendor:', err);
    }
  };

  // Filter list
  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchString.toLowerCase()) || 
    v.category.toLowerCase().includes(searchString.toLowerCase())
  );

  return (
    <div id="vendors-page-container" className="space-y-6 text-left">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans font-black text-2xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-indigo-505 animate-pulse" /> Vendors Hub
          </h1>
          <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track external decorators, catering merchants, florist portfolios, and entertainment DJs.
          </p>
        </div>
        <button
          onClick={() => { resetFormState(); setShowAddModal(true); }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" /> Affiliate Vendor
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
          placeholder="Filter vendors by name or category..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-sans text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
        />
      </div>

      {/* Grid view */}
      {filteredVendors.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl shadow-sm">
          <ShoppingBag className="h-10 w-10 text-slate-355 mx-auto mb-3" />
          <p className="font-sans text-sm text-slate-500 dark:text-slate-450">No vendors found in hubs. Register an affiliate vendor to begin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((v) => (
            <div
              key={v.id}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl p-5 shadow-sm hover:shadow relative group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-pink-50 dark:bg-pink-955/20 flex items-center justify-center text-pink-650 dark:text-pink-400">
                    <ShoppingBag className="h-5.5 w-5.5" />
                  </div>
                  
                  {/* Action triggers */}
                  <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditClick(v)}
                      className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-550 dark:text-slate-400 hover:text-indigo-600 transition"
                      title="Edit details"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(v.id, v.name)}
                      className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-555 dark:text-slate-405 hover:text-rose-600 transition"
                      title="Remove affiliate"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-sans font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {v.name}
                </h3>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-955/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-955">
                  {v.category}
                </span>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 space-y-2.5 text-slate-655 dark:text-slate-355 font-sans text-xs">
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate">{v.contact}</span>
                  </div>
                  {v.notes && (
                    <div className="flex gap-2.5 pt-1.5 mt-1.5">
                      <FileText className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-xxs leading-relaxed italic line-clamp-2">{v.notes}</p>
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
                {editingVendor ? 'Edit Vendor Hub details' : 'Affiliate New Vendor'}
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
                  Vendor Name (Required)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Elegant Florists & Co"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-505 rounded-xl outline-none text-xs font-sans text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-widest text-slate-500 pl-1 mb-1.5">
                  Merchant Category (Required)
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Florist, Caterer, DJ Sound, AV Logistics, Cakes"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-505 rounded-xl outline-none text-xs font-sans text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-widest text-slate-500 pl-1 mb-1.5">
                  Contact Phone / coordinates
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="info@elegantflorist.com or +1 (555) 701-0928"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-505 rounded-xl outline-none text-xs font-sans text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-widest text-slate-500 pl-1 mb-1.5">
                  Affiliation Conditions Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Package pricing indices, cancellation windows, deposit policies..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-505 rounded-xl outline-none text-xs font-sans text-slate-900 dark:text-white h-20 resize-none"
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
                  ) : editingVendor ? (
                    'Save Changes'
                  ) : (
                    'Register Vendor'
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
export default VendorsPage;
