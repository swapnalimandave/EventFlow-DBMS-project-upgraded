import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Client, Venue, Staff, Vendor, Service, Event, UserProfile, SystemNotification } from '../types';

interface AppContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  clients: Client[];
  venues: Venue[];
  staff: Staff[];
  vendors: Vendor[];
  services: Service[];
  events: Event[];
  notifications: SystemNotification[];
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  addNotification: (title: string, message: string) => void;
  clearNotification: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Real-time Lists
  const [clients, setClients] = useState<Client[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  
  // Local Notifications state
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'welcome',
      title: 'Welcome to EventFlow',
      message: 'Plan your events smoothly in real-time. Use the AI chat floating assistant to automate actions!',
      timestamp: Date.now(),
      read: false
    }
  ]);

  const addNotification = (title: string, message: string) => {
    const newNotif: SystemNotification = {
      id: Math.random().toString(36).substring(7),
      title,
      message,
      timestamp: Date.now(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Manage Light / Dark Mode in HTML classes
  useEffect(() => {
    setTheme('light');
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, [theme]);

  // Auth Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch/create profile
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setProfile(userDocSnap.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
            role: 'admin' // default role
          };
          await setDoc(userDocRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribeAuth;
  }, []);

  // Real-time Firestore Listeners (only initialize when user is logged in)
  useEffect(() => {
    if (!user) {
      // Clear data on logout
      setClients([]);
      setVenues([]);
      setStaff([]);
      setVendors([]);
      setServices([]);
      setEvents([]);
      return;
    }

    console.log('Registering real-time Firestore listeners...');

    // Clients Listener
    const unsubClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
      const list: Client[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Client);
      });
      setClients(list.sort((a, b) => b.createdAt - a.createdAt));
    }, (error) => {
      console.error('Clients listener error:', error);
    });

    // Venues Listener
    const unsubVenues = onSnapshot(collection(db, 'venues'), (snapshot) => {
      const list: Venue[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Venue);
      });
      setVenues(list.sort((a, b) => b.createdAt - a.createdAt));
    }, (error) => {
      console.error('Venues listener error:', error);
    });

    // Staff Listener
    const unsubStaff = onSnapshot(collection(db, 'staff'), (snapshot) => {
      const list: Staff[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Staff);
      });
      setStaff(list.sort((a, b) => b.createdAt - a.createdAt));
    }, (error) => {
      console.error('Staff listener error:', error);
    });

    // Vendors Listener
    const unsubVendors = onSnapshot(collection(db, 'vendors'), (snapshot) => {
      const list: Vendor[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Vendor);
      });
      setVendors(list.sort((a, b) => b.createdAt - a.createdAt));
    }, (error) => {
      console.error('Vendors listener error:', error);
    });

    // Services Listener
    const unsubServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      const list: Service[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Service);
      });
      setServices(list.sort((a, b) => b.createdAt - a.createdAt));
    }, (error) => {
      console.error('Services listener error:', error);
    });

    // Events Listener
    const unsubEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      const list: Event[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Event);
      });
      setEvents(list.sort((a, b) => b.createdAt - a.createdAt));
    }, (error) => {
      console.error('Events listener error:', error);
    });

    // Dynamic Notifications Trigger based on real-time event additions
    const unsubEventAlerts = onSnapshot(collection(db, 'events'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const eventData = change.doc.data();
          // Avoid triggering on initial population or stale reads: check if timestamp is recent (last 30 seconds)
          if (eventData.createdAt && Date.now() - eventData.createdAt < 30000) {
            addNotification(
              '🎉 New Event Registered',
              `Event "${eventData.title}" has been added on ${eventData.date}.`
            );
          }
        }
      });
    });

    return () => {
      unsubClients();
      unsubVenues();
      unsubStaff();
      unsubVendors();
      unsubServices();
      unsubEvents();
      unsubEventAlerts();
    };
  }, [user]);

  return (
    <AppContext.Provider value={{
      user,
      profile,
      loading,
      clients,
      venues,
      staff,
      vendors,
      services,
      events,
      notifications,
      theme,
      setTheme,
      addNotification,
      clearNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
