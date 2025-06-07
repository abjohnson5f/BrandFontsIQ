import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';

// Read the enriched Excel file
const filePath = '/Users/alexjohnson/Dev Projects/GitHub/BrandFontsIQ-vNextJS15/output/Polaris_CompanyID_Enriched.xlsx';
const file = readFileSync(filePath);
const workbook = XLSX.read(file, { type: 'buffer' });

// Get the first sheet
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert to JSON to analyze
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
const headers = data[0];

// Find Company column
const companyIdx = headers.findIndex((h: string) => /company/i.test(h));

console.log('Enriched Data Analysis:');
console.log('======================');
console.log(`Total rows: ${data.length - 1}`);

// Analyze company identification results
const companies = new Map<string, number>();
let emptyCount = 0;

for (let i = 1; i < Math.min(data.length, 500); i++) { // Analyze first 500 rows
  const company = data[i][companyIdx];
  if (!company || company === 'EMPTY') {
    emptyCount++;
  } else {
    companies.set(company, (companies.get(company) || 0) + 1);
  }
}

console.log(`\nRows with identified companies: ${companies.size > 0 ? data.length - 1 - emptyCount : 0}`);
console.log(`Rows still empty: ${emptyCount}`);

console.log('\nTop identified companies:');
const sortedCompanies = Array.from(companies.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

sortedCompanies.forEach(([company, count]) => {
  console.log(`  ${company}: ${count} occurrences`);
});

// Show sample enriched rows
console.log('\nSample enriched rows:');
for (let i = 1; i <= Math.min(10, data.length - 1); i++) {
  const row = data[i];
  console.log(`\nRow ${i}:`);
  console.log(`  Company: "${row[companyIdx] || 'EMPTY'}"`);
  console.log(`  Website/App Title: "${row[4] || ''}"`);
  console.log(`  URL: "${row[5] || ''}"`);
}