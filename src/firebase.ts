import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfigJson from '../firebase-applet-config.json';

const resolveEnv = (value: string | undefined, fallback?: string) => {
  const normalized = value?.trim();
  if (!normalized || normalized.startsWith('your_') || normalized === 'undefined' || normalized === 'null') {
    return fallback;
  }
  return normalized;
};

const firebaseConfig = {
  apiKey: resolveEnv(process.env.FIREBASE_API_KEY, firebaseConfigJson.apiKey),
  authDomain: resolveEnv(process.env.FIREBASE_AUTH_DOMAIN, firebaseConfigJson.authDomain),
  projectId: resolveEnv(process.env.FIREBASE_PROJECT_ID, firebaseConfigJson.projectId),
  appId: resolveEnv(process.env.FIREBASE_APP_ID, firebaseConfigJson.appId),
  storageBucket: resolveEnv(process.env.FIREBASE_STORAGE_BUCKET, firebaseConfigJson.storageBucket),
  messagingSenderId: resolveEnv(process.env.FIREBASE_MESSAGING_SENDER_ID, firebaseConfigJson.messagingSenderId),
  measurementId: resolveEnv(process.env.FIREBASE_MEASUREMENT_ID, firebaseConfigJson.measurementId),
  firestoreDatabaseId: resolveEnv(process.env.FIRESTORE_DATABASE_ID, firebaseConfigJson.firestoreDatabaseId),
};

let app;
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} catch (error) {
  app = getApp();
}

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true
}, firebaseConfig.firestoreDatabaseId);

async function testConnection() {
  try {
    // Attempt to fetch a dummy document from the server to verify connection
    // We expect this to fail (either 404 if not found or 403 if restricted),
    // but the failure confirms the client reached the server.
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
  } catch (error) {
    // If it's a 404 or just general error, it means we reached the server.
    // We ignore it silently as this was just a connection test.
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firestore Connection Error: The client is offline.");
    }
  }
}

testConnection();
