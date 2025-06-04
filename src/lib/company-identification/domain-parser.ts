/**
 * Domain Parser
 * Extracts company information from URLs and domains
 */

export class DomainParser {
  // Common TLDs to remove when extracting company names
  private static readonly COMMON_TLDS = new Set([
    'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
    'co', 'io', 'app', 'dev', 'ai', 'cloud', 'tech',
    'biz', 'info', 'name', 'pro', 'mobi'
  ]);
  
  // Country code TLDs
  private static readonly COUNTRY_TLDS = new Set([
    'uk', 'us', 'ca', 'au', 'de', 'fr', 'jp', 'cn', 'in',
    'br', 'mx', 'es', 'it', 'nl', 'se', 'no', 'dk', 'fi'
  ]);
  
  // Common subdomain prefixes to ignore
  private static readonly IGNORE_SUBDOMAINS = new Set([
    'www', 'app', 'api', 'cdn', 'static', 'assets',
    'images', 'img', 'media', 'download', 'downloads',
    'm', 'mobile', 'amp'
  ]);
  
  /**
   * Parse a URL and extract potential company information
   */
  static parseUrl(url: string): {
    domain: string;
    subdomain?: string;
    tld: string;
    potentialCompany: string;
    isSubdomain: boolean;
  } | null {
    if (!url) return null;
    
    try {
      // Clean and normalize URL
      let cleanUrl = url.trim().toLowerCase();
      if (!cleanUrl.match(/^https?:\/\//)) {
        cleanUrl = 'https://' + cleanUrl;
      }
      
      const urlObj = new URL(cleanUrl);
      const hostname = urlObj.hostname;
      
      // Split hostname into parts
      const parts = hostname.split('.');
      if (parts.length < 2) return null;
      
      // Identify TLD (might be compound like .co.uk)
      let tldParts: string[] = [];
      let domainParts: string[] = [];
      let foundTld = false;
      
      // Work backwards to find TLD
      for (let i = parts.length - 1; i >= 0; i--) {
        if (!foundTld) {
          tldParts.unshift(parts[i]);
          if (this.COMMON_TLDS.has(parts[i]) || this.COUNTRY_TLDS.has(parts[i])) {
            // Check if previous part is also a TLD component (like 'co' in .co.uk)
            if (i > 0 && (parts[i-1] === 'co' || parts[i-1] === 'com' || parts[i-1] === 'net')) {
              tldParts.unshift(parts[i-1]);
              i--;
            }
            foundTld = true;
          }
        } else {
          domainParts.unshift(parts[i]);
        }
      }
      
      if (domainParts.length === 0) return null;
      
      // Extract main domain and potential subdomain
      const mainDomain = domainParts[domainParts.length - 1];
      const subdomain = domainParts.length > 1 ? domainParts.slice(0, -1).join('.') : undefined;
      const isSubdomain = !!subdomain && !this.IGNORE_SUBDOMAINS.has(subdomain.split('.')[0]);
      
      // Extract potential company name
      const potentialCompany = this.extractCompanyName(mainDomain, subdomain);
      
      return {
        domain: hostname,
        subdomain: isSubdomain ? subdomain : undefined,
        tld: tldParts.join('.'),
        potentialCompany,
        isSubdomain
      };
    } catch (error) {
      // Invalid URL
      return null;
    }
  }
  
  /**
   * Extract company name from domain parts
   */
  private static extractCompanyName(mainDomain: string, subdomain?: string): string {
    // If we have a meaningful subdomain, it might be the company
    if (subdomain && !this.IGNORE_SUBDOMAINS.has(subdomain)) {
      // Check if subdomain contains company indicator
      if (subdomain.includes('brands') || subdomain.includes('group')) {
        return this.cleanCompanyName(mainDomain);
      }
      // Otherwise, subdomain might be the division
      return this.cleanCompanyName(subdomain);
    }
    
    return this.cleanCompanyName(mainDomain);
  }
  
  /**
   * Clean and format company name
   */
  private static cleanCompanyName(name: string): string {
    // Remove common suffixes
    let cleaned = name
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\d+$/, '') // Remove trailing numbers
      .trim();
    
    // Capitalize each word
    cleaned = cleaned.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return cleaned;
  }
  
  /**
   * Extract company from app bundle ID
   */
  static parseAppBundleId(bundleId: string): {
    company: string;
    appName: string;
  } | null {
    if (!bundleId) return null;
    
    // Common patterns: com.company.appname, company.appname
    const parts = bundleId.toLowerCase().split('.');
    if (parts.length < 2) return null;
    
    // Skip common prefixes
    const skipPrefixes = ['com', 'org', 'net', 'io', 'app'];
    let startIdx = 0;
    if (skipPrefixes.includes(parts[0])) {
      startIdx = 1;
    }
    
    if (parts.length - startIdx < 1) return null;
    
    const company = this.cleanCompanyName(parts[startIdx]);
    const appName = parts.length > startIdx + 1 
      ? this.cleanCompanyName(parts.slice(startIdx + 1).join(' '))
      : '';
    
    return { company, appName };
  }
  
  /**
   * Check if a domain matches a pattern
   */
  static domainMatches(domain: string, pattern: string): boolean {
    // Convert pattern to regex (support wildcards)
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*');
    
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(domain);
  }
}