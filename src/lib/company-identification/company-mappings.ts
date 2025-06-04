/**
 * Company Mappings
 * Predefined mappings for known companies and their subsidiaries
 */

import { CompanyHierarchy, SubsidiaryInfo } from './types';

export class CompanyMappings {
  private static hierarchies: Map<string, CompanyHierarchy> = new Map();
  
  // Initialize with known mappings
  static {
    this.initializeKnownMappings();
  }
  
  private static initializeKnownMappings(): void {
    // Polaris Inc hierarchy
    this.addHierarchy({
      parentCompany: 'Polaris Inc',
      subsidiaries: new Map([
        ['Polaris Digital Division', {
          name: 'Polaris Digital Division',
          parentCompany: 'Polaris Inc',
          identifiers: {
            domains: ['polarisdigital.com', '*.polaris.io', 'experience.polaris.*'],
            keywords: ['polaris digital', 'polaris connect', 'polaris experience'],
            bundleIds: ['com.polaris.experience', 'com.polarisdigital.*']
          }
        }],
        ['Polaris Subsidiary Alpha', {
          name: 'Polaris Subsidiary Alpha',
          parentCompany: 'Polaris Inc',
          identifiers: {
            domains: ['alpha.polarisbrands.com', '*.alpha.polaris.*'],
            keywords: ['polaris alpha'],
            bundleIds: ['com.polarisbrands.alpha']
          }
        }],
        ['Polaris Subsidiary Beta', {
          name: 'Polaris Subsidiary Beta',
          parentCompany: 'Polaris Inc',
          identifiers: {
            domains: ['beta.polarisbrands.com'],
            keywords: ['polaris beta']
          }
        }]
      ]),
      domainPatterns: new Map([
        ['polaris.com', 'Polaris Inc'],
        ['polarisind.com', 'Polaris Inc'],
        ['*.polaris.com', 'Polaris Inc'],
        ['polarisdigital.com', 'Polaris Digital Division'],
        ['*.polaris.io', 'Polaris Digital Division']
      ]),
      titleKeywords: new Map([
        ['polaris', 'Polaris Inc'],
        ['polaris digital', 'Polaris Digital Division'],
        ['polaris alpha', 'Polaris Subsidiary Alpha']
      ]),
      appBundleIds: new Map([
        ['com.polaris.*', 'Polaris Inc'],
        ['com.polarisdigital.*', 'Polaris Digital Division']
      ])
    });
    
    // Add more known company hierarchies here
    this.addCommonCompanies();
  }
  
  private static addCommonCompanies(): void {
    // Common companies and their patterns
    const commonMappings = [
      {
        company: 'Google',
        parent: 'Alphabet Inc',
        domains: ['google.com', '*.google.com', 'googleapis.com', 'gstatic.com'],
        bundles: ['com.google.*']
      },
      {
        company: 'Facebook',
        parent: 'Meta Platforms Inc',
        domains: ['facebook.com', '*.facebook.com', 'fb.com', 'fbcdn.net'],
        bundles: ['com.facebook.*']
      },
      {
        company: 'Amazon',
        parent: 'Amazon.com Inc',
        domains: ['amazon.com', '*.amazon.com', 'amazonaws.com', 'aws.com'],
        bundles: ['com.amazon.*']
      },
      {
        company: 'Microsoft',
        parent: 'Microsoft Corporation',
        domains: ['microsoft.com', '*.microsoft.com', 'msn.com', 'live.com', 'office.com'],
        bundles: ['com.microsoft.*']
      },
      {
        company: 'Apple',
        parent: 'Apple Inc',
        domains: ['apple.com', '*.apple.com', 'icloud.com'],
        bundles: ['com.apple.*']
      }
    ];
    
    // Add common mappings
    commonMappings.forEach(mapping => {
      const hierarchy: CompanyHierarchy = {
        parentCompany: mapping.parent,
        subsidiaries: new Map([[mapping.company, {
          name: mapping.company,
          parentCompany: mapping.parent,
          identifiers: {
            domains: mapping.domains,
            bundleIds: mapping.bundles
          }
        }]]),
        domainPatterns: new Map(mapping.domains.map(d => [d, mapping.company])),
        titleKeywords: new Map([[mapping.company.toLowerCase(), mapping.company]]),
        appBundleIds: new Map(mapping.bundles.map(b => [b, mapping.company]))
      };
      
      this.hierarchies.set(mapping.parent, hierarchy);
    });
  }
  
  private static addHierarchy(hierarchy: CompanyHierarchy): void {
    this.hierarchies.set(hierarchy.parentCompany, hierarchy);
  }
  
  /**
   * Find company by domain
   */
  static findByDomain(domain: string): { company: string; parent?: string } | null {
    for (const [parent, hierarchy] of this.hierarchies) {
      for (const [pattern, company] of hierarchy.domainPatterns) {
        if (this.matchesPattern(domain, pattern)) {
          return {
            company,
            parent: company !== parent ? parent : undefined
          };
        }
      }
    }
    return null;
  }
  
  /**
   * Find company by app bundle ID
   */
  static findByBundleId(bundleId: string): { company: string; parent?: string } | null {
    for (const [parent, hierarchy] of this.hierarchies) {
      for (const [pattern, company] of hierarchy.appBundleIds) {
        if (this.matchesPattern(bundleId, pattern)) {
          return {
            company,
            parent: company !== parent ? parent : undefined
          };
        }
      }
    }
    return null;
  }
  
  /**
   * Find company by keywords in title
   */
  static findByKeywords(title: string): { company: string; parent?: string } | null {
    const lowerTitle = title.toLowerCase();
    
    // Check exact keyword matches first
    for (const [parent, hierarchy] of this.hierarchies) {
      for (const [keyword, company] of hierarchy.titleKeywords) {
        if (lowerTitle.includes(keyword)) {
          return {
            company,
            parent: company !== parent ? parent : undefined
          };
        }
      }
    }
    return null;
  }
  
  /**
   * Add custom company mapping
   */
  static addCustomMapping(
    parentCompany: string,
    subsidiary: string,
    identifiers: {
      domains?: string[];
      keywords?: string[];
      bundleIds?: string[];
    }
  ): void {
    let hierarchy = this.hierarchies.get(parentCompany);
    
    if (!hierarchy) {
      hierarchy = {
        parentCompany,
        subsidiaries: new Map(),
        domainPatterns: new Map(),
        titleKeywords: new Map(),
        appBundleIds: new Map()
      };
      this.hierarchies.set(parentCompany, hierarchy);
    }
    
    // Add subsidiary
    hierarchy.subsidiaries.set(subsidiary, {
      name: subsidiary,
      parentCompany,
      identifiers
    });
    
    // Update patterns
    identifiers.domains?.forEach(d => hierarchy.domainPatterns.set(d, subsidiary));
    identifiers.keywords?.forEach(k => hierarchy.titleKeywords.set(k.toLowerCase(), subsidiary));
    identifiers.bundleIds?.forEach(b => hierarchy.appBundleIds.set(b, subsidiary));
  }
  
  /**
   * Check if a string matches a pattern (supports wildcards)
   */
  private static matchesPattern(str: string, pattern: string): boolean {
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*');
    
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(str);
  }
  
  /**
   * Get all known parent companies
   */
  static getAllParentCompanies(): string[] {
    return Array.from(this.hierarchies.keys());
  }
  
  /**
   * Get hierarchy for a parent company
   */
  static getHierarchy(parentCompany: string): CompanyHierarchy | undefined {
    return this.hierarchies.get(parentCompany);
  }
}