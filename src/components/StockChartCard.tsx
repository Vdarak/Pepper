'use client';

import { useEffect, useState } from 'react';
import { TVLiteChart } from './TVLiteChart';
import type { Candle, PatternOverlay } from '@/types/chart';

type Props = {
  symbol: string;
  name: string;
  marketCap: number;
  industry: string;
  rsRating: number;
  overlay: PatternOverlay;
};

export function StockChartCard({ symbol, name, marketCap, industry, rsRating, overlay }: Props) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCandles() {
      try {
        const response = await fetch(`/api/candles/${symbol}`);
        if (!response.ok) {
          throw new Error('Failed to fetch candles');
        }
        const data = await response.json();
        setCandles(data.candles || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch candles');
      } finally {
        setLoading(false);
      }
    }

    fetchCandles();
  }, [symbol]);

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">{symbol}</h3>
            <p className="text-sm text-gray-600">{name}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-green-600">RS: {rsRating}</div>
          </div>
        </div>
        <div className="mt-2 flex gap-4 text-xs text-gray-600">
          <span>{industry}</span>
          <span>{formatMarketCap(marketCap)}</span>
        </div>
      </div>

      {loading && <div className="h-[320px] flex items-center justify-center text-gray-500">Loading chart...</div>}
      {error && <div className="h-[320px] flex items-center justify-center text-red-500">Error: {error}</div>}
      {!loading && !error && candles.length > 0 && (
        <TVLiteChart candles={candles} overlays={[overlay]} />
      )}
      {!loading && !error && candles.length === 0 && (
        <div className="h-[320px] flex items-center justify-center text-gray-500">No data available</div>
      )}
    </div>
  );
}
