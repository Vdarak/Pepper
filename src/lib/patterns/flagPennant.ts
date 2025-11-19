import type { Candle, FlagPennantOverlay } from '@/types/chart';

export function detectFlagPennant(candles: Candle[]): FlagPennantOverlay | null {
  // Need at least 40 days of data
  if (candles.length < 40) {
    return null;
  }

  const lookbackDays = Math.min(40, candles.length);
  const recentCandles = candles.slice(-lookbackDays);

  // Search for a "flagpole": 8–15 consecutive days with strong uptrend
  for (let poleLength = 8; poleLength <= 15; poleLength++) {
    for (let i = 0; i <= recentCandles.length - poleLength - 5; i++) {
      const poleStart = i;
      const poleEnd = i + poleLength - 1;
      const poleCandles = recentCandles.slice(poleStart, poleEnd + 1);

      const poleStartPrice = poleCandles[0].close;
      const poleEndPrice = poleCandles[poleCandles.length - 1].close;
      const poleGainPct = ((poleEndPrice - poleStartPrice) / poleStartPrice) * 100;

      // Check if pole has 15-25% gain
      if (poleGainPct < 15 || poleGainPct > 25) {
        continue;
      }

      // Check for mostly consecutive up days
      let upDays = 0;
      for (let j = 1; j < poleCandles.length; j++) {
        if (poleCandles[j].close > poleCandles[j - 1].close) {
          upDays++;
        }
      }
      if (upDays < poleLength * 0.6) {
        continue; // Not enough up days
      }

      // Check flag region (5-20 days after pole)
      const flagStart = poleEnd + 1;
      const maxFlagLength = Math.min(20, recentCandles.length - flagStart);

      if (maxFlagLength < 5) {
        continue;
      }

      for (let flagLength = 5; flagLength <= maxFlagLength; flagLength++) {
        const flagEnd = flagStart + flagLength - 1;
        const flagCandles = recentCandles.slice(flagStart, flagEnd + 1);

        const flagHigh = Math.max(...flagCandles.map(c => c.high));
        const flagLow = Math.min(...flagCandles.map(c => c.low));
        const flagRange = flagHigh - flagLow;
        const poleHeight = poleEndPrice - poleStartPrice;

        // Check if flag range is within 30-50% of pole height
        const flagRangePct = (flagRange / poleHeight) * 100;
        if (flagRangePct < 30 || flagRangePct > 50) {
          continue;
        }

        // Fit trend lines (simplified: first and last highs/lows)
        const firstHigh = flagCandles[0].high;
        const lastHigh = flagCandles[flagCandles.length - 1].high;
        const firstLow = flagCandles[0].low;
        const lastLow = flagCandles[flagCandles.length - 1].low;

        const upperTrendLine = [
          { index: candles.length - lookbackDays + flagStart, price: firstHigh },
          { index: candles.length - lookbackDays + flagEnd, price: lastHigh },
        ];

        const lowerTrendLine = [
          { index: candles.length - lookbackDays + flagStart, price: firstLow },
          { index: candles.length - lookbackDays + flagEnd, price: lastLow },
        ];

        return {
          type: 'flag_pennant',
          poleStartIndex: candles.length - lookbackDays + poleStart,
          poleEndIndex: candles.length - lookbackDays + poleEnd,
          poleHeightPct: poleGainPct,
          upperTrendLine: upperTrendLine,
          lowerTrendLine: lowerTrendLine,
        };
      }
    }
  }

  return null;
}
