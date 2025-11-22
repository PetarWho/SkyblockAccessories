import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Rarity } from '../types';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  rarityFilter: string;
  onRarityChange: (value: string) => void;
  sourceFilter: string;
  onSourceChange: (value: string) => void;
  onResetFilters: () => void;
  availableSources: string[];
}

const RARITIES: Rarity[] = [
  'COMMON',
  'UNCOMMON',
  'RARE',
  'EPIC',
  'LEGENDARY',
  'MYTHIC',
  'SPECIAL',
  'VERY_SPECIAL',
];

export default function FilterBar({
  search,
  onSearchChange,
  rarityFilter,
  onRarityChange,
  sourceFilter,
  onSourceChange,
  onResetFilters,
  availableSources,
}: FilterBarProps) {
  const hasActiveFilters = search || rarityFilter || sourceFilter;

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search accessories..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Rarity Filter */}
        <div>
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={rarityFilter}
            onChange={(e) => onRarityChange(e.target.value)}
          >
            <option value="">All Rarities</option>
            {RARITIES.map((rarity) => (
              <option key={rarity} value={rarity}>
                {rarity.charAt(0) + rarity.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Source Filter */}
        <div>
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={sourceFilter}
            onChange={(e) => onSourceChange(e.target.value)}
          >
            <option value="">All Sources</option>
            {Array.from(new Set(availableSources)).map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filters Button */}
        <div>
          <button
            onClick={onResetFilters}
            disabled={!hasActiveFilters}
            className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              hasActiveFilters
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-gray-300 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}
