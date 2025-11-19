'use client';

import { useEffect, useRef } from 'react';
import { 
  createChart, 
  IChartApi, 
  LineStyle, 
  LineSeries,
  CandlestickSeries,
  Time
} from 'lightweight-charts';
import type { Candle, PatternOverlay, HorizontalResistanceOverlay, VCPOverlay, FlagPennantOverlay } from '@/types/chart';

type Props = {
  candles: Candle[];
  overlays: PatternOverlay[];
};

function drawHorizontalResistance(
  chart: IChartApi,
  overlay: HorizontalResistanceOverlay,
  candles: Candle[]
) {
  const lineSeries = chart.addSeries(LineSeries, {
    color: '#ff4b5c',
    lineWidth: 2,
    lineStyle: LineStyle.Dashed,
  });

  const data = candles.map(c => ({
    time: c.time as Time,
    value: overlay.resistanceLevel,
  }));

  lineSeries.setData(data);
}

function drawVCP(chart: IChartApi, overlay: VCPOverlay, candles: Candle[]) {
  // Draw pivot price line
  const pivotSeries = chart.addSeries(LineSeries, {
    color: '#2b8a3e',
    lineWidth: 3,
    lineStyle: LineStyle.Solid,
  });

  const data = candles.map(c => ({
    time: c.time as Time,
    value: overlay.pivotPrice,
  }));

  pivotSeries.setData(data);
}

function drawFlagPennant(
  chart: IChartApi,
  overlay: FlagPennantOverlay,
  candles: Candle[]
) {
  const upper = chart.addSeries(LineSeries, { color: '#2b8a3e', lineWidth: 2 });
  const lower = chart.addSeries(LineSeries, { color: '#2b8a3e', lineWidth: 2 });

  const upperData = overlay.upperTrendLine.map(p => ({
    time: (candles[p.index]?.time || candles[candles.length - 1].time) as Time,
    value: p.price,
  }));

  const lowerData = overlay.lowerTrendLine.map(p => ({
    time: (candles[p.index]?.time || candles[candles.length - 1].time) as Time,
    value: p.price,
  }));

  upper.setData(upperData);
  lower.setData(lowerData);
}

export function TVLiteChart({ candles, overlays }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || candles.length === 0) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 320,
      layout: { background: { color: '#ffffff' }, textColor: '#333' },
      grid: {
        vertLines: { color: '#f0f3fa' },
        horzLines: { color: '#f0f3fa' },
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {});
    candleSeries.setData(
      candles.map(c => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    // Draw overlays
    overlays.forEach(overlay => {
      if (overlay.type === 'horizontal_resistance') {
        drawHorizontalResistance(chart, overlay, candles);
      } else if (overlay.type === 'vcp') {
        drawVCP(chart, overlay, candles);
      } else if (overlay.type === 'flag_pennant') {
        drawFlagPennant(chart, overlay, candles);
      }
    });

    const handleResize = () => {
      if (!containerRef.current) return;
      chart.applyOptions({ width: containerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [candles, overlays]);

  return <div ref={containerRef} className="w-full h-[320px]" />;
}
