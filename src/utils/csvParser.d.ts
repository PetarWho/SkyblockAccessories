import type { Accessory } from '../types';

declare module './csvParser' {
  export const processCSV: (csvText: string) => Array<Omit<Accessory, 'id' | 'owned'>>;
}
