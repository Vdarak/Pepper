import type { Candle, VCPOverlay } from '@/types/chart';

function computeSMA(candles: Candle[], period: number, index: number): number {
  if (index < period - 1) return 0;
  let sum = 0;
  for (let i = index - period + 1; i <= index; i++) {
    sum += candles[i].close;
  }
  return sum / period;
}

export function detectVCP(candles: Candle[]): VCPOverlay | null {
  // Need at least 200 days of data
  if (candles.length < 200) {
    return null;
  }

  const lastIndex = candles.length - 1;

  // Compute 50, 150, 200-day moving averages
  const ma50 = computeSMA(candles, 50, lastIndex);
  const ma150 = computeSMA(candles, 150, lastIndex);
  const ma200 = computeSMA(candles, 200, lastIndex);

  const currentPrice = candles[lastIndex].close;

  // Requirements: price > 50 MA, 150 MA > 200 MA
  if (currentPrice <= ma50 || ma150 <= ma200) {
    return null;
  }

  // Check if 150 MA and 200 MA are rising
  const ma150_prev = computeSMA(candles, 150, lastIndex - 20);
  const ma200_prev = computeSMA(candles, 200, lastIndex - 20);

  if (ma150 <= ma150_prev || ma200 <= ma200_prev) {
    return null;
  }

  // Identify 2–5 consolidation "bases" over the last 6–9 months
  // Simplified: Look for 20-day windows where price trades in tight range
  const lookbackDays = Math.min(180, candles.length - 20); // 6-9 months
  const windowSize = 20;
  const bases: { startIndex: number; endIndex: number; rangePct: number }[] = [];

  for (let i = lastIndex - lookbackDays; i < lastIndex - windowSize; i += 10) {
    const window = candles.slice(i, i + windowSize);
    const maxHigh = Math.max(...window.map(c => c.high));
    const minLow = Math.min(...window.map(c => c.low));
    const rangePct = ((maxHigh - minLow) / minLow) * 100;

    // Consider it a base if range is < 25%
    if (rangePct < 25 && rangePct > 0) {
      bases.push({
        startIndex: i,
        endIndex: i + windowSize - 1,
        rangePct: rangePct,
      });
    }
  }

  // Need at least 2 bases
  if (bases.length < 2) {
    return null;
  }

  // Sort bases by startIndex
  bases.sort((a, b) => a.startIndex - b.startIndex);

  // Check if each subsequent base has smaller rangePct
  let isContractingVolatility = true;
  for (let i = 1; i < bases.length; i++) {
    if (bases[i].rangePct >= bases[i - 1].rangePct) {
      isContractingVolatility = false;
      break;
    }
  }

  if (!isContractingVolatility) {
    return null;
  }

  // Pivot price = high of last base
  const lastBase = bases[bases.length - 1];
  const pivotPrice = Math.max(
    ...candles.slice(lastBase.startIndex, lastBase.endIndex + 1).map(c => c.high)
  );

  return {
    type: 'vcp',
    pivotPrice: pivotPrice,
    bases: bases.slice(0, 5), // Return up to 5 bases
  };
}
