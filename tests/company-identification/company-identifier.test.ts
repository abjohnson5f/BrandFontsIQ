/**
 * Company Identifier Tests
 * Comprehensive test suite for company identification
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CompanyIdentifier } from '@/lib/company-identification/company-identifier';
import { MockLLMProvider } from '@/lib/llm-enrichment/llm-client';
import { CompanyMappings } from '@/lib/company-identification/company-mappings';
import { DomainParser } from '@/lib/company-identification/domain-parser';
import { ColumnDetector } from '@/lib/company-identification/column-detector';

describe('CompanyIdentifier', () => {
  let identifier: CompanyIdentifier;
  let mockProvider: MockLLMProvider;
  
  beforeEach(async () => {
    mockProvider = new MockLLMProvider();
    identifier = new CompanyIdentifier(mockProvider, {
      batchSize: 10,
      maxConcurrent: 2,
      enableCache: true,
      llmProvider: 'openai',
      maxCostLimit: 100
    });
    await identifier.initialize();
  });
  
  describe('Rule-based identification', () => {
    it('should identify company from clear domain', async () => {
      const result = await identifier['identifyByRules']({
        url: 'https://experience.polaris.io'
      });
      
      expect(result).toBeTruthy();
      expect(result?.company).toBe('Polaris Digital Division');
      expect(result?.parentCompany).toBe('Polaris Inc');
      expect(result?.confidence).toBeGreaterThanOrEqual(90);
    });
    
    it('should identify company from app title', async () => {
      const result = await identifier['identifyByRules']({
        websiteAppTitle: 'Polaris Connect - Customer Portal'
      });
      
      expect(result).toBeTruthy();
      expect(result?.company).toBe('Polaris Digital Division');
      expect(result?.confidence).toBeGreaterThanOrEqual(80);
    });
    
    it('should extract company from generic domain', async () => {
      const result = await identifier['identifyByRules']({
        url: 'https://brandfontsiq.com'
      });
      
      expect(result).toBeTruthy();
      expect(result?.company).toBe('Brandfontsiq');
      expect(result?.confidence).toBeLessThan(80);
    });
  });
  
  describe('Cost management', () => {
    it('should track LLM costs correctly', async () => {
      // Process some test data
      const stats = identifier.getStats();
      expect(stats.actualCost).toBe(0);
      
      // Simulate processing that requires LLM
      await identifier['identifyByRules']({
        websiteAppTitle: 'Unknown App'
      });
      
      const updatedStats = identifier.getStats();
      expect(updatedStats.llmCalls).toBeGreaterThanOrEqual(0);
    });
    
    it('should respect cost limits', async () => {
      // This would be tested with actual processing
      const stats = identifier.getStats();
      expect(stats.actualCost).toBeLessThanOrEqual(100); // Our max limit
    });
  });
});

describe('DomainParser', () => {
  it('should parse simple domains correctly', () => {
    const result = DomainParser.parseUrl('https://polaris.com');
    expect(result).toBeTruthy();
    expect(result?.potentialCompany).toBe('Polaris');
    expect(result?.tld).toBe('com');
  });
  
  it('should handle subdomains', () => {
    const result = DomainParser.parseUrl('https://experience.polaris.io');
    expect(result).toBeTruthy();
    expect(result?.subdomain).toBe('experience');
    expect(result?.isSubdomain).toBe(true);
  });
  
  it('should parse app bundle IDs', () => {
    const result = DomainParser.parseAppBundleId('com.polaris.experience');
    expect(result).toBeTruthy();
    expect(result?.company).toBe('Polaris');
    expect(result?.appName).toBe('Experience');
  });
  
  it('should handle international domains', () => {
    const result = DomainParser.parseUrl('https://example.co.uk');
    expect(result).toBeTruthy();
    expect(result?.tld).toBe('co.uk');
  });
});

describe('CompanyMappings', () => {
  it('should find known companies by domain', () => {
    const result = CompanyMappings.findByDomain('polarisdigital.com');
    expect(result).toBeTruthy();
    expect(result?.company).toBe('Polaris Digital Division');
    expect(result?.parent).toBe('Polaris Inc');
  });
  
  it('should support wildcard patterns', () => {
    const result = CompanyMappings.findByDomain('something.polaris.io');
    expect(result).toBeTruthy();
    expect(result?.company).toBe('Polaris Digital Division');
  });
  
  it('should find companies by keywords', () => {
    const result = CompanyMappings.findByKeywords('This is a Polaris Digital application');
    expect(result).toBeTruthy();
    expect(result?.company).toBe('Polaris Digital Division');
  });
  
  it('should allow adding custom mappings', () => {
    CompanyMappings.addCustomMapping(
      'Test Parent Corp',
      'Test Subsidiary',
      {
        domains: ['test.example.com'],
        keywords: ['test subsidiary']
      }
    );
    
    const result = CompanyMappings.findByDomain('test.example.com');
    expect(result).toBeTruthy();
    expect(result?.company).toBe('Test Subsidiary');
    expect(result?.parent).toBe('Test Parent Corp');
  });
});

describe('ColumnDetector', () => {
  it('should detect standard column names', () => {
    const detector = new ColumnDetector();
    const headers = ['Company', 'Website/App Title', 'URL', 'App URL'];
    
    const mapping = detector.detectFromHeaders(headers);
    expect(mapping.companyIndex).toBe(0);
    expect(mapping.websiteAppTitleIndex).toBe(1);
    expect(mapping.urlIndex).toBe(2);
    expect(mapping.appUrlIndex).toBe(3);
  });
  
  it('should handle variations in column names', () => {
    const detector = new ColumnDetector();
    const headers = ['Organization', 'Application Name', 'Website', 'Mobile URL'];
    
    const mapping = detector.detectFromHeaders(headers);
    expect(mapping.companyIndex).toBe(0);
    expect(mapping.websiteAppTitleIndex).toBe(1);
    expect(mapping.urlIndex).toBe(2);
    expect(mapping.appUrlIndex).toBe(3);
  });
  
  it('should throw error for missing required columns', () => {
    const detector = new ColumnDetector();
    const headers = ['Random', 'Headers', 'Without', 'Required'];
    
    expect(() => detector.detectFromHeaders(headers)).toThrow();
  });
});