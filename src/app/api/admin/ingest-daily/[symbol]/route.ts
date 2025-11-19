import { NextRequest, NextResponse } from 'next/server';
import { fetchDailyAdjusted } from '@/lib/alphaVantage';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type RouteContext = {
  params: Promise<{
    symbol: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { symbol } = await context.params;

  try {
    // Fetch data from Alpha Vantage
    const candles = await fetchDailyAdjusted(symbol.toUpperCase());

    if (!candles || candles.length === 0) {
      return NextResponse.json({ error: 'No data received' }, { status: 404 });
    }

    // Upsert into Supabase
    const supabase = createSupabaseServerClient();

    const rows = candles.map(c => ({
      symbol: symbol.toUpperCase(),
      date: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
    }));

    const { error } = await supabase.from('stock_prices').upsert(rows, {
      onConflict: 'symbol,date',
    });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      rowsWritten: rows.length,
    });
  } catch (error) {
    console.error('Error ingesting data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
