import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { Event, EventSection, EventItem, Staff, Service, LinkedService } from '../types';
import {
  FolderDot, Plus, Pencil, Trash, X, Calendar, DollarSign,
  User, CheckSquare, PlusCircle, Trash2, Layout, Layers, Briefcase, ChevronLeft, Check, Play, Square, CircleCheck, CheckIcon
} from 'lucide-react';

interface EventsPageProps {
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({ selectedEventId, setSelectedEventId }) => {
  const { events, clients, venues, staff, services, addNotification } = useApp();

  // Navigation and toggle states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Core Event Form fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-06-25');
  const [time, setTime] = useState('14:00');
  const [clientId, setClientId] = useState('');
  const [venueId, setVenueId] = useState('');
  const [budget, setBudget] = useState('');
  const [status, setStatus] = useState<'planning' | 'confirmed' | 'completed' | 'cancelled'>('planning');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subcollections state (for active detailed event board)
  const [sections, setSections] = useState<EventSection[]>([]);
  const [itemsBySection, setItemsBySection] = useState<{ [secId: string]: EventItem[] }>({});

  // Mini actions forms state inside detail view
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showAddSectionRow, setShowAddSectionRow] = useState(false);

  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemAssignee, setNewItemAssignee] = useState('');
  const [newItemDueDate, setNewItemDueDate] = useState('');
  const [addingItemToSecId, setAddingItemToSecId] = useState<string | null>(null);

  const [assigningStaffId, setAssigningStaffId] = useState('');
  const [linkingServiceId, setLinkingServiceId] = useState('');
  const [linkingServiceQty, setLinkingServiceQty] = useState('1');

  // Load subcollection rules whenever selectedEventId shifts
  useEffect(() => {
    if (!selectedEventId) {
      setSections([]);
      setItemsBySection({});
      return;
    }

    console.log(`Subscribing to custom sections on event ${selectedEventId}`);
    
    // Subscribe to custom sections inside that event
    const sectionsRef = collection(db, 'events', selectedEventId, 'sections');
    const unsubSections = onSnapshot(sectionsRef, (snap) => {
      const list: EventSection[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as EventSection);
      });
      setSections(list.sort((a, b) => a.order - b.order));
    });

    return () => {
      unsubSections();
    };
  }, [selectedEventId]);

  // Subscribe to items in each section
  useEffect(() => {
    if (!selectedEventId || sections.length === 0) {
      setItemsBySection({});
      return;
    }

    const unsubs = sections.map((sec) => {
      const itemsRef = collection(db, 'events', selectedEventId, 'sections', sec.id, 'items');
      return onSnapshot(itemsRef, (snap) => {
        const list: EventItem[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as EventItem);
        });
        setItemsBySection(prev => ({
          ...prev,
          [sec.id]: list.sort((a, b) => a.order - b.order)
        }));
      });
    });

    return () => {
      unsubs.forEach(u => u());
    };
  }, [sections, selectedEventId]);

  const activeEvent = events.find(e => e.id === selectedEventId) || null;

  const resetFormState = () => {
    setTitle('');
    setDate('2026-06-25');
    setTime('14:00');
    setClientId('');
    setVenueId('');
    setBudget('');
    setStatus('planning');
    setNotes('');
    setEditingEvent(null);
  };

  const handleEventFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;
    setIsSubmitting(true);

    const clientObj = clients.find(c => c.id === clientId);
    const clientName = clientObj ? clientObj.name : '';

    const venueObj = venues.find(v => v.id === venueId);
    const venueName = venueObj ? venueObj.name : '';

    try {
      if (editingEvent) {
        // Edit Action
        const docRef = doc(db, 'events', editingEvent.id);
        await updateDoc(docRef, {
          title,
          date,
          time,
          clientId,
          clientName,
          venueId,
          venueName,
          budget: Number(budget) || 0,
          status,
          notes
        });
        addNotification('Event Amended', `Planned event parameters for "${title}" modified.`);
      } else {
        // Create brand new planning event record
        const docRef = await addDoc(collection(db, 'events'), {
          title,
          date,
          time,
          status,
          clientId,
          clientName,
          venueId,
          venueName,
          budget: Number(budget) || 0,
          assignedStaffIds: [],
          linkedServices: [],
          notes,
          createdAt: Date.now()
        });
        
        // Auto initialize a default section for convenient checklist additions
        const sectionsRef = collection(db, 'events', docRef.id, 'sections');
        await addDoc(sectionsRef, { title: 'General Logistics', order: 0 });

        addNotification('Event Scheduled', `A new schedule for "${title}" created.`);
      }
      resetFormState();
      setShowAddForm(false);
    } catch (err) {
      console.error('Error writing event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEventClick = (evt: Event) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setDate(evt.date);
    setTime(evt.time || '12:00');
    setClientId(evt.clientId);
    setVenueId(evt.venueId);
    setBudget(String(evt.budget));
    setStatus(evt.status);
    setNotes(evt.notes || '');
    setShowAddForm(true);
  };

  const handleDeleteEventClick = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete event "${name}"? This removes all subcol checklist configurations.`)) return;
    try {
      await deleteDoc(doc(db, 'events', id));
      setSelectedEventId(null);
      addNotification('Event Deleted', `Successfully removed event "${name}".`);
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  // Staff and Services assign callbacks
  const handleAssignStaff = async () => {
    if (!selectedEventId || !assigningStaffId || !activeEvent) return;
    const currentStaffList = activeEvent.assignedStaffIds || [];
    if (currentStaffList.includes(assigningStaffId)) {
        alert('This staff member is already assigned.');
        return;
    }
    const updatedSub = [...currentStaffList, assigningStaffId];
    await updateDoc(doc(db, 'events', selectedEventId), { assignedStaffIds: updatedSub });
    setAssigningStaffId('');
  };

  const handleRemoveStaff = async (staffId: string) => {
    if (!selectedEventId || !activeEvent) return;
    const updatedSub = (activeEvent.assignedStaffIds || []).filter(sid => sid !== staffId);
    await updateDoc(doc(db, 'events', selectedEventId), { assignedStaffIds: updatedSub });
  };

  const handleLinkServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !linkingServiceId || !activeEvent) return;

    const serv = services.find(s => s.id === linkingServiceId);
    if (!serv) return;

    const qty = Number(linkingServiceQty) || 1;
    const currentServices = activeEvent.linkedServices || [];
    
    const existingIndex = currentServices.findIndex(item => item.serviceId === linkingServiceId);
    if (existingIndex > -1) {
      currentServices[existingIndex].quantity += qty;
    } else {
      currentServices.push({
        serviceId: linkingServiceId,
        name: serv.name,
        cost: serv.cost,
        quantity: qty
      });
    }

    await updateDoc(doc(db, 'events', selectedEventId), { linkedServices: currentServices });
    setLinkingServiceId('');
    setLinkingServiceQty('1');
  };

  const handleUnlinkService = async (serviceId: string) => {
    if (!selectedEventId || !activeEvent) return;
    const updatedSub = (activeEvent.linkedServices || []).filter(item => item.serviceId !== serviceId);
    await updateDoc(doc(db, 'events', selectedEventId), { linkedServices: updatedSub });
  };

  // Sections custom board writers
  const handleCreateSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !newSectionTitle.trim()) return;

    try {
      const colRef = collection(db, 'events', selectedEventId, 'sections');
      await addDoc(colRef, {
        title: newSectionTitle.trim(),
        order: sections.length
      });
      setNewSectionTitle('');
      setShowAddSectionRow(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSection = async (secId: string, titleName: string) => {
    if (!window.confirm(`Are you sure you want to delete section heading "${titleName}" and its subtasks?`)) return;
    if (!selectedEventId) return;

    try {
      await deleteDoc(doc(db, 'events', selectedEventId, 'sections', secId));
    } catch (err) {
      console.error(err);
    }
  };

  // Sub tasks writers inside section
  const handleCreateTaskSubmit = async (e: React.FormEvent, secId: string) => {
    e.preventDefault();
    if (!selectedEventId || !newItemTitle.trim()) return;

    const colRef = collection(db, 'events', selectedEventId, 'sections', secId, 'items');
    await addDoc(colRef, {
      sectionId: secId,
      title: newItemTitle.trim(),
      status: 'todo',
      assignee: newItemAssignee.trim() || 'Unassigned',
      dueDate: newItemDueDate || '',
      order: (itemsBySection[secId] || []).length
    });

    setNewItemTitle('');
    setNewItemAssignee('');
    setNewItemDueDate('');
    setAddingItemToSecId(null);
  };

  const handleToggleTaskStatus = async (secId: string, task: EventItem) => {
    if (!selectedEventId) return;
    const taskRef = doc(db, 'events', selectedEventId, 'sections', secId, 'items', task.id);
    await updateDoc(taskRef, {
      status: task.status === 'completed' ? 'todo' : 'completed'
    });
  };

  const handleDeleteTask = async (secId: string, taskId: string) => {
    if (!selectedEventId) return;
    const taskRef = doc(db, 'events', selectedEventId, 'sections', secId, 'items', taskId);
    await deleteDoc(taskRef);
  };

  // Event Stats
  const calculateTotalBudgetSpent = (evt: Event) => {
    const linked = evt.linkedServices || [];
    return linked.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
  };

  return (
    <div id="events-master-container" className="text-left">
      
      {/* If Event Detail is active, show the workspace dashboard screen */}
      {selectedEventId && activeEvent ? (
        <div className="space-y-6">
          
          {/* Breadcrumb Navigation header */}
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setSelectedEventId(null)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
            >
              <ChevronLeft className="h-4.5 w-4.5" /> Back to events lists
            </button>
          </div>

          {/* Event profile header detail panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-6 rounded-2xl flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-2">
              <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                activeEvent.status === 'confirmed' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-950'
              }`}>
                {activeEvent.status}
              </span>
              <h1 className="font-sans font-black text-2xl text-slate-900 dark:text-white tracking-tight leading-none mt-1">
                {activeEvent.title}
              </h1>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-sans text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 shrink-0">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>{activeEvent.date} @ {activeEvent.time || '12:00'}</span>
                </div>
                {activeEvent.clientName && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>Client: <span className="font-semibold text-slate-700 dark:text-slate-350">{activeEvent.clientName}</span></span>
                  </div>
                )}
                {activeEvent.venueName && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Layout className="h-4 w-4 text-slate-400" />
                    <span>Venue: <span className="font-semibold text-slate-700 dark:text-slate-350">{activeEvent.venueName}</span></span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 justify-center md:items-end text-left md:text-right text-xs font-sans">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Budget Limit vs Expenses Allocation</p>
                <p className="mt-1 font-sans text-xs text-slate-655 dark:text-slate-400">
                  Allocation: <span className="font-black text-slate-900 dark:text-white">${calculateTotalBudgetSpent(activeEvent).toLocaleString()} / ${activeEvent.budget.toLocaleString()}</span>
                </p>
                <div className="mt-2 w-full md:w-48 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-650 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (calculateTotalBudgetSpent(activeEvent) / (activeEvent.budget || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: FLEXIBLE CUSTOM BOARD (Sections + tasks list subcollections) */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-6 rounded-2xl shadow-sm">
                
                {/* Board header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-850">
                  <div>
                    <h3 className="font-sans font-extrabold text-sm text-slate-900 dark:text-white">Live Operations Checklist Boards</h3>
                    <p className="font-sans text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Define custom groupings and add reorderable checking details to synchronize teams.</p>
                  </div>
                  
                  {!showAddSectionRow && (
                    <button
                      onClick={() => setShowAddSectionRow(true)}
                      className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-sans text-xxs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <PlusCircle className="h-4 w-4" /> Add Section
                    </button>
                  )}
                </div>

                {/* Section insertion row */}
                {showAddSectionRow && (
                  <form onSubmit={handleCreateSectionSubmit} className="flex gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl mb-6">
                    <input
                      type="text"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      placeholder="Enter Arbitrary Category Name (e.g. Photography, Catering menu)"
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xxs outline-none font-sans"
                      required
                    />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xxs py-1.5 px-3 rounded-lg font-bold">Add</button>
                    <button type="button" onClick={() => setShowAddSectionRow(false)} className="border border-slate-200 text-slate-500 hover:bg-white dark:hover:bg-slate-800 font-sans text-xxs py-1.5 px-3 rounded-lg">Cancel</button>
                  </form>
                )}

                {/* Sections Render Cascade */}
                <div className="space-y-6">
                  {sections.length === 0 ? (
                    <p className="text-center italic py-8 text-slate-400 text-xs pl-2">
                      No custom boards created yet. Introduce the first section category above!
                    </p>
                  ) : (
                    sections.map((sec) => {
                      const tasks = itemsBySection[sec.id] || [];
                      return (
                        <div key={sec.id} className="border border-slate-100 dark:border-slate-850 rounded-xl overflow-hidden shadow-2xs">
                          {/* Section Category header */}
                          <div className="bg-slate-50/50 dark:bg-slate-950/20 px-4 py-3 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
                            <h4 className="font-sans font-black text-[11px] uppercase tracking-wider text-slate-800 dark:text-slate-300 pr-2">
                              📂 {sec.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setAddingItemToSecId(sec.id)}
                                className="text-xxs font-bold text-indigo-650 dark:text-indigo-400 hover:underline cursor-pointer"
                              >
                                + Add details
                              </button>
                              <button
                                onClick={() => handleDeleteSection(sec.id, sec.title)}
                                className="p-1 rounded hover:bg-rose-50 hover:text-rose-600 text-slate-400 dark:hover:bg-rose-955/20"
                                title="Wipe out section"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Detail tasks checkbox lists */}
                          <div className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900 text-xs">
                            {tasks.length === 0 ? (
                              <p className="p-4 text-center text-xxs italic text-slate-405 pl-1">
                                Section is empty. Click "+ Add details" to schedule subtasks.
                              </p>
                            ) : (
                              tasks.map((task) => (
                                <div key={task.id} className="p-3.5 flex items-start gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-850">
                                  {/* Checkbox status toggle */}
                                  <button
                                    onClick={() => handleToggleTaskStatus(sec.id, task)}
                                    className="h-5 w-5 rounded-md border border-slate-205 dark:border-slate-750 flex items-center justify-center shrink-0 mt-0.5 hover:border-indigo-550 mr-1 cursor-pointer transition text-indigo-600 dark:text-indigo-400"
                                  >
                                    {task.status === 'completed' && <Check className="h-3.5 w-3.5 stroke-[3px]" />}
                                  </button>

                                  <div className="flex-1 min-w-0">
                                    <p className={`font-sans font-semibold text-xs text-slate-850 dark:text-slate-200 transition ${
                                      task.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : ''
                                    }`}>
                                      {task.title}
                                    </p>
                                    
                                    <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-sans text-slate-455 font-medium">
                                      {task.assignee && (
                                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-405 px-2 py-0.5 rounded-md">Assigned: {task.assignee}</span>
                                      )}
                                      {task.dueDate && (
                                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-605 dark:text-slate-405 px-2 py-0.5 rounded-md">Due: {task.dueDate}</span>
                                      )}
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => handleDeleteTask(sec.id, task.id)}
                                    className="p-1 hover:text-rose-600 text-slate-350"
                                  >
                                    <Trash className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Quick sub-item inline form */}
                          {addingItemToSecId === sec.id && (
                            <form
                              onSubmit={(e) => handleCreateTaskSubmit(e, sec.id)}
                              className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 space-y-3"
                            >
                              <div>
                                <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">Checklist Task Title</label>
                                <input
                                  type="text"
                                  value={newItemTitle}
                                  onChange={(e) => setNewItemTitle(e.target.value)}
                                  placeholder="Reserve transport, pay deposit to florist..."
                                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-920 border border-slate-200 dark:border-slate-800 rounded-lg text-xxs font-sans"
                                  required
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3.5">
                                <div>
                                  <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">Assignee</label>
                                  <input
                                    type="text"
                                    value={newItemAssignee}
                                    onChange={(e) => setNewItemAssignee(e.target.value)}
                                    placeholder="John Cooper"
                                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-920 border border-slate-200 dark:border-slate-800 rounded-lg text-xxs font-sans"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">Due Date</label>
                                  <input
                                    type="date"
                                    value={newItemDueDate}
                                    onChange={(e) => setNewItemDueDate(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-920 border border-slate-200 dark:border-slate-800 rounded-lg text-xxs font-sans"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end gap-2.5 pt-1.5">
                                <button type="button" onClick={() => setAddingItemToSecId(null)} className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-xxs rounded-lg font-sans">Cancel</button>
                                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xxs font-sans font-bold">Add Task</button>
                              </div>
                            </form>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            </div>

            {/* Right Column: Coordination Panels (Staff assignments & Linked service expenses) */}
            <div className="space-y-6">
              
              {/* Coordinator allocation */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
                <h3 className="font-sans font-extrabold text-sm text-slate-800 dark:text-white mb-1">
                  Coordinators Assigned
                </h3>
                <p className="font-sans text-[11px] text-slate-400 dark:text-slate-500 mb-4">
                  Register internal or external coordinators for active schedules.
                </p>

                <div className="space-y-2 mb-4">
                  {(!activeEvent.assignedStaffIds || activeEvent.assignedStaffIds.length === 0) ? (
                    <p className="text-xxs italic text-slate-400 py-1.5">No staff assigned yet.</p>
                  ) : (
                    activeEvent.assignedStaffIds.map(sid => {
                      const sfObj = staff.find(s => s.id === sid);
                      return (
                        <div key={sid} className="p-2 bg-slate-50 dark:bg-slate-850/50 rounded-lg flex items-center justify-between text-xs">
                          <div>
                            <p className="font-sans font-bold text-slate-800 dark:text-white">{sfObj?.name || 'Assigned hand'}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{sfObj?.role || 'Staff role'}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveStaff(sid)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            title="Remove assignment"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add assignment selector */}
                <div className="flex gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <select
                    value={assigningStaffId}
                    onChange={(e) => setAssigningStaffId(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-150 rounded-lg text-xxs outline-none cursor-pointer"
                  >
                    <option value="" disabled>-- Assign Staff --</option>
                    {staff.map(st => (
                      <option key={st.id} value={st.id}>{st.name} ({st.role})</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignStaff}
                    disabled={!assigningStaffId}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xxs font-sans font-bold"
                  >
                    Assign
                  </button>
                </div>
              </div>

              {/* Vendors Services link list */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
                <h3 className="font-sans font-extrabold text-sm text-slate-800 dark:text-white mb-1">
                  Linked Packages Expenses
                </h3>
                <p className="font-sans text-[11px] text-slate-400 dark:text-slate-500 mb-4">
                  Log active third party service package expenses for current agendas.
                </p>

                <div className="space-y-2 mb-4">
                  {(!activeEvent.linkedServices || activeEvent.linkedServices.length === 0) ? (
                    <p className="text-xxs italic text-slate-400 py-1.5">No services linked yet.</p>
                  ) : (
                    activeEvent.linkedServices.map(item => {
                      return (
                        <div key={item.serviceId} className="p-2.5 bg-slate-50 dark:bg-slate-850/50 rounded-lg flex items-center justify-between text-xs">
                          <div className="min-w-0 pr-2">
                            <p className="font-sans font-bold text-slate-800 dark:text-white truncate">{item.name}</p>
                            <p className="text-[10px] text-slate-405 mt-0.5">
                              ${item.cost.toLocaleString()} × {item.quantity} = <span className="font-bold text-slate-700 dark:text-slate-200">${(item.cost * item.quantity).toLocaleString()}</span>
                            </p>
                          </div>
                          <button
                            onClick={() => handleUnlinkService(item.serviceId)}
                            className="p-1 text-slate-450 hover:text-rose-600 shrink-0"
                            title="Unlink service"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Service Linking Form dropdown list */}
                <form onSubmit={handleLinkServiceSubmit} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  <div className="flex gap-2">
                    <select
                      value={linkingServiceId}
                      onChange={(e) => setLinkingServiceId(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-855 border border-slate-150 rounded-lg text-xxs outline-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>-- Service Package --</option>
                      {services.map(ser => (
                        <option key={ser.id} value={ser.id}>{ser.name} (${ser.cost})</option>
                      ))}
                    </select>
                    
                    <input
                      type="number"
                      value={linkingServiceQty}
                      onChange={(e) => setLinkingServiceQty(e.target.value)}
                      placeholder="Qty"
                      min="1"
                      className="w-12 px-2 py-1.5 bg-slate-50 dark:bg-slate-855 border border-slate-150 rounded-lg text-xxs outline-none"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!linkingServiceId}
                    className="w-full py-1.5 bg-indigo-650 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xxs font-sans font-bold cursor-pointer"
                  >
                    Link Service Expense
                  </button>
                </form>
              </div>

            </div>

          </div>

        </div>
      ) : (
        /* Master Events List view */
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-sans font-black text-2xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <FolderDot className="h-6 w-6 text-indigo-505 animate-pulse" /> Events Coordination Queue
              </h1>
              <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-1">
                Schedule calendars, assign managed clients, and review live operational custom boards.
              </p>
            </div>
            
            {!showAddForm && (
              <button
                onClick={() => { resetFormState(); setShowAddForm(true); }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md shrink-0 cursor-pointer"
              >
                <Plus className="h-4.5 w-4.5" /> Plan Event
              </button>
            )}
          </div>

          {/* Event scheduler creation form */}
          {showAddForm && (
            <div id="event-reg-card" className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-6 sm:p-8 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-sans font-black text-base text-slate-900 dark:text-white">
                  {editingEvent ? 'Amend Event parameters' : 'Establish Brand New Event'}
                </h3>
                <button
                  onClick={() => { resetFormState(); setShowAddForm(false); }}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleEventFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                <div>
                  <label className="block text-xxs font-bold uppercase tracking-widest text-slate-540 mb-1.5">Event Title (Required)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Grand Wedding, Corporate Tech Seminar"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-205 rounded-xl text-xs font-sans"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xxs font-bold uppercase tracking-widest text-slate-540 mb-1.5">Date (Required)</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-205 rounded-xl text-xs font-sans"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold uppercase tracking-widest text-slate-540 mb-1.5">Time</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-205 rounded-xl text-xs font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xxs font-bold uppercase tracking-widest text-slate-540 mb-1.5">Assign Client Portfolio</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-855 border border-slate-205 rounded-xl text-xs font-sans"
                  >
                    <option value="">-- No linked Client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.company || 'Private'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xxs font-bold uppercase tracking-widest text-slate-540 mb-1.5">Allocate Venue Hall</label>
                  <select
                    value={venueId}
                    onChange={(e) => setVenueId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-855 border border-slate-205 rounded-xl text-xs font-sans"
                  >
                    <option value="">-- No linked Venue --</option>
                    {venues.map(v => (
                      <option key={v.id} value={v.id}>{v.name} (Max: {v.capacity})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xxs font-bold uppercase tracking-widest text-slate-540 mb-1.5">Project budget (USD)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <DollarSign className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="25000"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-205 rounded-xl text-xs font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xxs font-bold uppercase tracking-widest text-slate-540 mb-1.5">Operational Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-855 border border-slate-205 rounded-xl text-xs font-sans cursor-pointer"
                    >
                      <option value="planning">Planning (Draft)</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xxs font-bold uppercase tracking-widest text-slate-540 mb-1.5">Planner Agenda Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Log core operational checklists references..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-205 rounded-xl text-xs font-sans h-20 resize-none"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => { resetFormState(); setShowAddForm(false); }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-sans font-semibold text-slate-705"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-sans font-bold shadow-md"
                  >
                    {isSubmitting ? 'Processing...' : editingEvent ? 'Amend parameters' : 'Establish Agenda'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Grid display */}
          {events.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl shadow-sm">
              <FolderDot className="h-10 w-10 text-slate-355 mx-auto mb-3" />
              <p className="font-sans text-sm text-slate-500 dark:text-slate-450">No events generated. Click Plan Event above to allocate calendars.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-2.5 py-0.5 border rounded-full ${
                          evt.status === 'confirmed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-950'
                            : evt.status === 'planning'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-150 dark:border-amber-900'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {evt.status}
                        </span>
                        <h3 className="font-sans font-black text-sm text-slate-900 dark:text-white mt-1.5 leading-snug group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors cursor-pointer" onClick={() => setSelectedEventId(evt.id)}>
                          {evt.title}
                        </h3>
                      </div>

                      {/* Action triggers */}
                      <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => handleEditEventClick(evt)}
                          className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-505 dark:text-slate-400 hover:text-indigo-600 transition"
                          title="Edit planning details"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEventClick(evt.id, evt.title)}
                          className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-505 dark:text-slate-405 hover:text-rose-600 transition"
                          title="Delete agenda"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-slate-655 dark:text-slate-355 font-sans text-xs">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>Date: <span className="font-bold text-slate-800 dark:text-white">{evt.date} @ {evt.time || '12:00'}</span></span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Client Portal</p>
                          <p className="font-semibold text-slate-800 dark:text-white truncate mt-0.5">{evt.clientName || 'Private Planning'}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Venue Hall</p>
                          <p className="font-semibold text-slate-800 dark:text-white truncate mt-0.5">{evt.venueName || 'Host Residence'}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs font-semibold">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Budget allocation</span>
                        <span className="text-slate-900 dark:text-white font-black">${evt.budget.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedEventId(evt.id)}
                      className="text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0"
                    >
                      Workspace Custom Boards <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
export default EventsPage;
