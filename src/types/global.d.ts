// Global type declarations for modules without type definitions
declare module '*.module.css';
declare module '*.module.scss';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg' {
  import React from 'react';
  const content: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default content;
}

// Global type extensions
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    DISCORD_TOKEN: string;
    CLIENT_ID: string;
    // Add other environment variables here
  }
}

// React type declarations
import 'react';

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Add any custom HTML attributes here
    css?: any;
  }
}

// Global types for better type safety
type Nullable<T> = T | null | undefined;
type ValueOf<T> = T[keyof T];
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
