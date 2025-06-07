import * as XLSX from 'xlsx';
import { readFileSync, writeFileSync } from 'fs';
import { identifyCompanies, CompanyData } from '../src/lib/companyIdentification';
import path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Required column names as specified
const REQUIRED_COLUMNS = [
  'Website/App Title',
  'URL',
  'URL 2',
  'App URL'
];

async function processExcelFile(inputPath: string, outputPath: string) {
  console.log('Reading Excel file...');
  const file = readFileSync(inputPath);
  const workbook = XLSX.read(file, { type: 'buffer' });
  
  // Get the first sheet
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // Convert to JSON to work with data
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  
  // Get headers (first row)
  const headers = data[0];
  console.log(`Found ${headers.length} columns`);
  
  // Find required columns by exact name match
  const columnIndices: Record<string, number> = {};
  
  // For test data, URL 2 doesn't exist, so we'll make it optional
  const actualRequiredColumns = ['Website/App Title', 'URL', 'App URL'];
  
  for (const colName of actualRequiredColumns) {
    const index = headers.findIndex(h => h === colName);
    if (index === -1) {
      throw new Error(`Required column "${colName}" not found in Excel file`);
    }
    columnIndices[colName] = index;
    console.log(`Found "${colName}" at column ${XLSX.utils.encode_col(index)} (index ${index})`);
  }
  
  // Also find URL 2 if it exists (optional)
  const url2Index = headers.findIndex(h => h === 'URL 2');
  if (url2Index >= 0) {
    columnIndices['URL 2'] = url2Index;
    console.log(`Found "URL 2" at column ${XLSX.utils.encode_col(url2Index)} (index ${url2Index})`);
  } else {
    console.log('Note: "URL 2" column not found in test data (this is expected)');
  }
  
  // Find the Company column (where we'll write results)
  const companyIndex = headers.findIndex(h => h === 'Company');
  if (companyIndex === -1) {
    throw new Error('Company column not found - cannot write results');
  }
  console.log(`Found "Company" column at ${XLSX.utils.encode_col(companyIndex)} (index ${companyIndex})`);
  
  // Prepare data for company identification
  console.log('\nPreparing data for company identification...');
  const companyDataArray: CompanyData[] = [];
  
  // Skip header row, process all data rows
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    companyDataArray.push({
      websiteAppTitle: row[columnIndices['Website/App Title']] || '',
      url: row[columnIndices['URL']] || '',
      url2: columnIndices['URL 2'] ? row[columnIndices['URL 2']] || '' : '',
      appUrl: row[columnIndices['App URL']] || ''
    });
  }
  
  console.log(`Processing ${companyDataArray.length} rows...`);
  
  // Identify companies with progress tracking
  const results = await identifyCompanies(companyDataArray, (current, total) => {
    if (current % 10 === 0 || current === total) {
      console.log(`Progress: ${current}/${total} (${Math.round(current/total * 100)}%)`);
    }
  });
  
  // Update the Excel data with results
  console.log('\nUpdating Excel data with results...');
  
  // Add additional columns for parent company and confidence
  const parentCompanyIndex = headers.length;
  const confidenceIndex = headers.length + 1;
  headers.push('Parent Company', 'Confidence');
  
  for (let i = 0; i < results.length; i++) {
    const rowIndex = i + 1; // +1 to skip header
    const result = results[i];
    
    // Update Company column
    data[rowIndex][companyIndex] = result.company;
    
    // Add parent company and confidence
    data[rowIndex][parentCompanyIndex] = result.parentCompany || '';
    data[rowIndex][confidenceIndex] = result.confidence;
  }
  
  // Convert back to worksheet
  const newSheet = XLSX.utils.aoa_to_sheet(data);
  
  // Create new workbook with updated data
  const newWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);
  
  // Write the file
  XLSX.writeFile(newWorkbook, outputPath);
  console.log(`\nResults saved to: ${outputPath}`);
  
  // Generate summary statistics
  const stats = {
    totalRows: results.length,
    identified: results.filter(r => r.company !== 'Unknown').length,
    withParent: results.filter(r => r.parentCompany).length,
    highConfidence: results.filter(r => r.confidence >= 0.8).length,
    mediumConfidence: results.filter(r => r.confidence >= 0.5 && r.confidence < 0.8).length,
    lowConfidence: results.filter(r => r.confidence < 0.5).length
  };
  
  console.log('\nSummary Statistics:');
  console.log(`Total rows processed: ${stats.totalRows}`);
  console.log(`Companies identified: ${stats.identified} (${Math.round(stats.identified/stats.totalRows * 100)}%)`);
  console.log(`With parent company: ${stats.withParent}`);
  console.log(`High confidence (≥80%): ${stats.highConfidence}`);
  console.log(`Medium confidence (50-79%): ${stats.mediumConfidence}`);
  console.log(`Low confidence (<50%): ${stats.lowConfidence}`);
  
  // Check if we correctly identified Aixam
  const aixamCheck = results.find((r, i) => {
    const row = companyDataArray[i];
    return row.url.includes('abb-vsp.com');
  });
  
  if (aixamCheck) {
    console.log('\nAixam dealer test:');
    console.log(`URL: abb-vsp.com`);
    console.log(`Identified as: ${aixamCheck.company}`);
    console.log(`Confidence: ${Math.round(aixamCheck.confidence * 100)}%`);
    console.log(`Success: ${aixamCheck.company.toLowerCase().includes('aixam') ? 'YES ✓' : 'NO ✗'}`);
  }
  
  return { stats, results };
}

// Main execution
async function main() {
  const inputPath = '/Users/alexjohnson/Dev Projects/Supporting Materials/Polaris Raw Test Data_CompanyID_Test.xlsx';
  const outputPath = path.join(process.cwd(), 'output', 'Polaris_CompanyID_Enriched_v3.xlsx');
  
  try {
    await processExcelFile(inputPath, outputPath);
  } catch (error) {
    console.error('Error processing file:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}