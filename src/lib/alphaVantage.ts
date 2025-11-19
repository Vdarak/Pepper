const BASE_URL = 'https://www.alphavantage.co/query';

export interface AlphaVantageCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function fetchDailyAdjusted(symbol: string): Promise<AlphaVantageCandle[]> {
  const url = new URL(BASE_URL);
  url.searchParams.set('function', 'TIME_SERIES_DAILY_ADJUSTED');
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('apikey', process.env.ALPHA_VANTAGE_KEY!);

  const res = await fetch(url.toString());
  const json = await res.json();

  // If rate limited, throw a specific error
  if (json['Note'] || json['Information']) {
    throw new Error('ALPHAVANTAGE_RATE_LIMIT');
  }

  // Transform into array of { time, open, high, low, close, volume }
  const timeSeries = json['Time Series (Daily)'];
  if (!timeSeries) {
    throw new Error('Invalid response from Alpha Vantage');
  }

  const candles: AlphaVantageCandle[] = [];
  for (const [date, data] of Object.entries(timeSeries)) {
    const dayData = data as Record<string, string>;
    candles.push({
      time: date,
      open: parseFloat(dayData['1. open']),
      high: parseFloat(dayData['2. high']),
      low: parseFloat(dayData['3. low']),
      close: parseFloat(dayData['4. close']),
      volume: parseInt(dayData['6. volume'], 10),
    });
  }

  // Sort by date ascending
  candles.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return candles;
}
