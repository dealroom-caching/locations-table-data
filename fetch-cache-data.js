import fs from 'fs';
import path from 'path';

// Note: Using built-in fetch API available in Node.js 18+
// Google Sheets configuration
const SHEET_ID = "1Ewhi3YCL-dUWZ3YrHpsmWt4goza-5c1FbDyfDcw26lw";

// Configuration sheets
const CONFIG_SHEETS = [
  { name: "locations", gid: "880351439" },
  { name: "config", gid: "940884547" }
];

// Sector data sheets - mapping of sector slugs to their corresponding sheet GIDs
const SECTOR_SHEET_GIDS = {
  fintech: '99479904',        // Sector_Data_Fintech
  defence: '392696859',
  space: '1597782923',      
  deeptech: '1185161894',
  ai: '1352531442',
  energy: '288774328',
  lifesciences: '2015834289',
  healthmedtech: '739796238',
  cybersecurity: '1032292773',
  robotics: '79509439',
  transportation: '1908851490',
  food: '1086569817',
  semiconductors: '1161961483',
  crypto: '445413038',
  climatetech: '1625161302',
  gaming: '698117399'
};

// Convert sector GIDs to sheet configs
const SECTOR_CONFIGS = Object.entries(SECTOR_SHEET_GIDS).map(([name, gid]) => ({
  name: `sector_${name}`,
  gid: gid
}));

// All sheets to fetch
const ALL_SHEET_CONFIGS = [...CONFIG_SHEETS, ...SECTOR_CONFIGS];

async function fetchGoogleSheetData(sheetConfig) {
  const timestamp = Date.now();
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${sheetConfig.gid}&headers=1&timestamp=${timestamp}`;
  
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
    
    console.log(`📊 Fetching ${ALL_SHEET_CONFIGS.length} sheets total:`);
    console.log(`   - ${CONFIG_SHEETS.length} configuration sheets`);
    console.log(`   - ${SECTOR_CONFIGS.length} sector data sheets`);
    
    for (const sheetConfig of ALL_SHEET_CONFIGS) {
      try {
        allData[sheetConfig.name] = await fetchGoogleSheetData(sheetConfig);
        console.log(`✅ ${sheetConfig.name}: ${allData[sheetConfig.name].rows.length} rows`);
      } catch (error) {
        console.error(`❌ Failed to fetch ${sheetConfig.name}:`, error.message);
        // Continue with other sheets instead of failing completely
        console.log(`⚠️ Skipping ${sheetConfig.name} and continuing...`);
      }
    }
    
    // Organize data into logical groups
    const configData = {};
    const sectorData = {};
    
    Object.entries(allData).forEach(([key, value]) => {
      if (key.startsWith('sector_')) {
        const sectorName = key.replace('sector_', '');
        sectorData[sectorName] = value;
      } else {
        configData[key] = value;
      }
    });
    
    const timestamp = new Date().toISOString();
    
    // Create locations/config cache file
    const locationsCache = {
      timestamp: timestamp,
      lastUpdated: timestamp,
      metadata: {
        totalSheets: CONFIG_SHEETS.length,
        sheets: CONFIG_SHEETS.map(s => s.name),
        spreadsheetId: SHEET_ID
      },
      data: configData
    };
    
    // Create sectors cache file
    const sectorsCache = {
      timestamp: timestamp,
      lastUpdated: timestamp,
      metadata: {
        totalSheets: SECTOR_CONFIGS.length,
        sectors: Object.keys(sectorData),
        spreadsheetId: SHEET_ID
      },
      data: sectorData
    };
    
    // Save both cache files
    const locationsFile = path.join(cacheDir, 'locations-cache.json');
    const sectorsFile = path.join(cacheDir, 'locations-sectors-cache.json');
    
    fs.writeFileSync(locationsFile, JSON.stringify(locationsCache, null, 2));
    fs.writeFileSync(sectorsFile, JSON.stringify(sectorsCache, null, 2));
    
    console.log(`✅ Cache updated successfully!`);
    console.log(`📁 Locations cache: ${locationsFile}`);
    console.log(`📁 Locations-sectors cache: ${sectorsFile}`);
    console.log(`📊 Total sheets cached: ${ALL_SHEET_CONFIGS.length}`);
    console.log(`   - Configuration sheets: ${CONFIG_SHEETS.length} (${CONFIG_SHEETS.map(s => s.name).join(', ')})`);
    console.log(`   - Sector data sheets: ${SECTOR_CONFIGS.length}`);
    console.log(`🏷️  Sectors included: ${Object.keys(sectorData).join(', ')}`);
    console.log(`🕒 Timestamp: ${timestamp}`);
    
  } catch (error) {
    console.error('❌ Cache update failed:', error);
    process.exit(1);
  }
}

main();
