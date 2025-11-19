'use client';

import { useEffect, useState } from 'react';
import { ScannerSidebar } from '@/components/ScannerSidebar';
import { ScannerTable } from '@/components/ScannerTable';
import { StockChartCard } from '@/components/StockChartCard';
import type { PatternOverlay } from '@/types/chart';

type ScanResult = {
  symbol: string;
  name: string;
  marketCap: number;
  industry: string;
  rsRating: number;
  overlay: PatternOverlay;
};

export default function HorizontalResistancePage() {
  const [results, setResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'charts'>('charts');

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await fetch('/api/scanners/horizontal-resistance');
        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }
        const data = await response.json();
        setResults(data.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch results');
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, []);

  return (
    <div className="flex min-h-screen">
      <ScannerSidebar />
      <div className="flex-1 p-8 bg-gray-50">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Horizontal Resistance Scanner</h1>
          <p className="text-gray-600">
            Stocks approaching key resistance levels with 3+ touches
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setView('charts')}
            className={`px-4 py-2 rounded-md ${
              view === 'charts'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Chart View
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-md ${
              view === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            List View
          </button>
        </div>

        {loading && <div className="text-center py-8 text-gray-500">Loading...</div>}
        {error && <div className="text-center py-8 text-red-500">Error: {error}</div>}

        {!loading && !error && view === 'list' && <ScannerTable results={results} />}

        {!loading && !error && view === 'charts' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {results.map(result => (
              <StockChartCard key={result.symbol} {...result} />
            ))}
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="text-center py-8 text-gray-500">No patterns detected</div>
        )}
      </div>
    </div>
  );
}
