/// <reference types="vite/client" />

declare module '*.csv' {
  const content: string;
  export default content;
}

// Add this to help TypeScript understand our CSV parser module
declare module '@/utils/csvParser' {
  import { Accessory } from '@/types';
  export const processCSV: (csvText: string) => Array<Omit<Accessory, 'id' | 'owned'>>;
}
