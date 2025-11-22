import { useMemo } from 'react';
import { 
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Accessory, Rarity } from '../types';

interface AccessoryTableProps {
  accessories: Accessory[];
  onToggleOwned: (id: string) => void;
}

const RARITY_COLORS: Record<Rarity, string> = {
  COMMON: 'text-gray-300',
  UNCOMMON: 'text-green-400',
  RARE: 'text-blue-400',
  EPIC: 'text-purple-400',
  LEGENDARY: 'text-yellow-400',
  MYTHIC: 'text-pink-500',
  SPECIAL: 'text-red-400',
  VERY_SPECIAL: 'text-red-500',
};

export default function AccessoryTable({ accessories, onToggleOwned }: AccessoryTableProps) {
  const columns = useMemo<ColumnDef<Accessory>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ getValue }) => (
          <div className="font-medium">
            {getValue<string>()}
          </div>
        ),
      },
      {
        header: 'Rarity',
        accessorKey: 'rarity',
        cell: ({ getValue }) => {
          const rarity = getValue<Rarity>();
          return (
            <span className={`font-semibold ${RARITY_COLORS[rarity]}`}>
              {rarity}
            </span>
          );
        },
      },
      {
        header: 'Source',
        accessorKey: 'source',
      },
      {
        header: 'Details',
        accessorKey: 'details',
      },
      {
        header: 'Owned',
        accessorKey: 'owned',
        cell: ({ row, getValue }) => (
          <button
            onClick={() => onToggleOwned(row.original.id)}
            className={`p-2 rounded-full ${
              getValue<boolean>() 
                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
            aria-label={getValue<boolean>() ? 'Mark as unowned' : 'Mark as owned'}
          >
            {getValue<boolean>() ? (
              <CheckIcon className="h-5 w-5" />
            ) : (
              <XMarkIcon className="h-5 w-5" />
            )}
          </button>
        ),
      },
    ],
    [onToggleOwned]
  );

  const table = useReactTable({
    data: accessories,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (accessories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No accessories found matching your filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map(row => (
            <tr 
              key={row.id}
              className={row.original.owned ? 'bg-gray-50' : ''}
            >
              {row.getVisibleCells().map(cell => (
                <td 
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
