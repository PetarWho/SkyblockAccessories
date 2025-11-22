import { useState, useEffect, useMemo } from 'react';
import {
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { processCSV } from '@/utils/csvParser';
import { saveAccessories, loadAccessories } from '@/utils/storage';
import type { Accessory, Rarity } from './types';
import HypixelLogo from "./assets/hypixel_logo.png" 

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [accessoriesData, setAccessoriesData] = useState<Accessory[]>([]);
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<Rarity | ''>('');
  const [selectedSource, setSelectedSource] = useState('');
  const [ownedCount, setOwnedCount] = useState(0);
  const [showImport, setShowImport] = useState(false);
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'not-owned' | 'owned'>('all');

  // Load data from CSV
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/accessories.csv');
        const csvText = await response.text();
        const parsedData = processCSV(csvText);

        const accessoriesWithId = parsedData.map((item, index) => ({
          ...item,
          id: `item-${index}`,
          owned: false,
        }));

        // Load saved state from localStorage and merge with default data
        const savedAccessories = loadAccessories(accessoriesWithId);

        const sources = [...new Set(savedAccessories.map((item) => item.source))].sort();

        setAccessoriesData(savedAccessories);
        setAvailableSources(sources);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter accessories based on search, filters, and active tab
  const filteredAccessories = useMemo(() => {
    let filtered = accessoriesData.filter((accessory) => {
      const matchesSearch =
        accessory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accessory.details.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRarity = !selectedRarity || accessory.rarity === selectedRarity;
      const matchesSource = !selectedSource || accessory.source === selectedSource;

      return matchesSearch && matchesRarity && matchesSource;
    });

    // Apply tab filtering
    if (activeTab === 'owned') {
      filtered = filtered.filter(item => item.owned);
    } else if (activeTab === 'not-owned') {
      filtered = filtered.filter(item => !item.owned);
    }

    return filtered;
  }, [accessoriesData, searchTerm, selectedRarity, selectedSource, activeTab]);

  // Sort accessories by rarity and name
  const sortedAccessories = useMemo(() => {
    const rarityOrder = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC', 'SPECIAL', 'VERY_SPECIAL'];

    // clone array to avoid mutating original
    return [...filteredAccessories].sort((a, b) => {
      // If in "all" tab, unowned items first, otherwise sort by rarity and name
      if (activeTab === 'all' && a.owned !== b.owned) {
        return a.owned ? 1 : -1;
      }
      // Then by rarity
      const aRarityIndex = rarityOrder.indexOf(a.rarity);
      const bRarityIndex = rarityOrder.indexOf(b.rarity);
      if (aRarityIndex !== bRarityIndex) {
        return aRarityIndex - bRarityIndex;
      }
      // Finally by name
      return a.name.localeCompare(b.name);
    });
  }, [filteredAccessories, activeTab]);

  // Toggle owned status
  const toggleOwned = (id: string) => {
    setAccessoriesData((prev) => prev.map((item) => (item.id === id ? { ...item, owned: !item.owned } : item)));
  };

  // Count owned items
  useEffect(() => {
    const owned = accessoriesData.filter((item) => item.owned).length;
    setOwnedCount(owned);
  }, [accessoriesData]);

  // Save to localStorage whenever accessories change
  useEffect(() => {
    if (accessoriesData.length > 0) {
      saveAccessories(accessoriesData);
    }
  }, [accessoriesData]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setImportFile(file);
    } else {
      alert('Please select a valid JSON file');
      setImportFile(null);
    }
  };

  // Read file content
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsText(file);
    });
  };

  // Handle import with file only
  const handleImport = async () => {
    try {
      if (!importFile) {
        alert('Please select a JSON file to import');
        return;
      }

      const jsonData = await readFileContent(importFile);
      const importedData = JSON.parse(jsonData);
      
      if (Array.isArray(importedData)) {
        setAccessoriesData((prev) =>
          prev.map((item) => {
            const importedItem = importedData.find((i: any) => i.id === item.id);
            return importedItem ? { ...item, owned: importedItem.owned } : item;
          })
        );
        setShowImport(false);
        setImportFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Invalid import data');
    }
  };

  // Handle export
  const handleExport = () => {
    const dataToExport = accessoriesData.filter((item) => item.owned).map(({ id, name, owned }) => ({ id, name, owned }));

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'skyblock-accessories.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get color class based on rarity (stronger, more vibrant badges)
  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case 'COMMON':
        return 'bg-slate-700/40 text-slate-200 ring-1 ring-slate-700';
      case 'UNCOMMON':
        return 'bg-emerald-800/30 text-emerald-300 ring-1 ring-emerald-700';
      case 'RARE':
        return 'bg-blue-800/30 text-blue-300 ring-1 ring-blue-700';
      case 'EPIC':
        return 'bg-purple-800/30 text-purple-300 ring-1 ring-purple-700';
      case 'LEGENDARY':
        return 'bg-amber-800/30 text-amber-300 ring-1 ring-amber-700';
      case 'MYTHIC':
        return 'bg-pink-800/30 text-pink-300 ring-1 ring-pink-700';
      case 'SPECIAL':
      case 'VERY_SPECIAL':
        return 'bg-indigo-800/30 text-indigo-300 ring-1 ring-indigo-700';
      default:
        return 'bg-slate-700/40 text-slate-200 ring-1 ring-slate-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-violet-400/80 border-b-4 border-slate-700 mx-auto" />
          <p className="mt-4 text-lg font-semibold text-slate-300">Loading accessories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full bg-slate-950/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col items-center text-center gap-2">
          <h1 className="text-4xl font-bold text-center">Skyblock Accessories Tracker</h1>
          <p className="text-center text-gray-400">
            Track and manage your Hypixel Skyblock accessory collection
          </p>
        </div>
      </header>

      {/* Mobile Action Bar - Mobile only */}
      <div className="lg:hidden w-full bg-slate-900/50 backdrop-blur-sm border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Progress Badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-1.5 flex-shrink-0">
              <span className="text-sm font-semibold text-white">{ownedCount}</span>
              <span className="text-slate-400 text-xs"> / {accessoriesData.length}</span>
              <span className="text-slate-500 ml-1 text-xs">
                ({Math.round((ownedCount / (accessoriesData.length || 1)) * 100)}%)
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <button 
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md text-xs backdrop-blur-md border border-white/20 transition-all duration-200"
              >
                <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>

              <button 
                onClick={() => setShowImport(!showImport)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md text-xs backdrop-blur-md border border-white/20 transition-all duration-200"
              >
                {showImport ? <XMarkIcon className="h-3.5 w-3.5" /> : <ArrowUpTrayIcon className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{showImport ? 'Close' : 'Import'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons - Desktop only */}
      <div className="hidden lg:flex fixed top-8 right-8 flex-col items-end gap-3 z-50">
        {/* Progress Badge */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 shadow-lg">
          <span className="text-lg font-semibold text-white">{ownedCount}</span>
          <span className="text-slate-400"> / {accessoriesData.length}</span>
          <span className="text-slate-500 ml-2 text-sm">
            ({Math.round((ownedCount / (accessoriesData.length || 1)) * 100)}%)
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm backdrop-blur-md border border-white/20 transition-all duration-200"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export
          </button>

          <button 
            onClick={() => setShowImport(!showImport)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm backdrop-blur-md border border-white/20 transition-all duration-200"
          >
            {showImport ? <XMarkIcon className="h-4 w-4" /> : <ArrowUpTrayIcon className="h-4 w-4" />}
            {showImport ? 'Close' : 'Import'}
          </button>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 z-40"
          aria-label="Scroll to top"
        >
          <ChevronUpIcon className="h-6 w-6" />
        </button>
      )}

      {/* Main centered container */}
      <main className="w-full flex justify-center py-10 px-4">
        <div className="w-full max-w-3xl space-y-8">

          {/* Import Box */}
          {showImport && (
            <section className="p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="p-2 rounded-lg bg-amber-900/10 ring-1 ring-amber-700/10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-amber-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Import Accessory Data</h3>
                  <p className="text-sm text-amber-200/80 mb-4">Upload a JSON file to restore your accessory collection.</p>
                  
                  {/* File Upload */}
                  <div className="mb-4">
                    <label htmlFor="file-input" className="block text-sm font-medium text-slate-300 mb-2">
                      Select JSON File
                    </label>
                    <input
                      id="file-input"
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileSelect}
                      className="w-full px-3 py-2 bg-slate-900/30 border border-white/10 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-700 cursor-pointer"
                    />
                    {importFile && (
                      <p className="mt-2 text-sm text-green-400 flex items-center gap-2">
                        <CheckBadgeIcon className="h-4 w-4" />
                        Selected: {importFile.name}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={handleImport}
                      disabled={!importFile}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
                    >
                      Import Collection
                    </button>
                    <button
                      onClick={() => { 
                        setShowImport(false); 
                        setImportFile(null);
                        const fileInput = document.getElementById('file-input') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Filters */}
          <section className="p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-4">
            <div className="p-6 bg-white/5 rounded-xl border border-white/10 space-y-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                <h2 className="text-2xl font-semibold">Filters</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Search */}
                <div className="relative">
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search accessories..."
                    className="w-full px-3 py-2 pl-10 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {/* Rarity */}
                <div className="relative">
                  <select
                    value={selectedRarity}
                    onChange={(e) => setSelectedRarity(e.target.value as any)}
                    className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All rarities</option>
                    <option value="COMMON">Common</option>
                    <option value="UNCOMMON">Uncommon</option>
                    <option value="RARE">Rare</option>
                    <option value="EPIC">Epic</option>
                    <option value="LEGENDARY">Legendary</option>
                    <option value="MYTHIC">Mythic</option>
                    <option value="SPECIAL">Special</option>
                    <option value="VERY_SPECIAL">Very Special</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {/* Source */}
                <div className="relative">
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All sources</option>
                    {availableSources.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedRarity('');
                    setSelectedSource('');
                  }}
                  className="w-full mt-2 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 font-medium transition"
                >
                  Clear filters
                </button>
              </div>
            </div>
          </section>

          {/* Accessories */}
          <section className="p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Accessories</h2>
                <span className="text-sm text-slate-400">
                  {sortedAccessories.length} items
                </span>
              </div>

              {/* Tab Bar */}
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeTab === 'all'
                      ? 'text-violet-400 border-violet-400'
                      : 'text-slate-400 border-transparent hover:text-slate-300'
                  }`}
                >
                  All ({accessoriesData.length})
                </button>
                <button
                  onClick={() => setActiveTab('not-owned')}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeTab === 'not-owned'
                      ? 'text-violet-400 border-violet-400'
                      : 'text-slate-400 border-transparent hover:text-slate-300'
                  }`}
                >
                  Not Owned ({accessoriesData.filter(item => !item.owned).length})
                </button>
                <button
                  onClick={() => setActiveTab('owned')}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeTab === 'owned'
                      ? 'text-violet-400 border-violet-400'
                      : 'text-slate-400 border-transparent hover:text-slate-300'
                  }`}
                >
                  Owned ({ownedCount})
                </button>
              </div>

              <div className="space-y-2">
                {sortedAccessories.map(item => (
                  <div
                    key={item.name}
                    className="flex justify-between items-center gap-[6px] p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer group"
                    onClick={() => setSelectedAccessory(item)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-8 h-8 object-contain bg-white/10 rounded p-1"
                          onError={(e) => {
                            // If image fails, use Hypixel logo as fallback
                            e.currentTarget.src = HypixelLogo;
                            e.currentTarget.onerror = () => {
                              // Final fallback - hide image
                              e.currentTarget.style.display = 'none';
                            };
                          }}
                        />
                      ) : (
                        <img 
                          src={HypixelLogo}
                          alt={item.name}
                          className="w-8 h-8 object-contain bg-white/10 rounded p-1"
                          onError={(e) => {
                            // If logo fails, hide image
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-white group-hover:text-violet-300 transition-colors">{item.name}</p>
                        <p className="text-sm text-gray-400">{item.source}</p>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOwned(item.id);
                      }}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                        item.owned 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg hover:shadow-violet-500/25'
                      }`}
                    >
                      {item.owned ? (
                        <span className="flex items-center gap-2">
                          <CheckBadgeIcon className="h-5 w-5" />
                          Owned
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-current opacity-80"></span>
                          Add
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-600 text-sm">
        © 2025 Skyblock Accessories Tracker. Not affiliated with Hypixel.
      </footer>

      {/* Accessory Details Modal */}
      {selectedAccessory && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAccessory(null)}
        >
          <div 
            className="bg-slate-900/95 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {selectedAccessory.image_url ? (
                    <img 
                      src={selectedAccessory.image_url} 
                      alt={selectedAccessory.name}
                      className="w-16 h-16 object-contain bg-white/10 rounded-lg p-2"
                      onError={(e) => {
                        // If image fails, use Hypixel logo as fallback
                        e.currentTarget.src = HypixelLogo;
                        e.currentTarget.onerror = () => {
                          // Final fallback - hide image
                          e.currentTarget.style.display = 'none';
                        };
                      }}
                    />
                  ) : (
                    <img 
                      src={HypixelLogo}
                      alt={selectedAccessory.name}
                      className="w-16 h-16 object-contain bg-white/10 rounded-lg p-2"
                      onError={(e) => {
                        // If logo fails, hide image
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedAccessory.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRarityColor(selectedAccessory.rarity)}`}>
                        {selectedAccessory.rarity
                          .split('_')
                          .map((w: string) => w.charAt(0) + w.slice(1).toLowerCase())
                          .join(' ')}
                      </span>
                      <span className="text-sm text-gray-400">{selectedAccessory.source}</span>
                      {selectedAccessory.wiki_page && (
                        <a
                          href={selectedAccessory.wiki_page}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Wiki
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAccessory(null)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Information Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Source</h4>
                  <p className="text-white font-semibold">{selectedAccessory.source}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Unlocked from</h4>
                  <p className="text-white font-semibold">{selectedAccessory.details}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Rarity</h4>
                  <p className="text-white font-semibold">
                    {selectedAccessory.rarity
                      .split('_')
                      .map((w: string) => w.charAt(0) + w.slice(1).toLowerCase())
                      .join(' ')}
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Collection Status</h4>
                  <p className="text-white font-semibold">
                    {selectedAccessory.owned ? 'Owned' : 'Not Owned'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10">
              <div className="flex gap-3">
                {selectedAccessory.owned ? (
                  <button
                    onClick={() => {
                      toggleOwned(selectedAccessory.id);
                      setSelectedAccessory(null);
                    }}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <XMarkIcon className="h-5 w-5" />
                      Remove from Owned
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      toggleOwned(selectedAccessory.id);
                      setSelectedAccessory(null);
                    }}
                    className="flex-1 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-violet-500/25"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <CheckBadgeIcon className="h-5 w-5" />
                      Add to Owned
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedAccessory(null)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
