export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: 'admin' | 'client' | 'staff';
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  notes?: string;
  createdAt: number;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  capacity: number;
  contact?: string;
  notes?: string;
  createdAt: number;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  contact: string;
  assignedHours: number;
  createdAt: number;
}

export interface Vendor {
  id: string;
  name: string;
  category: string; // e.g. Catering, Florist, DJ
  contact: string;
  notes?: string;
  createdAt: number;
}

export interface Service {
  id: string;
  name: string;
  vendorId: string;
  vendorName?: string; // Cache vendor name for convenience
  cost: number;
  description?: string;
  createdAt: number;
}

export interface LinkedService {
  serviceId: string;
  name: string;
  cost: number;
  quantity: number;
}

export interface Event {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  clientId: string;
  clientName?: string;
  venueId: string;
  venueName?: string;
  budget: number;
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled';
  assignedStaffIds: string[]; // List of staff IDs
  linkedServices: LinkedService[]; // List of services inside the event
  notes?: string;
  createdAt: number;
}

export interface EventSection {
  id: string;
  title: string;
  order: number;
}

export interface EventItem {
  id: string;
  sectionId: string;
  title: string;
  status: 'todo' | 'in_progress' | 'completed';
  assignee?: string;
  dueDate?: string;
  notes?: string;
  order: number;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}
