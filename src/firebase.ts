import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from '../firebase-applet-config.json';

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
