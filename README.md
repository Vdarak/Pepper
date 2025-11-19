# ChartMaze US - Stock Pattern Scanner MVP

An AI-powered stock pattern scanner for US markets built with Next.js, Supabase, and TradingView Lightweight Charts.

## Features

- **Pattern Detection:**
  - Horizontal Resistance: Identifies stocks approaching key resistance levels
  - VCP (Volatility Contraction Pattern): Detects Minervini-style tightening bases
  - Flags & Pennants: Finds continuation patterns with consolidation after strong moves

- **Interactive Charts:** TradingView Lightweight Charts with pattern overlays
- **Multiple Views:** Toggle between list and chart views
- **Real-time Data:** Integration with Alpha Vantage for market data
- **Scalable Backend:** Supabase (PostgreSQL) for data storage and queries

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Market Data:** Alpha Vantage API
- **Charts:** TradingView Lightweight Charts
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier)
- Alpha Vantage API key (free tier)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Vdarak/Pepper.git
cd Pepper
git checkout pepper
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
```
ALPHA_VANTAGE_KEY=your_alpha_vantage_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Set up Supabase database:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL from `src/supabase/schema.sql`

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── admin/              # Admin endpoints
│   │   │   ├── ingest-daily/   # Data ingestion
│   │   │   └── run-scanners/   # Scanner execution
│   │   ├── scanners/           # Public scanner APIs
│   │   └── candles/            # Price data API
│   ├── scanners/               # Scanner pages
│   │   ├── horizontal-resistance/
│   │   ├── vcp/
│   │   └── flags-pennants/
│   └── layout.tsx              # Root layout
├── components/                 # React components
│   ├── ScannerSidebar.tsx
│   ├── ScannerTable.tsx
│   ├── StockChartCard.tsx
│   └── TVLiteChart.tsx
├── lib/
│   ├── patterns/               # Pattern detection algorithms
│   │   ├── horizontalResistance.ts
│   │   ├── vcp.ts
│   │   └── flagPennant.ts
│   ├── alphaVantage.ts         # Alpha Vantage client
│   ├── supabaseServer.ts       # Supabase client
│   └── scannerEngine.ts        # Scanner orchestration
├── config/
│   └── universe.ts             # Symbol watchlist
├── types/
│   └── chart.ts                # TypeScript types
└── supabase/
    └── schema.sql              # Database schema
```

## Usage

### Populating Data

Before running scanners, you need to populate the database with stock data:

1. Add stock symbols to the `stocks` table in Supabase
2. Ingest price data using the admin API:

```bash
# Ingest data for a single symbol
curl http://localhost:3000/api/admin/ingest-daily/AAPL
```

### Running Scanners

Execute scanners manually:

```bash
# Run all scanners
curl -X POST http://localhost:3000/api/admin/run-scanners
```

### Viewing Results

Navigate to:
- `/scanners/horizontal-resistance` - View horizontal resistance patterns
- `/scanners/vcp` - View VCP patterns
- `/scanners/flags-pennants` - View flags and pennants patterns

## Deployment

### Vercel Deployment

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Vercel Cron Job (Optional)

Add a `vercel.json` to schedule daily scanner runs:

```json
{
  "crons": [{
    "path": "/api/admin/run-scanners",
    "schedule": "0 22 * * *"
  }]
}
```

This runs scanners daily at 10 PM UTC (after US market close).

## Pattern Detection Algorithms

### Horizontal Resistance
- Identifies swing highs in the last 6 months
- Clusters highs within ±2.5% price bands
- Returns patterns with ≥3 touches and current price 0-5% below resistance

### VCP (Volatility Contraction Pattern)
- Requires 200+ days of data
- Validates uptrend with MA analysis (50, 150, 200-day)
- Identifies 2-5 consolidation bases with decreasing volatility
- Returns pivot price from last base

### Flags & Pennants
- Searches for 15-25% price gains over 8-15 days (flagpole)
- Identifies consolidation period (flag) of 5-20 days
- Validates flag range is 30-50% of pole height
- Returns trend line coordinates for visualization

## Limitations (MVP)

- Small symbol universe (20 stocks) due to Alpha Vantage free tier limits
- Manual data ingestion required
- Placeholder RS (Relative Strength) ratings
- Simplified pattern detection algorithms
- No user authentication

## Future Enhancements

- Automated data ingestion with cron jobs
- Real RS rating calculations
- Alerts and notifications
- Portfolio tracking
- Extended symbol coverage
- Advanced pattern variations
- Backtesting capabilities

## Contributing

This is an MVP project. Contributions are welcome!

## License

MIT

## Notes on Branch Management

This project uses the `pepper` branch as the main development branch. The original `main` branch can be deleted by:

1. Setting `pepper` as the default branch in GitHub repository settings
2. Deleting the `main` branch through GitHub UI

**Note:** Branch deletion must be done through GitHub's web interface after changing the default branch, as it requires repository admin permissions.
