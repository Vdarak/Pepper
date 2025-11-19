import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type RouteContext = {
  params: Promise<{
    symbol: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { symbol } = await context.params;

  try {
    const supabase = createSupabaseServerClient();

    // Get last 180 days of candles
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data, error } = await supabase
      .from('stock_prices')
      .select('date, open, high, low, close, volume')
      .eq('symbol', symbol.toUpperCase())
      .gte('date', sixMonthsAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    // Convert to Candle format
    const candles = data.map(row => ({
      time: new Date(row.date).getTime() / 1000, // Unix timestamp in seconds
      open: parseFloat(String(row.open)),
      high: parseFloat(String(row.high)),
      low: parseFloat(String(row.low)),
      close: parseFloat(String(row.close)),
      volume: parseInt(String(row.volume), 10),
    }));

    return NextResponse.json({ symbol: symbol.toUpperCase(), candles });
  } catch (error) {
    console.error('Error fetching candles:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
