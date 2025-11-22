import { useState, useEffect, useMemo } from 'react';
import type { Accessory, Filters } from '../types';
import { loadAccessories, saveAccessories } from '../utils/storage';

const useAccessories = (initialAccessories: Accessory[]) => {
  const [accessories, setAccessories] = useState<Accessory[]>(() => 
    loadAccessories(initialAccessories)
  );
  const [filters, setFilters] = useState<Filters>({
    search: '',
    rarity: '',
    source: ''
  });

  // Save to localStorage whenever accessories change
  useEffect(() => {
    saveAccessories(accessories);
  }, [accessories]);

  const toggleOwned = (id: string) => {
    setAccessories(prev => 
      prev.map(acc => 
        acc.id === id ? { ...acc, owned: !acc.owned } : acc
      )
    );
  };

  const filteredAccessories = useMemo(() => {
    return accessories
      .filter(acc => {
        const matchesSearch = acc.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                            acc.details.toLowerCase().includes(filters.search.toLowerCase());
        const matchesRarity = !filters.rarity || acc.rarity === filters.rarity;
        const matchesSource = !filters.source || 
                            acc.source.toLowerCase().includes(filters.source.toLowerCase());
        
        return matchesSearch && matchesRarity && matchesSource;
      })
      .sort((a, b) => {
        // Sort by owned status (unowned first), then by name
        if (a.owned !== b.owned) {
          return a.owned ? 1 : -1;
        }
        return a.name.localeCompare(b.name);
      });
  }, [accessories, filters]);

  const updateFilters = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      rarity: '',
      source: ''
    });
  };

  return {
    accessories: filteredAccessories,
    filters,
    updateFilters,
    resetFilters,
    toggleOwned,
    totalCount: accessories.length,
    ownedCount: accessories.filter(a => a.owned).length
  };
};

export default useAccessories;
