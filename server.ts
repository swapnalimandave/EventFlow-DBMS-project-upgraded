import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { db } from './src/firebase.js';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dynamic search helpers
async function searchDocumentByName(collectionName: string, nameSearch: string): Promise<any | null> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const searchLower = nameSearch.toLowerCase();
    
    let matchedDoc: any = null;
    snapshot.forEach((d) => {
      const data = d.data();
      const name = data.name || data.title || '';
      if (name.toLowerCase().includes(searchLower)) {
        matchedDoc = { id: d.id, ...data };
      }
    });
    return matchedDoc;
  } catch (error) {
    console.error(`Error searching document in ${collectionName}:`, error);
    return null;
  }
}

// Implement CRUD Tool execution logic
async function executeTool(name: string, args: any): Promise<any> {
  console.log(`Executing AI Tool: ${name} with args:`, JSON.stringify(args));
  try {
    switch (name) {
      // CLIENTS
      case 'getClients': {
        const ref = collection(db, 'clients');
        const snap = await getDocs(ref);
        const search = (args.searchString || '').toLowerCase();
        const clients: any[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (!search || (d.name || '').toLowerCase().includes(search) || (d.email || '').toLowerCase().includes(search) || (d.company || '').toLowerCase().includes(search)) {
            clients.push({ id: docSnap.id, ...d });
          }
        });
        return { clients };
      }
      case 'addClient': {
        const ref = collection(db, 'clients');
        const docRef = await addDoc(ref, {
          name: args.name,
          email: args.email,
          phone: args.phone || '',
          company: args.company || '',
          notes: args.notes || '',
          createdAt: Date.now()
        });
        return { id: docRef.id, message: `Successfully added client ${args.name}` };
      }
      case 'updateClient': {
        let clientDocId = args.id;
        if (!clientDocId && args.name) {
          const found = await searchDocumentByName('clients', args.name);
          if (found) clientDocId = found.id;
        }
        if (!clientDocId) {
          return { error: 'Client ID or Name not found' };
        }
        const docRef = doc(db, 'clients', clientDocId);
        const updateData: any = {};
        if (args.name) updateData.name = args.name;
        if (args.email) updateData.email = args.email;
        if (args.phone !== undefined) updateData.phone = args.phone;
        if (args.company !== undefined) updateData.company = args.company;
        if (args.notes !== undefined) updateData.notes = args.notes;
        await updateDoc(docRef, updateData);
        return { message: `Successfully updated client details` };
      }
      case 'deleteClient': {
        let clientDocId = args.id;
        if (!clientDocId && args.name) {
          const found = await searchDocumentByName('clients', args.name);
          if (found) clientDocId = found.id;
        }
        if (!clientDocId) return { error: 'Client not found' };
        await deleteDoc(doc(db, 'clients', clientDocId));
        return { message: `Successfully deleted client` };
      }

      // VENUES
      case 'getVenues': {
        const ref = collection(db, 'venues');
        const snap = await getDocs(ref);
        const search = (args.searchString || '').toLowerCase();
        const venues: any[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (!search || (d.name || '').toLowerCase().includes(search) || (d.address || '').toLowerCase().includes(search)) {
            venues.push({ id: docSnap.id, ...d });
          }
        });
        return { venues };
      }
      case 'addVenue': {
        const ref = collection(db, 'venues');
        const docRef = await addDoc(ref, {
          name: args.name,
          address: args.address,
          capacity: Number(args.capacity) || 0,
          contact: args.contact || '',
          notes: args.notes || '',
          createdAt: Date.now()
        });
        return { id: docRef.id, message: `Successfully added venue ${args.name}` };
      }
      case 'updateVenue': {
        let venueId = args.id;
        if (!venueId && args.name) {
          const found = await searchDocumentByName('venues', args.name);
          if (found) venueId = found.id;
        }
        if (!venueId) return { error: 'Venue not found' };
        const docRef = doc(db, 'venues', venueId);
        const updateData: any = {};
        if (args.name) updateData.name = args.name;
        if (args.address) updateData.address = args.address;
        if (args.capacity !== undefined) updateData.capacity = Number(args.capacity);
        if (args.contact !== undefined) updateData.contact = args.contact;
        if (args.notes !== undefined) updateData.notes = args.notes;
        await updateDoc(docRef, updateData);
        return { message: 'Successfully updated venue' };
      }
      case 'deleteVenue': {
        let venueId = args.id;
        if (!venueId && args.name) {
          const found = await searchDocumentByName('venues', args.name);
          if (found) venueId = found.id;
        }
        if (!venueId) return { error: 'Venue not found' };
        await deleteDoc(doc(db, 'venues', venueId));
        return { message: 'Successfully deleted venue' };
      }

      // STAFF
      case 'getStaff': {
        const ref = collection(db, 'staff');
        const snap = await getDocs(ref);
        const search = (args.searchString || '').toLowerCase();
        const staff: any[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (!search || (d.name || '').toLowerCase().includes(search) || (d.role || '').toLowerCase().includes(search)) {
            staff.push({ id: docSnap.id, ...d });
          }
        });
        return { staff };
      }
      case 'addStaff': {
        const ref = collection(db, 'staff');
        const docRef = await addDoc(ref, {
          name: args.name,
          role: args.role,
          contact: args.contact || '',
          assignedHours: Number(args.assignedHours) || 0,
          createdAt: Date.now()
        });
        return { id: docRef.id, message: `Successfully registered staff member ${args.name}` };
      }
      case 'updateStaff': {
        let staffId = args.id;
        if (!staffId && args.name) {
          const found = await searchDocumentByName('staff', args.name);
          if (found) staffId = found.id;
        }
        if (!staffId) return { error: 'Staff member not found' };
        const docRef = doc(db, 'staff', staffId);
        const updateData: any = {};
        if (args.name) updateData.name = args.name;
        if (args.role) updateData.role = args.role;
        if (args.contact !== undefined) updateData.contact = args.contact;
        if (args.assignedHours !== undefined) updateData.assignedHours = Number(args.assignedHours);
        await updateDoc(docRef, updateData);
        return { message: 'Successfully updated staff member' };
      }
      case 'deleteStaff': {
        let staffId = args.id;
        if (!staffId && args.name) {
          const found = await searchDocumentByName('staff', args.name);
          if (found) staffId = found.id;
        }
        if (!staffId) return { error: 'Staff member not found' };
        await deleteDoc(doc(db, 'staff', staffId));
        return { message: 'Successfully deleted staff member' };
      }

      // VENDORS
      case 'getVendors': {
        const ref = collection(db, 'vendors');
        const snap = await getDocs(ref);
        const search = (args.searchString || '').toLowerCase();
        const vendors: any[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (!search || (d.name || '').toLowerCase().includes(search) || (d.category || '').toLowerCase().includes(search)) {
            vendors.push({ id: docSnap.id, ...d });
          }
        });
        return { vendors };
      }
      case 'addVendor': {
        const ref = collection(db, 'vendors');
        const docRef = await addDoc(ref, {
          name: args.name,
          category: args.category,
          contact: args.contact || '',
          notes: args.notes || '',
          createdAt: Date.now()
        });
        return { id: docRef.id, message: `Successfully registered vendor ${args.name}` };
      }
      case 'updateVendor': {
        let vendorId = args.id;
        if (!vendorId && args.name) {
          const found = await searchDocumentByName('vendors', args.name);
          if (found) vendorId = found.id;
        }
        if (!vendorId) return { error: 'Vendor not found' };
        const docRef = doc(db, 'vendors', vendorId);
        const updateData: any = {};
        if (args.name) updateData.name = args.name;
        if (args.category) updateData.category = args.category;
        if (args.contact !== undefined) updateData.contact = args.contact;
        if (args.notes !== undefined) updateData.notes = args.notes;
        await updateDoc(docRef, updateData);
        return { message: 'Successfully updated vendor' };
      }
      case 'deleteVendor': {
        let vendorId = args.id;
        if (!vendorId && args.name) {
          const found = await searchDocumentByName('vendors', args.name);
          if (found) vendorId = found.id;
        }
        if (!vendorId) return { error: 'Vendor not found' };
        await deleteDoc(doc(db, 'vendors', vendorId));
        return { message: 'Successfully deleted vendor' };
      }

      // SERVICES
      case 'getServices': {
        const ref = collection(db, 'services');
        const snap = await getDocs(ref);
        const search = (args.searchString || '').toLowerCase();
        const services: any[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (!search || (d.name || '').toLowerCase().includes(search) || (d.description || '').toLowerCase().includes(search)) {
            services.push({ id: docSnap.id, ...d });
          }
        });
        return { services };
      }
      case 'addService': {
        let vendorId = args.vendorId;
        let vendorName = '';
        if (args.vendorName && !vendorId) {
          const found = await searchDocumentByName('vendors', args.vendorName);
          if (found) {
            vendorId = found.id;
            vendorName = found.name;
          }
        } else if (vendorId) {
          const snap = await getDoc(doc(db, 'vendors', vendorId));
          if (snap.exists()) {
            vendorName = snap.data().name || '';
          }
        }
        if (!vendorId) {
          return { error: 'A valid vendor ID or vendor Name must be provided to add a service' };
        }
        const ref = collection(db, 'services');
        const docRef = await addDoc(ref, {
          name: args.name,
          vendorId,
          vendorName,
          cost: Number(args.cost) || 0,
          description: args.description || '',
          createdAt: Date.now()
        });
        return { id: docRef.id, message: `Successfully registered service ${args.name}` };
      }

      // EVENTS
      case 'getEvents': {
        const ref = collection(db, 'events');
        const snap = await getDocs(ref);
        const search = (args.searchString || '').toLowerCase();
        const events: any[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (!search || (d.title || '').toLowerCase().includes(search) || (d.notes || '').toLowerCase().includes(search)) {
            events.push({ id: docSnap.id, ...d });
          }
        });
        return { events };
      }
      case 'addEvent': {
        // Find client
        let clientId = args.clientId || '';
        let clientName = '';
        if (args.clientName && !clientId) {
          const matchedClient = await searchDocumentByName('clients', args.clientName);
          if (matchedClient) {
            clientId = matchedClient.id;
            clientName = matchedClient.name;
          }
        } else if (clientId) {
          const s = await getDoc(doc(db, 'clients', clientId));
          if (s.exists()) clientName = s.data().name || '';
        }

        // Find venue
        let venueId = args.venueId || '';
        let venueName = '';
        if (args.venueName && !venueId) {
          const matchedVenue = await searchDocumentByName('venues', args.venueName);
          if (matchedVenue) {
            venueId = matchedVenue.id;
            venueName = matchedVenue.name;
          }
        } else if (venueId) {
          const s = await getDoc(doc(db, 'venues', venueId));
          if (s.exists()) venueName = s.data().name || '';
        }

        const ref = collection(db, 'events');
        const docRef = await addDoc(ref, {
          title: args.title,
          date: args.date, // format YYYY-MM-DD
          time: args.time || '12:00',
          clientId,
          clientName,
          venueId,
          venueName,
          budget: Number(args.budget) || 0,
          status: args.status || 'planning',
          assignedStaffIds: [],
          linkedServices: [],
          notes: args.notes || '',
          createdAt: Date.now()
        });
        return { id: docRef.id, title: args.title, message: `Successfully planned event "${args.title}" for ${args.date}` };
      }
      case 'updateEvent': {
        let eventId = args.id;
        if (!eventId && args.title) {
          const found = await searchDocumentByName('events', args.title);
          if (found) eventId = found.id;
        }
        if (!eventId) return { error: 'Event not found' };
        
        const docRef = doc(db, 'events', eventId);
        const updateData: any = {};
        if (args.title) updateData.title = args.title;
        if (args.date) updateData.date = args.date;
        if (args.time) updateData.time = args.time;
        if (args.budget !== undefined) updateData.budget = Number(args.budget);
        if (args.status) updateData.status = args.status;
        if (args.notes !== undefined) updateData.notes = args.notes;
        
        await updateDoc(docRef, updateData);
        return { message: 'Successfully updated event' };
      }
      case 'deleteEvent': {
        let eventId = args.id;
        if (!eventId && args.title) {
          const found = await searchDocumentByName('events', args.title);
          if (found) eventId = found.id;
        }
        if (!eventId) return { error: 'Event not found' };
        await deleteDoc(doc(db, 'events', eventId));
        return { message: 'Successfully deleted event' };
      }

      // SUBCOLLECTIONS & ASSIGNMENTS inside Event
      case 'addEventSection': {
        let eventId = args.eventId;
        if (!eventId && args.eventTitle) {
          const found = await searchDocumentByName('events', args.eventTitle);
          if (found) eventId = found.id;
        }
        if (!eventId) return { error: 'Event not found' };

        // Fetch how many sections there are to set correct ordering
        const sectionsRef = collection(db, 'events', eventId, 'sections');
        const sectionsSnap = await getDocs(sectionsRef);
        const order = sectionsSnap.size;

        const docRef = await addDoc(sectionsRef, {
          title: args.title,
          order: order
        });
        return { id: docRef.id, message: `Successfully added section "${args.title}" to event` };
      }
      case 'addEventItem': {
        let eventId = args.eventId;
        if (!eventId && args.eventTitle) {
          const found = await searchDocumentByName('events', args.eventTitle);
          if (found) eventId = found.id;
        }
        if (!eventId) return { error: 'Event not found' };

        // Find sectionId from section title if sectionId not explicitly specified
        let sectionId = args.sectionId || '';
        const sectionsRef = collection(db, 'events', eventId, 'sections');
        const sectionsSnap = await getDocs(sectionsRef);
        
        if (!sectionId && args.sectionTitle) {
          sectionsSnap.forEach((sec) => {
            if ((sec.data().title || '').toLowerCase() === args.sectionTitle.toLowerCase()) {
              sectionId = sec.id;
            }
          });
        }
        // If still no section, use the first section or create a default "Tasks" one
        if (!sectionId) {
          if (sectionsSnap.size > 0) {
            sectionId = sectionsSnap.docs[0].id;
          } else {
            // Auto create an first section
            const secRef = await addDoc(sectionsRef, { title: 'Tasks', order: 0 });
            sectionId = secRef.id;
          }
        }

        const itemsRef = collection(db, 'events', eventId, 'sections', sectionId, 'items');
        const itemsSnap = await getDocs(itemsRef);
        const order = itemsSnap.size;

        const itemRef = await addDoc(itemsRef, {
          sectionId,
          title: args.title,
          status: args.status || 'todo',
          assignee: args.assignee || '',
          dueDate: args.dueDate || '',
          notes: args.notes || '',
          order: order
        });
        return { id: itemRef.id, message: `Successfully added list-item "${args.title}" under event checklist` };
      }
      case 'assignStaffToEvent': {
        let eventId = args.eventId;
        if (!eventId && args.eventTitle) {
          const found = await searchDocumentByName('events', args.eventTitle);
          if (found) eventId = found.id;
        }
        if (!eventId) return { error: 'Event not found' };

        let staffId = args.staffId;
        let staffName = '';
        if (args.staffName && !staffId) {
          const found = await searchDocumentByName('staff', args.staffName);
          if (found) {
            staffId = found.id;
            staffName = found.name;
          }
        }
        if (!staffId) return { error: 'Staff member not found' };

        const eventRef = doc(db, 'events', eventId);
        const eventSnap = await getDoc(eventRef);
        if (!eventSnap.exists()) return { error: 'Event details invalid' };

        const eventData = eventSnap.data();
        const assignedStaffIds = eventData.assignedStaffIds || [];
        if (!assignedStaffIds.includes(staffId)) {
          assignedStaffIds.push(staffId);
          await updateDoc(eventRef, { assignedStaffIds });
        }
        return { message: `Assigned staff member ${staffName || staffId} to event` };
      }
      case 'linkServiceToEvent': {
        let eventId = args.eventId;
        if (!eventId && args.eventTitle) {
          const found = await searchDocumentByName('events', args.eventTitle);
          if (found) eventId = found.id;
        }
        if (!eventId) return { error: 'Event not found' };

        let serviceId = args.serviceId;
        let serviceName = '';
        let serviceCost = 0;
        if (args.serviceName && !serviceId) {
          const found = await searchDocumentByName('services', args.serviceName);
          if (found) {
            serviceId = found.id;
            serviceName = found.name;
            serviceCost = found.cost || 0;
          }
        } else if (serviceId) {
          const snap = await getDoc(doc(db, 'services', serviceId));
          if (snap.exists()) {
            serviceName = snap.data().name || '';
            serviceCost = snap.data().cost || 0;
          }
        }
        if (!serviceId) return { error: 'Service not found' };

        const eventRef = doc(db, 'events', eventId);
        const eventSnap = await getDoc(eventRef);
        if (!eventSnap.exists()) return { error: 'Event details invalid' };

        const eventData = eventSnap.data();
        const linkedServices = eventData.linkedServices || [];
        
        // Check if already linked
        const idx = linkedServices.findIndex((ls: any) => ls.serviceId === serviceId);
        const quantity = Number(args.quantity) || 1;
        if (idx > -1) {
          linkedServices[idx].quantity += quantity;
        } else {
          linkedServices.push({
            serviceId,
            name: serviceName,
            cost: serviceCost,
            quantity
          });
        }
        await updateDoc(eventRef, { linkedServices });
        return { message: `Linked service "${serviceName}" with quantity ${quantity} to event` };
      }
      default:
        return { error: `Tool ${name} is not implemented yet.` };
    }
  } catch (error: any) {
    console.error(`Error executing ${name}:`, error);
    return { error: error.message };
  }
}

