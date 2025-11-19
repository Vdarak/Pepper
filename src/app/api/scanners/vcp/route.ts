import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    // Get latest VCP results from last 2 days
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const { data, error } = await supabase
      .from('scanner_results')
      .select('symbol, detected_at, score, meta')
      .eq('pattern_type', 'vcp')
      .gte('detected_at', twoDaysAgo.toISOString())
      .order('detected_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get stock details
    const symbols = [...new Set(data?.map(r => r.symbol) || [])];
    const { data: stocksData } = await supabase
      .from('stocks')
      .select('symbol, name, market_cap, industry')
      .in('symbol', symbols);

    const stocksMap = new Map(stocksData?.map(s => [s.symbol, s]) || []);

    const results = data?.map(row => ({
      symbol: row.symbol,
      name: stocksMap.get(row.symbol)?.name || row.symbol,
      marketCap: stocksMap.get(row.symbol)?.market_cap || 0,
      industry: stocksMap.get(row.symbol)?.industry || 'Unknown',
      rsRating: 88, // Placeholder
      overlay: row.meta,
    })) || [];

    return NextResponse.json({
      pattern: 'vcp',
      updatedAt: new Date().toISOString(),
      results: results,
    });
  } catch (error) {
    console.error('Error fetching VCP results:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
