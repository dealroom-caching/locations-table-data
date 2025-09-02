import fs from 'fs';
import path from 'path';

// Note: Using built-in fetch API available in Node.js 18+
// Google Sheets configuration
const SHEET_ID = "1LutC2VxesrS-5Ym8VydVvgLh8stH66vY_Bor1g7lY2A";

// Fetch sheets by GID (more reliable than names)
const SHEET_CONFIGS = [
  { name: "overview", gid: "109336614" },
  { name: "yearly", gid: "1515439227" },
  { name: "quarterly", gid: "966294539" },
  { name: "enterpriseValue", gid: "350477002" },
  { name: "regional", gid: "840041598" }
];

async function fetchGoogleSheetData(sheetConfig) {
  const timestamp = Date.now();
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${sheetConfig.gid}&range=A1:BH1048576&headers=1&timestamp=${timestamp}`;
  
  console.log(`Fetching ${sheetConfig.name} (GID: ${sheetConfig.gid})...`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${sheetConfig.name}: ${response.statusText}`);
  }
  
  const text = await response.text();
  
  // Parse Google Sheets JSONP response
  const jsonStartIndex = text.indexOf('(') + 1;
  const jsonEndIndex = text.lastIndexOf('}') + 1;
  const jsonText = text.substring(jsonStartIndex, jsonEndIndex);
  const data = JSON.parse(jsonText);
  
  if (!data.table || !data.table.rows) {
    throw new Error(`No data found in ${sheetConfig.name}`);
  }
  
  // Convert to our format
  const headers = data.table.cols?.map(col => col.label || '') || [];
  const rows = data.table.rows.map(row => 
    row.c?.map(cell => cell?.v || '') || []
  );
  
  return {
    headers,
    rows,
    weightedColumns: Array(headers.length).fill(false) // Remove weights-specific logic since we have different sheets now
  };
}

async function main() {
  try {
    console.log('🔄 Fetching fresh Google Sheets data...');
    
    // Create cache directory
    const cacheDir = path.join(process.cwd(), 'public', 'cached-data');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    // Fetch all sheets using GIDs
    const allData = {};
    for (const sheetConfig of SHEET_CONFIGS) {
      try {
        allData[sheetConfig.name] = await fetchGoogleSheetData(sheetConfig);
        console.log(`✅ ${sheetConfig.name}: ${allData[sheetConfig.name].rows.length} rows`);
      } catch (error) {
        console.error(`❌ Failed to fetch ${sheetConfig.name}:`, error.message);
        // Continue with other sheets instead of failing completely
        console.log(`⚠️ Skipping ${sheetConfig.name} and continuing...`);
      }
    }
    
    // Save to cache file with timestamp (React app expects this format)
    const cacheData = {
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      data: allData
    };
    
    // Save as locations-cache.json (with timestamp structure)
    const cacheFile = path.join(cacheDir, 'locations-cache.json');
    
    fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
    
    console.log(`✅ Cache updated successfully!`);
    console.log(`📁 Cache file: ${cacheFile}`);
    console.log(`📊 Total sheets cached: ${Object.keys(allData).length}`);
    console.log(`🕒 Timestamp: ${cacheData.timestamp}`);
    
  } catch (error) {
    console.error('❌ Cache update failed:', error);
    process.exit(1);
  }
}

main();
