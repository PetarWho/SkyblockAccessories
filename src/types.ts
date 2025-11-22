export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC' | 'SPECIAL' | 'VERY_SPECIAL';

export interface Accessory {
  id: string;
  name: string;
  rarity: Rarity;
  source: string;
  details: string;
  wiki_page: string;
  image_url: string;
  owned: boolean;
}

export interface Filters {
  search: string;
  rarity: Rarity | '';
  source: string;
}
