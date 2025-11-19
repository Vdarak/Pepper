import { createSupabaseServerClient } from './supabaseServer';
import { detectHorizontalResistance } from './patterns/horizontalResistance';
import { detectVCP } from './patterns/vcp';
import { detectFlagPennant } from './patterns/flagPennant';
import type { Candle, PatternOverlay } from '@/types/chart';

export async function scanSymbol(symbol: string): Promise<{
  symbol: string;
  patterns: { type: string; overlay: PatternOverlay }[];
}> {
  const supabase = createSupabaseServerClient();

  // Load candles from database (last 365 days)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const { data: priceData, error } = await supabase
    .from('stock_prices')
    .select('date, open, high, low, close, volume')
    .eq('symbol', symbol)
    .gte('date', oneYearAgo.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error || !priceData || priceData.length === 0) {
    return { symbol, patterns: [] };
  }

  // Convert to Candle format
  const candles: Candle[] = priceData.map(row => ({
    time: new Date(row.date).getTime() / 1000, // Convert to unix timestamp
    open: parseFloat(String(row.open)),
    high: parseFloat(String(row.high)),
    low: parseFloat(String(row.low)),
    close: parseFloat(String(row.close)),
    volume: parseInt(String(row.volume), 10),
  }));

  const patterns: { type: string; overlay: PatternOverlay }[] = [];

  // Run all detectors
  const hrPattern = detectHorizontalResistance(candles);
  if (hrPattern) {
    patterns.push({ type: 'horizontal_resistance', overlay: hrPattern });

    // Store in database
    await supabase.from('scanner_results').upsert({
      symbol: symbol,
      pattern_type: 'horizontal_resistance',
      detected_at: new Date().toISOString(),
      score: hrPattern.touches,
      meta: hrPattern,
    });
  }

  const vcpPattern = detectVCP(candles);
  if (vcpPattern) {
    patterns.push({ type: 'vcp', overlay: vcpPattern });

    await supabase.from('scanner_results').upsert({
      symbol: symbol,
      pattern_type: 'vcp',
      detected_at: new Date().toISOString(),
      score: vcpPattern.bases.length,
      meta: vcpPattern,
    });
  }

  const flagPattern = detectFlagPennant(candles);
  if (flagPattern) {
    patterns.push({ type: 'flag_pennant', overlay: flagPattern });

    await supabase.from('scanner_results').upsert({
      symbol: symbol,
      pattern_type: 'flag_pennant',
      detected_at: new Date().toISOString(),
      score: flagPattern.poleHeightPct,
      meta: flagPattern,
    });
  }

  return { symbol, patterns };
}

export async function scanUniverse(
  patternType?: string,
  symbols?: string[]
): Promise<{ symbol: string; patterns: { type: string; overlay: PatternOverlay }[] }[]> {
  const results = [];
  const symbolsToScan = symbols || [];

  for (const symbol of symbolsToScan) {
    try {
      const result = await scanSymbol(symbol);
      if (patternType) {
        result.patterns = result.patterns.filter(p => p.type === patternType);
      }
      if (result.patterns.length > 0) {
        results.push(result);
      }
    } catch (error) {
      console.error(`Error scanning ${symbol}:`, error);
    }
  }

  return results;
}
