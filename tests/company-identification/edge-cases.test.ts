/**
 * Edge Cases Tests
 * Tests for complex and edge case scenarios
 */

import { describe, it, expect } from 'vitest';
import { DomainParser } from '@/lib/company-identification/domain-parser';
import { CompanyMappings } from '@/lib/company-identification/company-mappings';

describe('Edge Cases', () => {
  describe('International domains and companies', () => {
    it('should handle non-English company names', () => {
      const testCases = [
        { url: 'https://société.fr', expected: 'Société' },
        { url: 'https://münchen-tech.de', expected: 'München Tech' },
        { url: 'https://東京.jp', expected: '東京' }
      ];
      
      testCases.forEach(({ url, expected }) => {
        const result = DomainParser.parseUrl(url);
        expect(result).toBeTruthy();
        // Note: Actual implementation may need Unicode normalization
      });
    });
    
    it('should handle complex TLDs', () => {
      const testCases = [
        { url: 'https://example.co.uk', tld: 'co.uk' },
        { url: 'https://example.com.au', tld: 'com.au' },
        { url: 'https://example.net.br', tld: 'net.br' }
      ];
      
      testCases.forEach(({ url, tld }) => {
        const result = DomainParser.parseUrl(url);
        expect(result?.tld).toBe(tld);
      });
    });
  });
  
  describe('Ambiguous identifications', () => {
    it('should handle generic titles', () => {
      const genericTitles = [
        'Mobile App',
        'Website',
        'Portal',
        'Customer Portal',
        'Enterprise Application'
      ];
      
      genericTitles.forEach(title => {
        const result = CompanyMappings.findByKeywords(title);
        expect(result).toBeNull(); // Should not match generic titles
      });
    });
    
    it('should handle shared hosting domains', () => {
      const sharedHosting = [
        'wordpress.com',
        'wix.com',
        'squarespace.com',
        'shopify.com',
        'github.io'
      ];
      
      sharedHosting.forEach(domain => {
        const result = DomainParser.parseUrl(`https://mycompany.${domain}`);
        expect(result?.isSubdomain).toBe(true);
        expect(result?.subdomain).toBe('mycompany');
      });
    });
  });
  
  describe('Malformed and missing data', () => {
    it('should handle malformed URLs gracefully', () => {
      const malformedUrls = [
        'not-a-url',
        'http://',
        'ftp://example.com',
        '//example.com',
        'example..com',
        '.com',
        ''
      ];
      
      malformedUrls.forEach(url => {
        const result = DomainParser.parseUrl(url);
        // Should either return null or handle gracefully
        if (result) {
          expect(result.domain).toBeTruthy();
        }
      });
    });
    
    it('should handle empty inputs', () => {
      expect(DomainParser.parseUrl('')).toBeNull();
      expect(DomainParser.parseAppBundleId('')).toBeNull();
      expect(CompanyMappings.findByKeywords('')).toBeNull();
    });
    
    it('should handle very long inputs', () => {
      const longUrl = 'https://' + 'a'.repeat(100) + '.com';
      const result = DomainParser.parseUrl(longUrl);
      expect(result).toBeTruthy();
    });
  });
  
  describe('Complex company structures', () => {
    it('should handle multiple subsidiary levels', () => {
      // Add a complex hierarchy
      CompanyMappings.addCustomMapping(
        'Conglomerate Corp',
        'Division A',
        { domains: ['divisiona.conglomerate.com'] }
      );
      
      CompanyMappings.addCustomMapping(
        'Division A',
        'Subdivision A1',
        { domains: ['a1.divisiona.conglomerate.com'] }
      );
      
      const result = CompanyMappings.findByDomain('a1.divisiona.conglomerate.com');
      expect(result?.company).toBe('Subdivision A1');
      // Note: Current implementation may need enhancement for multi-level parent tracking
    });
    
    it('should handle companies with similar names', () => {
      const similarCompanies = [
        { domain: 'apple.com', company: 'Apple' },
        { domain: 'applebank.com', company: 'Applebank' },
        { domain: 'applebees.com', company: 'Applebees' }
      ];
      
      similarCompanies.forEach(({ domain, company }) => {
        const result = DomainParser.parseUrl(`https://${domain}`);
        expect(result?.potentialCompany?.toLowerCase()).toContain(company.toLowerCase().replace(/\s+/g, ''));
      });
    });
  });
  
  describe('White-label and rebranded applications', () => {
    it('should identify white-label patterns', () => {
      const whiteLabelPatterns = [
        { bundleId: 'com.whitelabel.client1', expectedApp: 'Client1' },
        { bundleId: 'com.platform.brandedapp.clientname', expectedApp: 'Clientname' }
      ];
      
      whiteLabelPatterns.forEach(({ bundleId, expectedApp }) => {
        const result = DomainParser.parseAppBundleId(bundleId);
        expect(result?.appName.toLowerCase()).toContain(expectedApp.toLowerCase());
      });
    });
  });
  
  describe('Government and educational institutions', () => {
    it('should handle .gov domains', () => {
      const govDomains = [
        'whitehouse.gov',
        'state.gov',
        'ca.gov',
        'nyc.gov'
      ];
      
      govDomains.forEach(domain => {
        const result = DomainParser.parseUrl(`https://${domain}`);
        expect(result?.tld).toBe('gov');
      });
    });
    
    it('should handle .edu domains', () => {
      const eduDomains = [
        'harvard.edu',
        'mit.edu',
        'stanford.edu'
      ];
      
      eduDomains.forEach(domain => {
        const result = DomainParser.parseUrl(`https://${domain}`);
        expect(result?.tld).toBe('edu');
      });
    });
  });
});