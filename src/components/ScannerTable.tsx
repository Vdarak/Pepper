'use client';

import type { PatternOverlay } from '@/types/chart';

type ScanResult = {
  symbol: string;
  name: string;
  marketCap: number;
  industry: string;
  rsRating: number;
  overlay: PatternOverlay;
};

type Props = {
  results: ScanResult[];
};

export function ScannerTable({ results }: Props) {
  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Symbol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              RS Rating
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Industry
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Market Cap
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pattern Details
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {results.map(result => (
            <tr key={result.symbol} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{result.symbol}</div>
                <div className="text-sm text-gray-500">{result.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-semibold text-green-600">{result.rsRating}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {result.industry}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {formatMarketCap(result.marketCap)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {result.overlay.type === 'horizontal_resistance' && (
                  <span>Level: ${result.overlay.resistanceLevel.toFixed(2)}, Touches: {result.overlay.touches}</span>
                )}
                {result.overlay.type === 'vcp' && (
                  <span>Pivot: ${result.overlay.pivotPrice.toFixed(2)}, Bases: {result.overlay.bases.length}</span>
                )}
                {result.overlay.type === 'flag_pennant' && (
                  <span>Pole: {result.overlay.poleHeightPct.toFixed(1)}%</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {results.length === 0 && (
        <div className="text-center py-8 text-gray-500">No patterns detected</div>
      )}
    </div>
  );
}
