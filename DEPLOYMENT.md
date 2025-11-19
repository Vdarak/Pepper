# ChartMaze US - Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **Supabase Account** (free tier)
   - Sign up at https://supabase.com
   - Create a new project
   - Note your project URL and service role key

2. **Alpha Vantage API Key** (free tier)
   - Sign up at https://www.alphavantage.co/support/#api-key
   - Free tier provides 25 API requests per day

3. **Vercel Account** (free tier)
   - Sign up at https://vercel.com
   - Connect your GitHub account

## Database Setup

### 1. Create Supabase Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `src/supabase/schema.sql`
4. Click "Run" to execute the SQL

This creates:
- `stocks` table for symbol information
- `stock_prices` table for OHLCV data
- `scanner_results` table for pattern detections
- Appropriate indexes for performance

### 2. Populate Initial Stock Data

Add some initial stock symbols:

```sql
INSERT INTO stocks (symbol, name, exchange, sector, industry, market_cap)
VALUES
  ('AAPL', 'Apple Inc.', 'NASDAQ', 'Technology', 'Consumer Electronics', 2500000000000),
  ('MSFT', 'Microsoft Corporation', 'NASDAQ', 'Technology', 'Software', 2400000000000),
  ('NVDA', 'NVIDIA Corporation', 'NASDAQ', 'Technology', 'Semiconductors', 1100000000000),
  ('TSLA', 'Tesla Inc.', 'NASDAQ', 'Consumer Cyclical', 'Auto Manufacturers', 700000000000),
  ('META', 'Meta Platforms Inc.', 'NASDAQ', 'Technology', 'Internet Content', 800000000000),
  ('GOOGL', 'Alphabet Inc.', 'NASDAQ', 'Technology', 'Internet Content', 1700000000000),
  ('AMZN', 'Amazon.com Inc.', 'NASDAQ', 'Consumer Cyclical', 'Internet Retail', 1500000000000),
  ('AMD', 'Advanced Micro Devices', 'NASDAQ', 'Technology', 'Semiconductors', 200000000000),
  ('NFLX', 'Netflix Inc.', 'NASDAQ', 'Communication Services', 'Entertainment', 250000000000),
  ('CRM', 'Salesforce Inc.', 'NYSE', 'Technology', 'Software', 220000000000);
```

## Local Development

### 1. Clone Repository

```bash
git clone https://github.com/Vdarak/Pepper.git
cd Pepper
git checkout pepper
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
ALPHA_VANTAGE_KEY=your_actual_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Data Ingestion

Before using the scanners, populate price data:

```bash
# Ingest data for each symbol in your universe
curl http://localhost:3000/api/admin/ingest-daily/AAPL
curl http://localhost:3000/api/admin/ingest-daily/MSFT
curl http://localhost:3000/api/admin/ingest-daily/NVDA
# ... etc for all symbols
```

**Note:** Alpha Vantage free tier limits you to 25 API calls per day, so spread ingestion over multiple days or upgrade to a paid plan.

## Running Scanners

After data ingestion, run the pattern scanners:

```bash
curl -X POST http://localhost:3000/api/admin/run-scanners
```

This will:
- Scan all symbols in the universe
- Detect horizontal resistance, VCP, and flag/pennant patterns
- Store results in the database

## Vercel Deployment

### 1. Push to GitHub

Ensure your changes are committed and pushed to the `pepper` branch:

```bash
git add .
git commit -m "Ready for deployment"
git push origin pepper
```

### 2. Import Project in Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select the `pepper` branch
4. Vercel will auto-detect Next.js settings

### 3. Configure Environment Variables

In Vercel project settings, add:

- `ALPHA_VANTAGE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. Deploy

Click "Deploy" and Vercel will build and deploy your application.

## Automated Data Ingestion (Optional)

### Option 1: Vercel Cron Jobs

Create `vercel.json` in the project root:

```json
{
  "crons": [
    {
      "path": "/api/admin/ingest-daily/AAPL",
      "schedule": "0 22 * * MON"
    },
    {
      "path": "/api/admin/ingest-daily/MSFT",
      "schedule": "0 22 * * TUE"
    }
  ]
}
```

**Note:** Spread out API calls across different days to stay within free tier limits.

### Option 2: External Cron Service

Use a service like:
- GitHub Actions
- EasyCron
- Cron-job.org

Schedule daily calls to your ingestion endpoints.

## Automated Scanner Execution

Add a cron job to run scanners after market close:

```json
{
  "crons": [
    {
      "path": "/api/admin/run-scanners",
      "schedule": "0 23 * * *"
    }
  ]
}
```

This runs scanners daily at 11 PM UTC (after US market close at 4 PM ET).

## Monitoring

### Check Deployment Status

```bash
vercel logs
```

### Verify Database

Check Supabase dashboard:
- Table Editor to view data
- Database > Logs for query performance
- API > Logs for request monitoring

### Test API Endpoints

```bash
# Test scanner endpoints
curl https://your-app.vercel.app/api/scanners/horizontal-resistance
curl https://your-app.vercel.app/api/scanners/vcp
curl https://your-app.vercel.app/api/scanners/flags-pennants

# Test candles endpoint
curl https://your-app.vercel.app/api/candles/AAPL
```

## Troubleshooting

### Build Fails

- Check Node.js version (requires 18+)
- Verify all dependencies are installed
- Check for TypeScript errors: `npm run build`

### API Errors

- Verify environment variables are set correctly
- Check Supabase connection
- Verify Alpha Vantage API key is valid

### No Pattern Results

- Ensure stock data has been ingested
- Run scanners manually via API
- Check scanner_results table in Supabase

### Rate Limiting

- Alpha Vantage free tier: 25 requests/day
- Implement request queuing or upgrade plan
- Use cached data where possible

## Scaling Considerations

For production use:

1. **Upgrade Alpha Vantage Plan** for more API calls
2. **Add More Symbols** to the universe
3. **Implement Caching** for API responses
4. **Add Authentication** for admin endpoints
5. **Set up Monitoring** (Sentry, LogRocket)
6. **Optimize Database** with additional indexes
7. **Add Rate Limiting** on public endpoints

## Support

For issues or questions:
- Check the README.md
- Review Supabase documentation
- Check Next.js documentation
- Review Alpha Vantage API docs
