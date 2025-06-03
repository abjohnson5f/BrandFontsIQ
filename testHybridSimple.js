#!/usr/bin/env node

const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Copy the hybrid implementation logic here for testing
const standardizationMap = {
  'Gotham SSm': 'Gotham Screen Smart',
  'Gotham Screen Space Smart': 'Gotham Screen Smart',
  'GothamSSm': 'Gotham Screen Smart',
  'Bd': 'Bold',
  'Lt': 'Light',
  'Md': 'Medium',
  'Rg': 'Regular',
  'SemiBold': 'Semi-Bold',
  'Semibold': 'Semi-Bold',
};

const weightPattern = /\b(Ultra\s*Light|Extra\s*Light|Thin|Light|Regular|Medium|Demi\s*Bold|Semi[\s-]?Bold|Bold|Extra\s*Bold|Heavy|Black)\b/gi;
const stylePattern = /\b(Italic|Oblique|Roman)\b/gi;
const widthPattern = /\b(Condensed|Extended|Narrow|Wide)\b/gi;

function parseFontComponents(fontName) {
  if (!fontName) return null;
  
  let baseName = fontName;
  const components = {
    weight: null,
    style: null,
    width: null
  };
  
  const weightMatch = fontName.match(weightPattern);
  if (weightMatch) {
    components.weight = weightMatch[weightMatch.length - 1];
    baseName = baseName.replace(weightPattern, '').trim();
  }
  
  const styleMatch = fontName.match(stylePattern);
  if (styleMatch) {
    components.style = styleMatch[0];
    baseName = baseName.replace(stylePattern, '').trim();
  }
  
  const widthMatch = fontName.match(widthPattern);
  if (widthMatch) {
    components.width = widthMatch[0];
    baseName = baseName.replace(widthPattern, '').trim();
  }
  
  baseName = baseName.replace(/\s+/g, ' ').trim();
  
  return { baseName, ...components };
}

function standardizeFontName(fontName) {
  if (!fontName) return null;
  
  let standardized = fontName.trim();
  
  for (const [key, value] of Object.entries(standardizationMap)) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    standardized = standardized.replace(regex, value);
  }
  
  standardized = standardized.replace(/\s+/g, ' ').trim();
  
  return standardized;
}

function extractFontFromPath(filePath) {
  if (!filePath) return null;
  
  const filename = path.basename(filePath, path.extname(filePath));
  
  let fontName = filename
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .trim();
  
  return standardizeFontName(fontName);
}

function combineFamilySubfamily(family, subfamily) {
  if (!family) return null;
  
  const parts = [family];
  if (subfamily && subfamily.toLowerCase() !== 'regular') {
    parts.push(subfamily);
  }
  
  return standardizeFontName(parts.join(' '));
}

function identifyUniqueFonts(data) {
  const uniqueFonts = new Set();
  const fontOccurrences = new Map();
  const processedRows = [];
  
  data.forEach((row, index) => {
    let identifiedFont = null;
    let identificationMethod = null;
    
    // 1. Try Font Name column first
    const fontNameColumns = ['Font Name', 'FontName', 'Name', 'Font'];
    for (const col of fontNameColumns) {
      if (row[col]) {
        identifiedFont = standardizeFontName(row[col]);
        identificationMethod = 'Font Name Column';
        break;
      }
    }
    
    // 2. Try file path
    const pathColumns = ['File Path', 'FilePath', 'Path', 'Font File Path'];
    if (!identifiedFont) {
      for (const col of pathColumns) {
        if (row[col]) {
          identifiedFont = extractFontFromPath(row[col]);
          if (identifiedFont) {
            identificationMethod = 'File Path';
            break;
          }
        }
      }
    }
    
    // 3. Try other columns
    if (!identifiedFont) {
      const otherColumns = Object.keys(row).filter(col => 
        !fontNameColumns.includes(col) && 
        !pathColumns.includes(col) &&
        !col.toLowerCase().includes('id') &&
        !col.toLowerCase().includes('date')
      );
      
      for (const col of otherColumns) {
        if (row[col] && typeof row[col] === 'string') {
          const value = row[col].trim();
          if (value.length > 2 && value.length < 100 && /[A-Za-z]/.test(value)) {
            identifiedFont = standardizeFontName(value);
            if (identifiedFont) {
              identificationMethod = `Other Column (${col})`;
              break;
            }
          }
        }
      }
    }
    
    // 4. Try family + subfamily
    if (!identifiedFont) {
      const familyCol = Object.keys(row).find(col => 
        col.toLowerCase().includes('family') && !col.toLowerCase().includes('subfamily')
      );
      const subfamilyCol = Object.keys(row).find(col => 
        col.toLowerCase().includes('subfamily') || col.toLowerCase().includes('style')
      );
      
      if (familyCol && row[familyCol]) {
        identifiedFont = combineFamilySubfamily(row[familyCol], row[subfamilyCol]);
        if (identifiedFont) {
          identificationMethod = 'Family + Subfamily';
        }
      }
    }
    
    if (!identifiedFont) {
      identifiedFont = 'Unknown Font';
      identificationMethod = 'Default';
    }
    
    const components = parseFontComponents(identifiedFont) || {
      baseName: identifiedFont,
      weight: null,
      style: null,
      width: null
    };
    
    uniqueFonts.add(identifiedFont);
    fontOccurrences.set(
      identifiedFont, 
      (fontOccurrences.get(identifiedFont) || 0) + 1
    );
    
    processedRows.push({
      fontName: identifiedFont,
      components,
      identificationMethod: identificationMethod || 'Unknown',
      rowIndex: index
    });
  });
  
  return {
    uniqueFonts,
    fontOccurrences,
    processedRows,
    totalRows: data.length,
    uniqueCount: uniqueFonts.size
  };
}

// Main test
console.log('Testing Hybrid Font Identification Implementation...\n');

const testDataPath = '/Users/alexjohnson/Dev Projects/Supporting Materials/Polaris Raw Test Data.xlsx';

try {
  const workbook = xlsx.readFile(testDataPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);
  
  const results = identifyUniqueFonts(data);
  
  console.log('=== SUMMARY ===');
  console.log(`Total rows processed: ${results.totalRows}`);
  console.log(`Unique fonts found: ${results.uniqueCount}`);
  console.log('\n=== TOP 10 FONTS BY FREQUENCY ===');
  
  const sortedFonts = Array.from(results.fontOccurrences.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  sortedFonts.forEach(([font, count], index) => {
    console.log(`${index + 1}. ${font} (${count} occurrences)`);
  });
  
  console.log('\n=== COMPONENT PARSING EXAMPLES ===');
  const exampleFonts = [
    'Helvetica Neue Bold Italic',
    'Roboto Condensed Medium',
    'Open Sans Light',
    'Gotham Screen Smart Bold'
  ];
  
  exampleFonts.forEach(font => {
    const components = parseFontComponents(font);
    console.log(`\n${font}:`);
    console.log(`  Base: ${components.baseName}`);
    console.log(`  Width: ${components.width || 'none'}`);
    console.log(`  Weight: ${components.weight || 'none'}`);
    console.log(`  Style: ${components.style || 'none'}`);
  });
  
  console.log('\n=== COMPARISON WITH AGENT RESULTS ===');
  console.log('Manual count: 243');
  console.log('Agent 1: 248');
  console.log('Agent 2: 234');
  console.log('Agent 3: 229');
  console.log(`Hybrid: ${results.uniqueCount}`);
  
} catch (error) {
  console.error('Error:', error);
}