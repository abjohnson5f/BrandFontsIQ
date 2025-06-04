/**
 * Column Detector
 * Intelligently detects company-related columns in various file formats
 */

import * as XLSX from 'xlsx';
import { ColumnMapping, CompanySourceColumns } from './types';

export class ColumnDetector {
  private headers: string[] = [];
  
  /**
   * Detects column indices from an Excel workbook
   */
  detectFromWorkbook(workbook: XLSX.WorkBook): ColumnMapping {
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    if (data.length === 0) {
      throw new Error('Empty workbook');
    }
    
    this.headers = data[0].map(h => (h || '').toString());
    return this.detectColumns();
  }
  
  /**
   * Detects column indices from headers array
   */
  detectFromHeaders(headers: string[]): ColumnMapping {
    this.headers = headers;
    return this.detectColumns();
  }
  
  private detectColumns(): ColumnMapping {
    const mapping: ColumnMapping = {
      websiteAppTitleIndex: -1,
      urlIndex: -1,
      appUrlIndex: -1,
      companyIndex: -1
    };
    
    // Find Website/App Title column
    mapping.websiteAppTitleIndex = this.findColumn([
      /website.*app.*title/i,
      /app.*title/i,
      /website.*title/i,
      /site.*title/i,
      /application.*name/i
    ]);
    
    // Find URL column (primary)
    mapping.urlIndex = this.findColumn([
      /^url$/i,
      /^website$/i,
      /^site$/i,
      /^web.*url/i,
      /^domain$/i
    ]);
    
    // Find App URL column
    mapping.appUrlIndex = this.findColumn([
      /app.*url/i,
      /mobile.*url/i,
      /application.*url/i,
      /bundle.*id/i,
      /app.*identifier/i
    ]);
    
    // Find Company column
    mapping.companyIndex = this.findColumn([
      /^company$/i,
      /^organization$/i,
      /^org$/i,
      /^client$/i,
      /^customer$/i,
      /^brand$/i
    ]);
    
    this.validateMapping(mapping);
    return mapping;
  }
  
  private findColumn(patterns: RegExp[]): number {
    for (const pattern of patterns) {
      const index = this.headers.findIndex(h => pattern.test(h));
      if (index >= 0) return index;
    }
    return -1;
  }
  
  private validateMapping(mapping: ColumnMapping): void {
    const required = [
      { name: 'Company', index: mapping.companyIndex },
      { name: 'URL or Website/App Title', index: Math.max(mapping.urlIndex, mapping.websiteAppTitleIndex) }
    ];
    
    const missing = required.filter(r => r.index < 0).map(r => r.name);
    if (missing.length > 0) {
      throw new Error(`Required columns not found: ${missing.join(', ')}`);
    }
  }
  
  /**
   * Get column names for a mapping
   */
  getColumnNames(mapping: ColumnMapping): CompanySourceColumns {
    return {
      websiteAppTitle: mapping.websiteAppTitleIndex >= 0 ? this.headers[mapping.websiteAppTitleIndex] : '',
      url: mapping.urlIndex >= 0 ? this.headers[mapping.urlIndex] : '',
      appUrl: mapping.appUrlIndex >= 0 ? this.headers[mapping.appUrlIndex] : '',
      companyColumn: mapping.companyIndex >= 0 ? this.headers[mapping.companyIndex] : ''
    };
  }
  
  /**
   * Utility to get Excel column letter from index
   */
  static getColumnLetter(index: number): string {
    return XLSX.utils.encode_col(index);
  }
}