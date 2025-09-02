# Locations Table Data Cache

This repository contains automatically updated cache data for locations table applications.

## How it works

1. **GitHub Action** runs daily at 2 AM UTC
2. **Fetches fresh data** from Google Sheets
3. **Updates cache files** in `public/cached-data/`
4. **Commits changes** back to the repository

## Files

- `locations-cache.json` - Main cache file used by the application
- `fetch-cache-data.js` - Script to fetch and update cache data
- `.github/workflows/refresh-cache.yml` - GitHub Action workflow

## Manual Update

You can manually trigger a cache update:

1. Go to the "Actions" tab in GitHub
2. Click "Auto-refresh Google Sheets cache" 
3. Click "Run workflow"

## Cache Structure

The cache contains data from Google Sheets with the following structure:

```json
{
  "lovable": {
    "headers": ["Investor name", "investor_link", ...],
    "rows": [["Investor 1", "link1", ...], ...],
    "weightedColumns": [false, false, true, ...]
  },
  "weights": {
    "headers": [...],
    "rows": [...],
    "weightedColumns": [...]
  }
}
```

## Access

The cache is publicly accessible via GitHub raw files:
- `https://raw.githubusercontent.com/dealroom-caching/locations-table-data/main/public/cached-data/locations-cache.json`
