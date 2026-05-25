import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stellas.tutor',
  appName: 'Stellas',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
