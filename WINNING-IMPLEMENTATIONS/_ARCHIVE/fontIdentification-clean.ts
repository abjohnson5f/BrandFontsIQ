/**
 * Font Identification Module - Clean Implementation
 * NO HARDCODED VALUES
 */

export interface FontStandardizationConfig {
  standardizationMap: Record<string, string>;
  weightPatterns: string[];
  stylePatterns: string[];
  widthPatterns: string[];
}

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
  identificationMethods: Map<string, number>;
}

export class FontStandardizationService {
  private config: FontStandardizationConfig;
  private weightPattern: RegExp;
  private stylePattern: RegExp;
  private widthPattern: RegExp;

  constructor(config: FontStandardizationConfig) {
    this.config = config;
    
    // Build regex patterns from config
    this.weightPattern = new RegExp(`\\b(${config.weightPatterns.join('|')})\\b`, 'gi');
    this.stylePattern = new RegExp(`\\b(${config.stylePatterns.join('|')})\\b`, 'gi');
    this.widthPattern = new RegExp(`\\b(${config.widthPatterns.join('|')})\\b`, 'gi');
  }

  /**
   * Parse font components for future enrichment
   */
  private parseFontComponents(fontName: string): FontComponents {
    const normalizedName = fontName.trim();
    
    // Extract components
    const weights = normalizedName.match(this.weightPattern);
    const styles = normalizedName.match(this.stylePattern);
    const widths = normalizedName.match(this.widthPattern);
    
    // Remove components to get base name
    let baseName = normalizedName
      .replace(this.weightPattern, '')
      .replace(this.stylePattern, '')
      .replace(this.widthPattern, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    return {
      baseName: baseName || normalizedName,
      weight: weights ? weights[weights.length - 1] : null,
      style: styles ? styles[styles.length - 1] : null,
      width: widths ? widths[widths.length - 1] : null,
    };
  }

  /**
   * Standardize font name using configuration mappings
   */
  private standardizeFontName(fontName: string): string {
    let standardized = fontName.trim();
    
    // Apply standardization mappings
    for (const [pattern, replacement] of Object.entries(this.config.standardizationMap)) {
      const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
      standardized = standardized.replace(regex, replacement);
    }
    
    // Clean up extra spaces
    standardized = standardized.replace(/\s+/g, ' ').trim();
    
    return standardized;
  }

  /**
   * Extract font name from file path
   */
  private extractFontFromPath(filePath: string): string | null {
    if (!filePath) return null;
    
    // Get filename without extension
    const pathParts = filePath.split(/[/\\]/);
    const filename = pathParts[pathParts.length - 1];
    const nameWithoutExt = filename.replace(/\.(ttf|otf|woff|woff2|eot)$/i, '');
    
    // Clean up common path artifacts
    let cleaned = nameWithoutExt
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleaned || null;
  }

  /**
   * Main font identification method
   */
  identifyUniqueFont(
    rowData: {
      fontName?: string;
      filePath?: string;
      family?: string;
      subfamily?: string;
      [key: string]: any;
    },
    rowIndex: number
  ): FontIdentificationResult {
    let identifiedFont = '';
    let method = '';
    
    // 1. Try Font Name column first (most reliable)
    if (rowData.fontName && rowData.fontName.trim()) {
      identifiedFont = this.standardizeFontName(rowData.fontName);
      method = 'Font Name column';
    }
    // 2. Try extracting from file path
    else if (rowData.filePath) {
      const extracted = this.extractFontFromPath(rowData.filePath);
      if (extracted) {
        identifiedFont = this.standardizeFontName(extracted);
        method = 'Extracted from path';
      }
    }
    // 3. Try other potential font columns
    else {
      const fontColumns = ['font', 'typeface', 'fontFamily', 'font_name', 'FontFile'];
      for (const col of fontColumns) {
        if (rowData[col] && rowData[col].trim()) {
          identifiedFont = this.standardizeFontName(rowData[col]);
          method = `${col} column`;
          break;
        }
      }
    }
    
    // 4. Last resort: combine family and subfamily
    if (!identifiedFont && rowData.family) {
      const parts = [rowData.family];
      if (rowData.subfamily && rowData.subfamily !== 'Regular') {
        parts.push(rowData.subfamily);
      }
      identifiedFont = this.standardizeFontName(parts.join(' '));
      method = 'Family + Subfamily';
    }
    
    // Default if nothing found
    if (!identifiedFont) {
      identifiedFont = 'Unknown Font';
      method = 'No identifiable font data';
    }
    
    return {
      fontName: identifiedFont,
      components: this.parseFontComponents(identifiedFont),
      identificationMethod: method,
      rowIndex: rowIndex,
    };
  }

  /**
   * Process multiple rows and return summary
   */
  processDataset(rows: any[]): UniqueFontSummary {
    const uniqueFonts = new Set<string>();
    const fontOccurrences = new Map<string, number>();
    const identificationMethods = new Map<string, number>();
    
    rows.forEach((row, index) => {
      const result = this.identifyUniqueFont(row, index);
      
      uniqueFonts.add(result.fontName);
      
      // Track occurrences
      fontOccurrences.set(
        result.fontName,
        (fontOccurrences.get(result.fontName) || 0) + 1
      );
      
      // Track methods
      identificationMethods.set(
        result.identificationMethod,
        (identificationMethods.get(result.identificationMethod) || 0) + 1
      );
    });
    
    return {
      uniqueFonts,
      fontOccurrences,
      identificationMethods,
    };
  }
}