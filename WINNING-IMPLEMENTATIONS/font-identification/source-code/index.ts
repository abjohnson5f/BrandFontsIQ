/**
 * Font Identification Module - Hybrid Implementation
 * 
 * Combines:
 * - Agent 1's conservative standardization (base - closest to manual count)
 * - Agent 2's component parsing (for future font anatomy enrichment)
 * 
 * This approach maintains accuracy while preparing for advanced analysis.
 */

import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

// Load configuration from file (NO HARDCODED VALUES - Immutable Truth #2)
const configPath = path.join(__dirname, '../../configuration.json');
let config: any;

try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (error) {
  console.error('Failed to load configuration:', error);
  config = {
    fontStandardization: {
      standardizationMap: {}
    }
  };
  console.warn('Using empty configuration - font standardization will use defaults only');
}

// Validate configuration structure
if (!config.fontStandardization) {
  config.fontStandardization = { standardizationMap: {} };
}
if (!config.fontStandardization.standardizationMap) {
  config.fontStandardization.standardizationMap = {};
}

// Font component patterns from Agent 2
const weightPattern = /\b(Ultra\s*Light|Extra\s*Light|Thin|Light|Regular|Medium|Demi\s*Bold|Semi[\s-]?Bold|Bold|Extra\s*Bold|Heavy|Black)\b/gi;
const stylePattern = /\b(Italic|Oblique|Roman)\b/gi;
const widthPattern = /\b(Condensed|Extended|Narrow|Wide)\b/gi;

export interface FontComponents {
  baseName: string;
  weight: string | null;
  style: string | null;
  width: string | null;
}

export interface FontIdentificationResult {
  fontName: string;
  components: FontComponents;
  identificationMethod: string;
  rowIndex: number;
}

export interface UniqueFontSummary {
  uniqueFonts: Set<string>;
  fontOccurrences: Map<string, number>;
  processedRows: FontIdentificationResult[];
  totalRows: number;
  uniqueCount: number;
}

/**
 * Parse font components for future anatomy analysis
 * From Agent 2 - essential for Sprint 4
 */
export function parseFontComponents(fontName: string): FontComponents | null {
  if (!fontName) return null;
  
  let baseName = fontName;
  const components: Omit<FontComponents, 'baseName'> = {
    weight: null,
    style: null,
    width: null
  };
  
  // Extract weight
  const weightMatch = fontName.match(weightPattern);
  if (weightMatch) {
    components.weight = weightMatch[weightMatch.length - 1]; // Take last match
    baseName = baseName.replace(weightPattern, '').trim();
  }
  
  // Extract style
  const styleMatch = fontName.match(stylePattern);
  if (styleMatch) {
    components.style = styleMatch[0];
    baseName = baseName.replace(stylePattern, '').trim();
  }
  
  // Extract width
  const widthMatch = fontName.match(widthPattern);
  if (widthMatch) {
    components.width = widthMatch[0];
    baseName = baseName.replace(widthPattern, '').trim();
  }
  
  // Clean up base name
  baseName = baseName.replace(/\s+/g, ' ').trim();
  
  return { baseName, ...components };
}

/**
 * Standardize font name using Agent 1's conservative approach
 */
export function standardizeFontName(fontName: string): string | null {
  if (!fontName) return null;
  
  let standardized = fontName.trim();
  
  // Apply standardization mappings from configuration
  for (const [key, value] of Object.entries(config.fontStandardization.standardizationMap)) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    standardized = standardized.replace(regex, value as string);
  }
  
  // Clean up extra spaces
  standardized = standardized.replace(/\s+/g, ' ').trim();
  
  return standardized;
}

/**
 * Extract font name from file path
 */
export function extractFontFromPath(filePath: string): string | null {
  if (!filePath) return null;
  
  // Extract filename without extension
  const filename = path.basename(filePath, path.extname(filePath));
  
  // Convert camelCase and hyphenated names to spaces
  let fontName = filename
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .trim();
  
  return standardizeFontName(fontName);
}

/**
 * Combine family and subfamily
 */
export function combineFamilySubfamily(family: string, subfamily?: string): string | null {
  if (!family) return null;
  
  const parts = [family];
  if (subfamily && subfamily.toLowerCase() !== 'regular') {
    parts.push(subfamily);
  }
  
  return standardizeFontName(parts.join(' '));
}

/**
 * Main function to identify unique fonts
 */
export function identifyUniqueFonts(data: any[]): UniqueFontSummary {
  const uniqueFonts = new Set<string>();
  const fontOccurrences = new Map<string, number>();
  const processedRows: FontIdentificationResult[] = [];
  
  data.forEach((row, index) => {
    let identifiedFont: string | null = null;
    let identificationMethod: string | null = null;
    
    // 1. Try Font Name column first (various possible column names)
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
    
    // 3. Try other columns that might contain font info
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
          // Check if it looks like a font name
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
    
    // 4. Try family + subfamily combination
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
    
    // Default if nothing found
    if (!identifiedFont) {
      identifiedFont = 'Unknown Font';
      identificationMethod = 'Default';
    }
    
    // Parse components for future use
    const components = parseFontComponents(identifiedFont) || {
      baseName: identifiedFont,
      weight: null,
      style: null,
      width: null
    };
    
    // Add to results
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

/**
 * Process Excel file and return unique fonts summary
 */
export async function processExcelFile(filePath: string): Promise<UniqueFontSummary> {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  return identifyUniqueFonts(data);
}

/**
 * Export functions for testing and future sprints
 */
export const FontIdentification = {
  processExcelFile,
  identifyUniqueFonts,
  parseFontComponents,
  standardizeFontName,
  extractFontFromPath,
  combineFamilySubfamily
};