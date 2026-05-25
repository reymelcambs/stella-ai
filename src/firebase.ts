import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfigJson from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  appId: process.env.FIREBASE_APP_ID || firebaseConfigJson.appId,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || firebaseConfigJson.measurementId,
  firestoreDatabaseId: process.env.FIRESTORE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId,
};

const app = initializeApp(firebaseConfig);
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