// AI Assistant Endpoint using standard Gemini SDK
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message payload is required' });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.json({
        content: 'I need a valid Google Gemini API key to assist you. Please configure the GEMINI_API_KEY under the Secrets menu in your workspace settings.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build chat structure
    // We send full state of tools
    const toolDeclarations = [
      {
        name: 'getClients',
        description: 'Get all clients or search for clients matching a string',
        parameters: {
          type: 'OBJECT',
          properties: {
            searchString: { type: 'STRING', description: 'Search term for name, company or email' }
          }
        }
      },
      {
        name: 'addClient',
        description: 'Create a new business client record',
        parameters: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING', description: 'Name of the client' },
            email: { type: 'STRING', description: 'Email address of client' },
            phone: { type: 'STRING', description: 'Phone contact' },
            company: { type: 'STRING', description: 'Company name' },
            notes: { type: 'STRING', description: 'Special notes' }
          },
          required: ['name', 'email']
        }
      },
      {
        name: 'addVenue',
        description: 'Add a venue details record',
        parameters: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING', description: 'Venue name' },
            address: { type: 'STRING', description: 'Venue physical address' },
            capacity: { type: 'NUMBER', description: 'Maximum guest capacity' },
            contact: { type: 'STRING', description: 'Venue contact person/phone' },
            notes: { type: 'STRING', description: 'Special rules or notes' }
          },
          required: ['name', 'address']
        }
      },
      {
        name: 'getVenues',
        description: 'Get all venues or search',
        parameters: {
          type: 'OBJECT',
          properties: {
            searchString: { type: 'STRING', description: 'Search term' }
          }
        }
      },
      {
        name: 'addStaff',
        description: 'Add or register an internal or external staff member',
        parameters: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING', description: 'Staff full name' },
            role: { type: 'STRING', description: 'Responsibility role' },
            contact: { type: 'STRING', description: 'Email or phone' },
            assignedHours: { type: 'NUMBER', description: 'Pre-set work hours allocation' }
          },
          required: ['name', 'role']
        }
      },
      {
        name: 'getStaff',
        description: 'Get staff members list',
        parameters: {
          type: 'OBJECT',
          properties: {
            searchString: { type: 'STRING' }
          }
        }
      },
      {
        name: 'addVendor',
        description: 'Register a third party vendor',
        parameters: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING', description: 'Vendor company name' },
            category: { type: 'STRING', description: 'DJ, Catering, Security, Decoration etc.' },
            contact: { type: 'STRING', description: 'Contact details' },
            notes: { type: 'STRING' }
          },
          required: ['name', 'category']
        }
      },
      {
        name: 'getVendors',
        description: 'Get list of vendors',
        parameters: {
          type: 'OBJECT',
          properties: {
            searchString: { type: 'STRING' }
          }
        }
      },
      {
        name: 'addService',
        description: 'Register a unique service item linked to a vendor',
        parameters: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING', description: 'Service descriptive title' },
            vendorName: { type: 'STRING', description: 'Associated vendor helper search term' },
            cost: { type: 'NUMBER', description: 'Cost of service' },
            description: { type: 'STRING' }
          },
          required: ['name', 'vendorName', 'cost']
        }
      },
      {
        name: 'getServices',
        description: 'List available specialized services',
        parameters: {
          type: 'OBJECT',
          properties: {
            searchString: { type: 'STRING' }
          }
        }
      },
      {
        name: 'addEvent',
        description: 'Schedule a brand new event matching date/time, client, and venue names/IDs',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'Formal name of the event' },
            date: { type: 'STRING', description: 'Date in YYYY-MM-DD format' },
            time: { type: 'STRING', description: 'Time in HH:MM format' },
            clientName: { type: 'STRING', description: 'Name of the client, used to link correctly' },
            venueName: { type: 'STRING', description: 'Name of the venue, used to link' },
            budget: { type: 'NUMBER', description: 'Planned total events budget' },
            notes: { type: 'STRING' }
          },
          required: ['title', 'date']
        }
      },
      {
        name: 'getEvents',
        description: 'Get all scheduled events',
        parameters: {
          type: 'OBJECT',
          properties: {
            searchString: { type: 'STRING' }
          }
        }
      },
      {
        name: 'addEventSection',
        description: 'Build a custom checklist section/heading inside an event',
        parameters: {
          type: 'OBJECT',
          properties: {
            eventTitle: { type: 'STRING', description: 'The title/name of the event to modify' },
            title: { type: 'STRING', description: 'Section title (e.g. Menu, Tasks, Guest Arrivals)' }
          },
          required: ['eventTitle', 'title']
        }
      },
      {
        name: 'addEventItem',
        description: 'Create individual checklist items under an event section',
        parameters: {
          type: 'OBJECT',
          properties: {
            eventTitle: { type: 'STRING', description: 'Event title' },
            sectionTitle: { type: 'STRING', description: 'The parent section category heading' },
            title: { type: 'STRING', description: 'Checklist task title' },
            assignee: { type: 'STRING', description: 'Name of person assigned to do it' },
            dueDate: { type: 'STRING', description: 'Date in YYYY-MM-DD format' },
            notes: { type: 'STRING', description: 'Notes or checklists explanation' }
          },
          required: ['eventTitle', 'title']
        }
      },
      {
        name: 'assignStaffToEvent',
        description: 'Assign a staff member to assist/lead for an event',
        parameters: {
          type: 'OBJECT',
          properties: {
            eventTitle: { type: 'STRING' },
            staffName: { type: 'STRING' }
          },
          required: ['eventTitle', 'staffName']
        }
      },
      {
        name: 'linkServiceToEvent',
        description: 'Link vendor services alongside a specific quantity inside an event',
        parameters: {
          type: 'OBJECT',
          properties: {
            eventTitle: { type: 'STRING' },
            serviceName: { type: 'STRING' },
            quantity: { type: 'NUMBER' }
          },
          required: ['eventTitle', 'serviceName', 'quantity']
        }
      }
    ];

    // Format chat contents
    const contents: any[] = [];
    if (history && history.length > 0) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role === 'ai' ? 'model' : 'user',
          parts: [{ text: h.text }]
        });
      });
    }
    
    // Add current user prompt
    contents.push({ role: 'user', parts: [{ text: message }] });

    const systemInstruction = `You are "EventFlow AI" — a smart assistant integrated directly into EventFlow, a Real-Time Event Management system.
Your mission is to process natural-language instructions from the event planner or clients and execute CRUD operations automatically on the database using Firestore tools.

When the user asks you to carry out actions (e.g. "Add client...", "Create venue...", "Schedule wedding...", "Add checklist item..."), ALWAYS look at your function/tool list and select the appropriate functions to call.
If they ask a query-based question ("How many events do I have?", "Can you tell me which venues are registered?"), feel free to run the query tools first to fetch details, and then write a natural, beautifully formatted conversational summary using markdown lists, headers and bolding.

Never reference raw code structure or say "I am calling addClient function". Just perform the action, and return a friendly, supportive message. When users enter relative dates, understand that the current year is 2026.`;

    // 1st Generation call
    let response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: toolDeclarations as any }]
      }
    });

    let functionCalls = response.functionCalls || [];
    let loopCount = 0;

    // Multi-turn tool loops
    while (functionCalls.length > 0 && loopCount < 5) {
      loopCount++;
      
      // Save model's thought turn and function calls
      contents.push(response.candidates?.[0]?.content || { role: 'model', parts: [{ text: response.text || '' }] });

      const toolParts: any[] = [];
      for (const call of functionCalls) {
        const result = await executeTool(call.name, call.args);
        toolParts.push({
          functionResponse: {
            name: call.name,
            response: { result }
          }
        });
      }

      // Add tool response turn
      contents.push({ role: 'user', parts: toolParts });

      // Run next turn
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: toolDeclarations as any }]
        }
      });

      functionCalls = response.functionCalls || [];
    }

    res.json({ content: response.text || 'Action complete. The database has been updated!' });

  } catch (err: any) {
    console.error('Error in /api/chat route:', err);
    res.status(500).json({ error: err.message || 'Internal AI Server Error' });
  }
});

// Configure Vite or production static server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EventFlow Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
