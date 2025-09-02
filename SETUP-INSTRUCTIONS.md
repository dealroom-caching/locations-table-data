# Setup Instructions for locations-table-data Repository

## Step 1: Initialize the Repository

1. **Navigate to this folder:**
   ```bash
   cd /path/to/this/github-repo-setup/folder
   ```

2. **Initialize git and push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Locations table data cache with automated updates"
   git branch -M main
   git remote add origin https://github.com/dealroom-caching/locations-table-data.git
   git push -u origin main
   ```

## Step 2: Configure GitHub Repository

1. **Make the repository public:**
   - Go to https://github.com/dealroom-caching/locations-table-data
   - Click "Settings" tab
   - Scroll down to "Danger Zone"
   - Click "Change repository visibility"
   - Select "Make public"

2. **Enable GitHub Actions:**
   - Go to "Actions" tab
   - If prompted, click "Enable Actions for this repository"

3. **Set proper permissions:**
   - Go to "Settings" → "Actions" → "General"
   - Under "Workflow permissions", select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"
   - Click "Save"

## Step 3: Test the Setup

1. **Trigger the workflow manually:**
   - Go to "Actions" tab
   - Click "Auto-refresh Google Sheets cache"
   - Click "Run workflow" → "Run workflow"

2. **Check if it works:**
   - Wait for the action to complete
   - Check if both cache files were updated:
     - `public/cached-data/locations-cache.json` (locations & config data)
     - `public/cached-data/locations-sectors-cache.json` (all sector data)
   - Verify the raw URLs work:
     ```
     https://raw.githubusercontent.com/dealroom-caching/locations-table-data/main/public/cached-data/locations-cache.json
     https://raw.githubusercontent.com/dealroom-caching/locations-table-data/main/public/cached-data/locations-sectors-cache.json
     ```

## Step 4: Verify with Your App

Once the GitHub repo is set up and the raw URL is working, your main application will automatically:

1. ✅ Try to fetch from GitHub cache first (fastest)
2. ✅ Fallback to local static cache if GitHub fails  
3. ✅ Fallback to direct Google Sheets if both fail

## Files in this setup:

- `package.json` - Node.js project configuration
- `fetch-cache-data.js` - Script to fetch data from Google Sheets
- `.github/workflows/refresh-cache.yml` - GitHub Action workflow
- `public/cached-data/locations-cache.json` - Locations and config cache file
- `public/cached-data/locations-sectors-cache.json` - Locations sectors data cache file
- `.gitignore` - Git ignore rules
- `README.md` - Repository documentation

That's it! Once this is set up, your cache will update automatically every day at 2 AM UTC, and your app will load super fast! 🚀
