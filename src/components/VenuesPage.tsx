import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Venue } from '../types';
import { MapPin, Plus, Pencil, Trash, Search, X, Users, Phone, FileText } from 'lucide-react';

export const VenuesPage: React.FC = () => {
  const { venues, addNotification } = useApp();
  const [searchString, setSearchString] = useState('');
  
  // Modals / Form toggles
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetFormState = () => {
    setName('');
    setAddress('');
    setCapacity('');
    setContact('');
    setNotes('');
    setEditingVenue(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;
    setIsSubmitting(true);

    try {
      if (editingVenue) {
        // Update Action
        const docRef = doc(db, 'venues', editingVenue.id);
        await updateDoc(docRef, {
          name,
          address,
          capacity: Number(capacity) || 0,
          contact,
          notes
        });
        addNotification('Venue Updated', `Venue details for ${name} successfully changed.`);
      } else {
        // Insert Action
        await addDoc(collection(db, 'venues'), {
          name,
          address,
          capacity: Number(capacity) || 0,
          contact,
          notes,
          createdAt: Date.now()
        });
        addNotification('Venue Registered', `New venue ${name} added to directories.`);
      }
      resetFormState();
      setShowAddModal(false);
    } catch (err) {
      console.error('Error writing venue:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (venue: Venue) => {
    setEditingVenue(venue);
    setName(venue.name);
    setAddress(venue.address);
    setCapacity(String(venue.capacity));
    setContact(venue.contact || '');
    setNotes(venue.notes || '');
    setShowAddModal(true);
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete venue "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'venues', id));
      addNotification('Venue Deleted', `Removed venue "${name}" from listings.`);
    } catch (err) {
      console.error('Error deleting venue:', err);
    }
  };

  // Filter list
  const filteredVenues = venues.filter(v => 
    v.name.toLowerCase().includes(searchString.toLowerCase()) || 
    v.address.toLowerCase().includes(searchString.toLowerCase())
  );

  return (
    <div id="venues-page-container" className="space-y-6 text-left">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans font-black text-2xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MapPin className="h-6 w-6 text-indigo-505 animate-pulse" /> Venues Directory
          </h1>
          <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-1">
            Map out location bookings, guest capacity limits, contact details and rules.
          </p>
        </div>
        <button
          onClick={() => { resetFormState(); setShowAddModal(true); }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" /> Allocate Venue
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
          placeholder="Filter venues by name or location..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-sans text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
        />
      </div>

      {/* Grid view */}
      {filteredVenues.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl shadow-sm">
          <MapPin className="h-10 w-10 text-slate-355 mx-auto mb-3" />
          <p className="font-sans text-sm text-slate-500 dark:text-slate-450">No locations match. Allocate a new venue to start.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((v) => (
            <div
              key={v.id}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl p-5 shadow-sm hover:shadow relative group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-55/30 dark:bg-indigo-950 flex items-center justify-center text-indigo-650 dark:text-indigo-400">
                    <MapPin className="h-5.5 w-5.5" />
                  </div>
                  
                  {/* Action triggers */}
                  <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditClick(v)}
                      className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-505 dark:text-slate-400 hover:text-indigo-600 transition"
                      title="Edit venue details"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(v.id, v.name)}
                      className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-505 dark:text-slate-405 hover:text-rose-600 transition"
                      title="Delete log"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-sans font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {v.name}
                </h3>
                <p className="font-sans text-xxs text-slate-450 dark:text-slate-500 mt-1 lines-clamp-1">{v.address}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 space-y-2.5 text-slate-655 dark:text-slate-355 font-sans text-xs">
                  <div className="flex items-center gap-2.5">
                    <Users className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>Capacity: <span className="font-bold text-slate-800 dark:text-white">{v.capacity} guests</span></span>
                  </div>
                  {v.contact && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{v.contact}</span>
                    </div>
                  )}
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
                {editingVenue ? 'Edit Venue Details' : 'Allocate New Venue'}
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
                  Venue Name (Required)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Grand Celebration Hall"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-505 rounded-xl outline-none text-xs font-sans text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-widest text-slate-500 pl-1 mb-1.5">
                  Physical Address (Required)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="128 Skyline Boulevard, Sector 4"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-505 rounded-xl outline-none text-xs font-sans text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xxs font-bold uppercase tracking-widest text-slate-500 pl-1 mb-1.5">
                    Capacity (Guests)
                  </label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="350"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-505 rounded-xl outline-none text-xs font-sans text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold uppercase tracking-widest text-slate-500 pl-1 mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+1 (555) 901-2093"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-505 rounded-xl outline-none text-xs font-sans text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-widest text-slate-500 pl-1 mb-1.5">
                  Availability & Special Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Curfew conditions, sound limits, deposit rates..."
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
                  ) : editingVenue ? (
                    'Save Changes'
                  ) : (
                    'Allocate Venue'
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
export default VenuesPage;
