-- ChartMaze US Database Schema

-- List of tradable US symbols
CREATE TABLE IF NOT EXISTS stocks (
  symbol text PRIMARY KEY,
  name text,
  exchange text,
  sector text,
  industry text,
  market_cap bigint,
  created_at timestamptz DEFAULT now()
);

-- Daily OHLCV candles
CREATE TABLE IF NOT EXISTS stock_prices (
  id bigserial PRIMARY KEY,
  symbol text REFERENCES stocks(symbol),
  date date NOT NULL,
  open numeric,
  high numeric,
  low numeric,
  close numeric,
  volume bigint,
  UNIQUE(symbol, date)
);

-- Scanner results for each pattern
CREATE TABLE IF NOT EXISTS scanner_results (
  id bigserial PRIMARY KEY,
  symbol text REFERENCES stocks(symbol),
  pattern_type text NOT NULL,               -- 'horizontal_resistance' | 'vcp' | 'flag_pennant'
  detected_at timestamptz DEFAULT now(),
  score numeric,                            -- optional confidence score
  meta jsonb                                -- pattern-specific data (levels, bases, lines)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol_date ON stock_prices(symbol, date DESC);
CREATE INDEX IF NOT EXISTS idx_scanner_results_pattern_date ON scanner_results(pattern_type, detected_at DESC);
