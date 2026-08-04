import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.udaykranth.ai',
  appName: 'Prof Joe AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'localhost'
  }
};

export default config;
