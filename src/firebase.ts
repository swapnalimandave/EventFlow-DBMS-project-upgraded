import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

const auth = getAuth(app);

// Use custom core database ID if provided in config
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
export default app;
