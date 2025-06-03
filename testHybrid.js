#!/usr/bin/env node

const { FontIdentification } = require('./dist/lib/fontIdentification.js');
const path = require('path');
const fs = require('fs');

async function testHybridImplementation() {
  console.log('Testing Hybrid Font Identification Implementation...\n');
  
  const testDataPath = '/Users/alexjohnson/Supporting Materials/Polaris Raw Test Data.xlsx';
  
  try {
    // Process the Excel file
    const results = await FontIdentification.processExcelFile(testDataPath);
    
    console.log('=== SUMMARY ===');
    console.log(`Total rows processed: ${results.totalRows}`);
    console.log(`Unique fonts found: ${results.uniqueCount}`);
    console.log('\n=== TOP 10 FONTS BY FREQUENCY ===');
    
    // Sort fonts by occurrence
    const sortedFonts = Array.from(results.fontOccurrences.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    sortedFonts.forEach(([font, count], index) => {
      console.log(`${index + 1}. ${font} (${count} occurrences)`);
    });
    
    // Test component parsing on a few examples
    console.log('\n=== COMPONENT PARSING EXAMPLES ===');
    const exampleFonts = [
      'Helvetica Neue Bold Italic',
      'Roboto Condensed Medium',
      'Open Sans Light',
      'Gotham Screen Smart Bold'
    ];
    
    exampleFonts.forEach(font => {
      const components = FontIdentification.parseFontComponents(font);
      console.log(`\n${font}:`);
      console.log(`  Base: ${components.baseName}`);
      console.log(`  Width: ${components.width || 'none'}`);
      console.log(`  Weight: ${components.weight || 'none'}`);
      console.log(`  Style: ${components.style || 'none'}`);
    });
    
    // Compare with agent results
    console.log('\n=== COMPARISON WITH AGENT RESULTS ===');
    console.log('Manual count: 243');
    console.log('Agent 1: 248');
    console.log('Agent 2: 234');
    console.log('Agent 3: 229');
    console.log(`Hybrid: ${results.uniqueCount}`);
    
    // Save results
    const outputPath = './hybrid-results.json';
    const outputData = {
      summary: {
        totalRows: results.totalRows,
        uniqueCount: results.uniqueCount,
        timestamp: new Date().toISOString()
      },
      uniqueFonts: Array.from(results.uniqueFonts).sort(),
      fontFrequency: Object.fromEntries(results.fontOccurrences)
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`\nResults saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testHybridImplementation();