import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Client } from '../types';
import { Users, Plus, Pencil, Trash, Search, X, Mail, Phone, Building, FileText } from 'lucide-react';

export const ClientsPage: React.FC = () => {
  const { clients, addNotification } = useApp();
  const [searchString, setSearchString] = useState('');
  
  // Modals / Form toggles
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetFormState = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setNotes('');
    setEditingClient(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setIsSubmitting(true);

    try {
      if (editingClient) {
        // Update Action
        const clientRef = doc(db, 'clients', editingClient.id);
        await updateDoc(clientRef, {
          name,
          email,
          phone,
          company,
          notes
        });
        addNotification('Client Updated', `Client details for ${name} successfully changed.`);
      } else {
        // Insert Action
        await addDoc(collection(db, 'clients'), {
          name,
          email,
          phone,
          company,
          notes,
          createdAt: Date.now()
        });
        addNotification('Client Registered', `New client ${name} registered in directory.`);
      }
      resetFormState();
      setShowAddModal(false);
    } catch (err) {
      console.error('Error writing client:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone || '');
    setCompany(client.company || '');
    setNotes(client.notes || '');
    setShowAddModal(true);
  };

  const handleDeleteClick = async (id: string, clientName: string) => {
    if (!window.confirm(`Are you sure you want to delete client "${clientName}"?`)) return;
    try {
      await deleteDoc(doc(db, 'clients', id));
      addNotification('Client Deleted', `Removed client "${clientName}" from directory.`);
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };

  // Filter clients list
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchString.toLowerCase()) || 
    c.email.toLowerCase().includes(searchString.toLowerCase()) || 
    (c.company || '').toLowerCase().includes(searchString.toLowerCase())
  );

  return (
    <div id="clients-page-container" className="space-y-6 text-left">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans font-black text-2xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-505 animate-pulse" /> Clients Directory (CRM)
          </h1>
          <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maintain complete client portfolios, log communication notes, and review linkages.
          </p>
        </div>
        <button
          onClick={() => { resetFormState(); setShowAddModal(true); }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" /> Register Client
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
          placeholder="Filter by name, email or company..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-sans text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
        />
      </div>

      {/* Clients grid */}
      {filteredClients.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl shadow-sm">
          <Users className="h-10 w-10 text-slate-350 mx-auto mb-3" />
          <p className="font-sans text-sm text-slate-500 dark:text-slate-450">No clients match your filter. Register one using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl p-5 shadow-sm hover:shadow relative group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-650 dark:text-indigo-400 font-sans font-black uppercase text-sm">
                    {client.name.substring(0, 2)}
                  </div>
                  
                  {/* Action triggers */}
                  <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditClick(client)}
                      className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition"
                      title="Edit details"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(client.id, client.name)}
                      className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-405 hover:text-rose-600 transition"
                      title="Delete profile"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-sans font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {client.name}
                </h3>

                <div className="mt-4 space-y-2.5 text-slate-655 dark:text-slate-355 font-sans text-xs">
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.company && (
                    <div className="flex items-center gap-2.5">
                      <Building className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate">{client.company}</span>
                    </div>
                  )}
                  {client.notes && (
                    <div className="flex gap-2.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 mt-2.5">
                      <FileText className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-xxs leading-relaxed italic line-clamp-2">{client.notes}</p>
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
                {editingClient ? 'Edit Client Details' : 'Register New Client'}
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
                  Full Name (Required)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-505 rounded-xl outline-none text-xs font-sans text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-widest text-slate-500 pl-1 mb-1.5">
                  Email Address (Required)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@email.com"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-505 rounded-xl outline-none text-xs font-sans text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-widest text-slate-500 pl-1 mb-1.5">
                  Phone (Optional)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-505 rounded-xl outline-none text-xs font-sans text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-widest text-slate-500 pl-1 mb-1.5">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Global Weddings Inc."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-505 rounded-xl outline-none text-xs font-sans text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-widest text-slate-500 pl-1 mb-1.5">
                  Portfolios Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Dietary rules, special request files, preferred contacts..."
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
                  ) : editingClient ? (
                    'Save Changes'
                  ) : (
                    'Register Client'
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
export default ClientsPage;
