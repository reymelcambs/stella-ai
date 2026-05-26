import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv} from 'vite';

// Generate dummy firebase-applet-config.json if it is missing (e.g. in Vercel/CI builds)
const dummyConfigPath = path.resolve(__dirname, 'firebase-applet-config.json');
if (!fs.existsSync(dummyConfigPath)) {
  try {
    fs.writeFileSync(dummyConfigPath, JSON.stringify({
      apiKey: '',
      authDomain: '',
      projectId: '',
      appId: '',
      storageBucket: '',
      messagingSenderId: '',
      measurementId: '',
      firestoreDatabaseId: ''
    }, null, 2));
    console.log('[Vite Config] Generated dummy firebase-applet-config.json successfully.');
  } catch (err) {
    console.warn('[Vite Config] Failed to create dummy firebase-applet-config.json:', err);
  }
}

const safeEnv = (value: string | undefined) => {
  const normalized = value?.trim();
  if (!normalized || normalized.startsWith('your_') || normalized === 'undefined' || normalized === 'null') {
    return '';
  }
  return normalized;
};

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.FIREBASE_API_KEY': JSON.stringify(safeEnv(env.FIREBASE_API_KEY)),
      'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(safeEnv(env.FIREBASE_AUTH_DOMAIN)),
      'process.env.FIREBASE_PROJECT_ID': JSON.stringify(safeEnv(env.FIREBASE_PROJECT_ID)),
      'process.env.FIREBASE_APP_ID': JSON.stringify(safeEnv(env.FIREBASE_APP_ID)),
      'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(safeEnv(env.FIREBASE_STORAGE_BUCKET)),
      'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(safeEnv(env.FIREBASE_MESSAGING_SENDER_ID)),
      'process.env.FIREBASE_MEASUREMENT_ID': JSON.stringify(safeEnv(env.FIREBASE_MEASUREMENT_ID)),
      'process.env.FIRESTORE_DATABASE_ID': JSON.stringify(safeEnv(env.FIRESTORE_DATABASE_ID)),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
