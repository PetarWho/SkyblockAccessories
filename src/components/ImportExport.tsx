import { useState } from 'react';
import { DocumentArrowDownIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import type { Accessory } from '../types';

interface ImportExportProps {
  accessories: Accessory[];
  onImport: (data: string) => void;
  className?: string;
}

export default function ImportExport({ accessories, onImport, className = '' }: ImportExportProps) {
  const [importData, setImportData] = useState('');
  const [error, setError] = useState('');
  const [showImport, setShowImport] = useState(false);

  const handleExport = () => {
    const data = JSON.stringify(accessories, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skyblock-accessories.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      onImport(importData);
      setImportData('');
      setError('');
      setShowImport(false);
    } catch (e) {
      setError('Invalid import data. Please check the format and try again.');
      console.error('Import error:', e);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex space-x-4">
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          Export Data
        </button>
        
        <button
          onClick={() => setShowImport(!showImport)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
          {showImport ? 'Cancel Import' : 'Import Data'}
        </button>
      </div>

      {showImport && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <label htmlFor="import-data" className="block text-sm font-medium text-gray-700 mb-2">
            Paste your exported data here:
          </label>
          <textarea
            id="import-data"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            placeholder="Paste your exported JSON data here..."
          />
          
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleImport}
              disabled={!importData.trim()}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                importData.trim() ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
            >
              Confirm Import
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
