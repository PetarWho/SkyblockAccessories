import type { Accessory } from '../types';

const STORAGE_KEY = 'skyblock_accessories';

export const saveAccessories = (accessories: Accessory[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accessories));};

export const loadAccessories = (defaultAccessories: Accessory[]): Accessory[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultAccessories;
  
  try {
    const parsed = JSON.parse(saved) as Accessory[];
    // Merge with default to ensure new items are included
    const savedMap = new Map(parsed.map(a => [a.id, a]));
    
    // Merge saved data with default, preserving owned status
    return defaultAccessories.map(acc => ({
      ...acc,
      owned: savedMap.get(acc.id)?.owned || false
    }));
  } catch (e) {
    console.error('Failed to parse saved accessories', e);
    return defaultAccessories;
  }
};

export const exportAccessories = (accessories: Accessory[]): string => {
  return JSON.stringify(accessories);
};

export const importAccessories = (data: string, defaultAccessories: Accessory[]): Accessory[] => {
  try {
    const imported = JSON.parse(data) as Accessory[];
    const importedMap = new Map(imported.map(a => [a.id, a]));
    
    // Merge imported data with default, preserving any new items
    return defaultAccessories.map(acc => ({
      ...acc,
      owned: importedMap.get(acc.id)?.owned || false
    }));
  } catch (e) {
    console.error('Failed to parse imported data', e);
    throw new Error('Invalid import data');
  }
};
