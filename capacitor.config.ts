import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.udaykranth.ai',
  appName: 'Prof Joe AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'localhost'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#0b0f19',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    }
  }
};

export default config;
