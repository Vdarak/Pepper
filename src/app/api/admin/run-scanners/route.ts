import { NextResponse } from 'next/server';
import { scanUniverse } from '@/lib/scannerEngine';
import { UNIVERSE } from '@/config/universe';

export async function POST() {
  try {
    const results = await scanUniverse(undefined, UNIVERSE);

    const summary = {
      totalSymbolsScanned: UNIVERSE.length,
      patternsFound: {
        horizontal_resistance: 0,
        vcp: 0,
        flag_pennant: 0,
      },
      results: results,
    };

    // Count patterns
    for (const result of results) {
      for (const pattern of result.patterns) {
        if (pattern.type === 'horizontal_resistance') {
          summary.patternsFound.horizontal_resistance++;
        } else if (pattern.type === 'vcp') {
          summary.patternsFound.vcp++;
        } else if (pattern.type === 'flag_pennant') {
          summary.patternsFound.flag_pennant++;
        }
      }
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error running scanners:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
