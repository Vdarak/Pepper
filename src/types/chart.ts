export type Candle = {
  time: number; // unix timestamp (seconds)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type HorizontalResistanceOverlay = {
  type: 'horizontal_resistance';
  resistanceLevel: number;
  touches: number;
  distancePct: number;
};

export type VCPOverlay = {
  type: 'vcp';
  pivotPrice: number;
  bases: {
    startIndex: number;
    endIndex: number;
    rangePct: number;
  }[];
};

export type FlagPennantOverlay = {
  type: 'flag_pennant';
  poleStartIndex: number;
  poleEndIndex: number;
  poleHeightPct: number;
  upperTrendLine: { index: number; price: number }[];
  lowerTrendLine: { index: number; price: number }[];
};

export type PatternOverlay =
  | HorizontalResistanceOverlay
  | VCPOverlay
  | FlagPennantOverlay;
