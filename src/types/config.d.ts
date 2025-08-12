/**
 * Type declarations for the application configuration
 * This file helps TypeScript understand the shape of the config object
 */

declare module '@/config' {
  interface AppConfig {
    // Environment flags
    isDev: boolean;
    isStaging: boolean;
    isProd: boolean;
    
    // API and WebSocket URLs
    apiUrl: string;
    wsUrl: string;
    
    // Feature flags
    features: {
      [key: string]: boolean;
    };
    
    // Theme settings
    theme: {
      [key: string]: any;
    };
    
    // Environment-specific values
    env: {
      [key: string]: string | number | boolean | undefined;
    };
    
    // Helper methods
    isFeatureEnabled: (featureName: string) => boolean;
    getThemeValue: (category: string, value: string) => any;
    getEnvValue: <T>(devValue: T, stagingValue: T, prodValue: T) => T;
  }
  
  const config: AppConfig;
  export default config;
}

// For CommonJS compatibility
declare module '@/config/config' {
  import config from '@/config';
  export default config;
}
