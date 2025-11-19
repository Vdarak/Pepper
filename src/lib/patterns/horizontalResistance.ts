import type { Candle, HorizontalResistanceOverlay } from '@/types/chart';

export function detectHorizontalResistance(
  candles: Candle[]
): HorizontalResistanceOverlay | null {
  // Focus on last 6 months of candles (approx 126 trading days)
  const lookbackDays = Math.min(126, candles.length);
  const recentCandles = candles.slice(-lookbackDays);

  if (recentCandles.length < 20) {
    return null; // Not enough data
  }

  // Identify swing highs: a candle whose high is greater than its neighbors
  const swingHighs: { index: number; price: number }[] = [];
  for (let i = 2; i < recentCandles.length - 2; i++) {
    const current = recentCandles[i];
    const prev1 = recentCandles[i - 1];
    const prev2 = recentCandles[i - 2];
    const next1 = recentCandles[i + 1];
    const next2 = recentCandles[i + 2];

    if (
      current.high > prev1.high &&
      current.high > prev2.high &&
      current.high > next1.high &&
      current.high > next2.high
    ) {
      swingHighs.push({ index: i, price: current.high });
    }
  }

  if (swingHighs.length < 3) {
    return null;
  }

  // Cluster these highs into price bands within ±2.5%
  const bands: { mean: number; prices: number[] }[] = [];
  const tolerance = 0.025; // 2.5%

  for (const swing of swingHighs) {
    let foundBand = false;
    for (const band of bands) {
      const diff = Math.abs(swing.price - band.mean) / band.mean;
      if (diff <= tolerance) {
        band.prices.push(swing.price);
        band.mean = band.prices.reduce((a, b) => a + b, 0) / band.prices.length;
        foundBand = true;
        break;
      }
    }
    if (!foundBand) {
      bands.push({ mean: swing.price, prices: [swing.price] });
    }
  }

  // Find bands with ≥3 touches
  const validBands = bands.filter(b => b.prices.length >= 3);

  if (validBands.length === 0) {
    return null;
  }

  // Check if current close is 0–5% below any of the valid bands
  const currentClose = recentCandles[recentCandles.length - 1].close;

  for (const band of validBands) {
    const distancePct = ((band.mean - currentClose) / currentClose) * 100;
    if (distancePct >= 0 && distancePct <= 5) {
      return {
        type: 'horizontal_resistance',
        resistanceLevel: band.mean,
        touches: band.prices.length,
        distancePct: distancePct,
      };
    }
  }

  return null;
}
