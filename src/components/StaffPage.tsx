import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Staff } from '../types';
import { Briefcase, Plus, Pencil, Trash, Search, X, Mail, Clock, ShieldCheck } from 'lucide-react';

export const StaffPage: React.FC = () => {
  const { staff, addNotification } = useApp();
  const [searchString, setSearchString] = useState('');
  
  // Modals / Form toggles
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [contact, setContact] = useState('');
  const [assignedHours, setAssignedHours] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetFormState = () => {
    setName('');
    setRole('');
    setContact('');
    setAssignedHours('');
    setEditingStaff(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) return;
    setIsSubmitting(true);

    try {
      if (editingStaff) {
        // Update Action
        const docRef = doc(db, 'staff', editingStaff.id);
        await updateDoc(docRef, {
          name,
          role,
          contact,
          assignedHours: Number(assignedHours) || 0
        });
        addNotification('Staff Updated', `Assigned parameters for ${name} changed.`);
      } else {
        // Insert Action
        await addDoc(collection(db, 'staff'), {
          name,
          role,
          contact,
          assignedHours: Number(assignedHours) || 0,
          createdAt: Date.now()
        });
        addNotification('Staff Registered', `New coordinator ${name} registered.`);
      }
      resetFormState();
      setShowAddModal(false);
    } catch (err) {
      console.error('Error writing staff:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (s: Staff) => {
    setEditingStaff(s);
    setName(s.name);
    setRole(s.role);
    setContact(s.contact);
    setAssignedHours(String(s.assignedHours));
    setShowAddModal(true);
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete staff member "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'staff', id));
      addNotification('Staff Removed', `Removed ${name} from registries.`);
    } catch (err) {
      console.error('Error deleting staff:', err);
    }
  };

  // Filter list
  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchString.toLowerCase()) || 
    s.role.toLowerCase().includes(searchString.toLowerCase())
  );

  return (
    <div id="staff-page-container" className="space-y-6 text-left">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans font-black text-2xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-indigo-505 animate-pulse" /> Staff Registry
          </h1>
          <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track coordinator assignments, roles, contact indexes, and pre-allocated times.
          </p>
        </div>
        <button
          onClick={() => { resetFormState(); setShowAddModal(true); }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" /> Register Coordinator
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
          placeholder="Filter staff by name or role..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-sans text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
        />
      </div>

      {/* Grid view */}
      {filteredStaff.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl shadow-sm">
          <Briefcase className="h-10 w-10 text-slate-355 mx-auto mb-3" />
          <p className="font-sans text-sm text-slate-500 dark:text-slate-450">No staff members match. Register a new coordinator to start.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl p-5 shadow-sm hover:shadow relative group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-950 flex items-center justify-center text-orange-650 dark:text-orange-400">
                    <Briefcase className="h-5.5 w-5.5" />
                  </div>
                  
                  {/* Action triggers */}
                  <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditClick(s)}
                      className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-505 dark:text-slate-400 hover:text-indigo-600 transition"
                      title="Edit staff member"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(s.id, s.name)}
                      className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-505 dark:text-slate-405 hover:text-rose-600 transition"
                      title="Remove profile"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-sans font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {s.name}
                </h3>
                <p className="font-sans text-xxs text-amber-600 dark:text-amber-400 font-bold mt-1 uppercase tracking-wider">{s.role}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 space-y-2.5 text-slate-655 dark:text-slate-355 font-sans text-xs">
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate">{s.contact}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>Allocated hours: <span className="font-bold text-slate-800 dark:text-white">{s.assignedHours} hrs/week</span></span>
                  </div>
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
                {editingStaff ? 'Edit Staff parameters' : 'Register New Coordinator'}
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
                  Staff Member Name (Required)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Amandine Leroy"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-505 rounded-xl outline-none text-xs font-sans text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-widest text-slate-500 pl-1 mb-1.5">
                  Responsibility Role (Required)
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Lead Coordinator, Catering Lead, Dj, Security Lead"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-505 rounded-xl outline-none text-xs font-sans text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-widest text-slate-500 pl-1 mb-1.5">
                  Contact Coordinates
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="amandine@email.com or +1 (555) 902-1200"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-505 rounded-xl outline-none text-xs font-sans text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-widest text-slate-500 pl-1 mb-1.5">
                  Allocated Work Hours (Hrs per week)
                </label>
                <input
                  type="number"
                  value={assignedHours}
                  onChange={(e) => setAssignedHours(e.target.value)}
                  placeholder="24"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-505 rounded-xl outline-none text-xs font-sans text-slate-900 dark:text-white"
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
                  ) : editingStaff ? (
                    'Save Changes'
                  ) : (
                    'Register Coordinator'
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
export default StaffPage;
