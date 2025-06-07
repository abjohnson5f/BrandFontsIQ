import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';

// Read the test Excel file
const filePath = '/Users/alexjohnson/Dev Projects/Supporting Materials/Polaris Raw Test Data_CompanyID_Test.xlsx';
const file = readFileSync(filePath);
const workbook = XLSX.read(file, { type: 'buffer' });

// Get the first sheet
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert to JSON to analyze structure
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

// Get headers (first row)
const headers = data[0];

console.log('Column Analysis:');
console.log('================');
console.log(`Total columns: ${headers.length}`);
console.log('\nColumn mapping:');

headers.forEach((header, index) => {
  const columnLetter = XLSX.utils.encode_col(index);
  console.log(`${columnLetter}: "${header}"`);
});

// Find specific columns we're interested in
const findColumn = (pattern: RegExp | string) => {
  return headers.findIndex(h => 
    typeof pattern === 'string' 
      ? h?.toString().toLowerCase() === pattern.toLowerCase()
      : pattern.test(h?.toString() || '')
  );
};

console.log('\n\nTarget Columns:');
console.log('===============');

const websiteAppTitleIdx = findColumn(/website.*app.*title|app.*title|website.*title/i);
const url1Idx = findColumn(/^url$/i);
const url2Idx = findColumn(/url.*2/i);
const appUrlIdx = findColumn(/app.*url/i);
const companyIdx = findColumn(/company/i);

console.log(`Website/App Title: Column ${websiteAppTitleIdx >= 0 ? XLSX.utils.encode_col(websiteAppTitleIdx) : 'NOT FOUND'} (index ${websiteAppTitleIdx})`);
console.log(`URL: Column ${url1Idx >= 0 ? XLSX.utils.encode_col(url1Idx) : 'NOT FOUND'} (index ${url1Idx})`);
console.log(`URL 2: Column ${url2Idx >= 0 ? XLSX.utils.encode_col(url2Idx) : 'NOT FOUND'} (index ${url2Idx})`);
console.log(`App URL: Column ${appUrlIdx >= 0 ? XLSX.utils.encode_col(appUrlIdx) : 'NOT FOUND'} (index ${appUrlIdx})`);
console.log(`Company: Column ${companyIdx >= 0 ? XLSX.utils.encode_col(companyIdx) : 'NOT FOUND'} (index ${companyIdx})`);

// Show sample data from first 5 rows
console.log('\n\nSample Data (first 5 rows):');
console.log('===========================');

for (let i = 1; i <= Math.min(5, data.length - 1); i++) {
  const row = data[i];
  console.log(`\nRow ${i}:`);
  if (websiteAppTitleIdx >= 0) console.log(`  Website/App Title: "${row[websiteAppTitleIdx] || ''}"`);
  if (url1Idx >= 0) console.log(`  URL: "${row[url1Idx] || ''}"`);
  if (url2Idx >= 0) console.log(`  URL 2: "${row[url2Idx] || ''}"`);
  if (appUrlIdx >= 0) console.log(`  App URL: "${row[appUrlIdx] || ''}"`);
  if (companyIdx >= 0) console.log(`  Company: "${row[companyIdx] || 'EMPTY'}"`);
}