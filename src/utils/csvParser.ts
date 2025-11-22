import type { Accessory } from '../types';

export const processCSV = (csvText: string): Omit<Accessory, 'id' | 'owned'>[] => {
  // Split the CSV into lines
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  
  // Extract headers (first line)
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Process data rows
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const accessory: any = {};
    
    headers.forEach((header, index) => {
      // Convert header to lowercase and replace spaces with hyphens for consistency
      const cleanHeader = header.toLowerCase().replace(/\s+/g, '');
      
      // Map CSV columns to our Accessory type
      switch (cleanHeader) {
        case 'name':
          accessory.name = values[index]?.trim() || '';
          break;
        case 'rarity':
          const rarity = values[index]?.trim().toUpperCase() as any;
          accessory.rarity = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC', 'SPECIAL', 'VERY_SPECIAL'].includes(rarity) 
            ? rarity 
            : 'COMMON';
          break;
        case 'source':
          accessory.source = values[index]?.trim() || 'Unknown';
          break;
        case 'details':
          accessory.details = values[index]?.trim() || '';
          break;
        case 'wiki_page':
          accessory.wiki_page = values[index]?.trim() || '';
          break;
        case 'image_url':
          accessory.image_url = values[index]?.trim() || '';
          break;
      }
    });
    
    return accessory as Omit<Accessory, 'id' | 'owned'>;
  });
};

// Helper function to handle CSV line parsing with quoted values
const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else if (char !== '\r') { // Skip carriage return
      current += char;
    }
  }
  
  // Add the last value
  values.push(current);
  
  return values;
};
