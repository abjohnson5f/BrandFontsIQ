/**
 * Domain Intelligence Module
 * 
 * Teaches the system to understand international domain patterns
 * without hardcoding specific companies
 */

export interface DomainIntelligence {
  baseDomain: string;
  tld: string;
  isInternational: boolean;
  countryCode?: string;
  canonicalForm?: string;
}

// Common international TLDs and their patterns
const INTERNATIONAL_TLDS = {
  // Country codes
  'mx': { country: 'Mexico', type: 'country' },
  'ca': { country: 'Canada', type: 'country' },
  'uk': { country: 'United Kingdom', type: 'country' },
  'fr': { country: 'France', type: 'country' },
  'de': { country: 'Germany', type: 'country' },
  'jp': { country: 'Japan', type: 'country' },
  'cn': { country: 'China', type: 'country' },
  'br': { country: 'Brazil', type: 'country' },
  'au': { country: 'Australia', type: 'country' },
  'id': { country: 'Indonesia', type: 'country' },
  'se': { country: 'Sweden', type: 'country' },
  'ph': { country: 'Philippines', type: 'country' },
  
  // Compound TLDs
  'com.mx': { country: 'Mexico', type: 'compound' },
  'com.cn': { country: 'China', type: 'compound' },
  'com.br': { country: 'Brazil', type: 'compound' },
  'com.au': { country: 'Australia', type: 'compound' },
  'com.ph': { country: 'Philippines', type: 'compound' },
  'uk.com': { country: 'United Kingdom', type: 'compound' },
  'jpn.com': { country: 'Japan', type: 'compound' },
};

/**
 * Common subdomains that are typically infrastructure/service related
 */
const COMMON_SUBDOMAINS = [
  'www', 'ftp', 'mail', 'email', 'smtp', 'pop', 'imap',
  'blog', 'shop', 'store', 'api', 'app', 'mobile',
  'cdn', 'static', 'assets', 'images', 'img',
  'dev', 'test', 'staging', 'demo', 'sandbox',
  'portal', 'login', 'auth', 'secure', 'my',
  'support', 'help', 'docs', 'wiki',
  'news', 'media', 'press'
];

/**
 * Analyze a domain to extract intelligence about it
 */
export function analyzeDomain(url: string): DomainIntelligence {
  // Normalize
  const normalized = url.toLowerCase()
    .replace(/^(https?|ftp):\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];
    
  const parts = normalized.split('.');
  
  // Handle subdomains intelligently
  let effectiveDomain = normalized;
  let hasCommonSubdomain = false;
  
  if (parts.length > 2) {
    // Check if first part is a common subdomain
    if (COMMON_SUBDOMAINS.includes(parts[0])) {
      hasCommonSubdomain = true;
      effectiveDomain = parts.slice(1).join('.');
      parts.shift(); // Remove the common subdomain for analysis
    }
  }
  
  // Check for compound TLDs first (e.g., .com.mx)
  if (parts.length >= 3) {
    const lastTwo = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
    if (INTERNATIONAL_TLDS[lastTwo]) {
      const baseDomain = parts.slice(0, -2).join('.');
      return {
        baseDomain: baseDomain,
        tld: lastTwo,
        isInternational: true,
        countryCode: INTERNATIONAL_TLDS[lastTwo].country,
        canonicalForm: `${baseDomain}.com`
      };
    }
  }
  
  // Check for simple country TLDs
  if (parts.length >= 2) {
    const tld = parts[parts.length - 1];
    if (INTERNATIONAL_TLDS[tld] && tld !== 'com') {
      const baseDomain = parts.slice(0, -1).join('.');
      return {
        baseDomain: baseDomain,
        tld: tld,
        isInternational: true,
        countryCode: INTERNATIONAL_TLDS[tld].country,
        canonicalForm: `${baseDomain}.com`
      };
    }
  }
  
  // Standard domain - smart handling of subdomains
  if (parts.length > 2 && !hasCommonSubdomain) {
    // This might be a meaningful subdomain like "burke.nationjob.com"
    // Return the second-level domain as the base
    return {
      baseDomain: parts.slice(-2, -1)[0], // e.g., "nationjob" from "burke.nationjob.com"
      tld: parts[parts.length - 1],
      isInternational: false
    };
  }
  
  return {
    baseDomain: parts.slice(0, -1).join('.'),
    tld: parts[parts.length - 1],
    isInternational: false
  };
}

/**
 * Pattern matching order for domain variations
 * 
 * Given a domain, generate patterns to check in order of specificity
 */
export function generatePatternHierarchy(url: string): string[] {
  const patterns: string[] = [];
  const domainInfo = analyzeDomain(url);
  
  // 1. Exact match (most specific)
  const normalized = url.toLowerCase()
    .replace(/^(https?|ftp):\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];
  patterns.push(normalized);
  
  // 2. If it has a common subdomain, try without it
  const parts = normalized.split('.');
  if (parts.length > 2 && COMMON_SUBDOMAINS.includes(parts[0])) {
    const withoutSubdomain = parts.slice(1).join('.');
    patterns.push(withoutSubdomain);
    
    // Also try just the main domain if it's something like "ftp.applegate.com"
    if (parts.length === 3) {
      patterns.push(parts[1]); // "applegate"
    }
  }
  
  // 3. If international, try canonical form
  if (domainInfo.isInternational && domainInfo.canonicalForm) {
    patterns.push(domainInfo.canonicalForm);
  }
  
  // 4. Base domain only
  if (domainInfo.baseDomain) {
    patterns.push(domainInfo.baseDomain);
  }
  
  // 5. For meaningful subdomains (like burke.nationjob.com), extract parts intelligently
  if (parts.length > 2 && !COMMON_SUBDOMAINS.includes(parts[0])) {
    // First segment might be important (e.g., "burke")
    patterns.push(parts[0]);
    
    // Parent domain might be the company (e.g., "nationjob")
    const parentDomain = parts.slice(1, -1).join('.');
    if (parentDomain) {
      patterns.push(parentDomain);
    }
  }
  
  return [...new Set(patterns)]; // Remove duplicates while preserving order
}

/**
 * Determine if two URLs likely represent the same company
 * based on domain intelligence
 */
export function areLikelyRelated(url1: string, url2: string): boolean {
  const domain1 = analyzeDomain(url1);
  const domain2 = analyzeDomain(url2);
  
  // Same base domain?
  if (domain1.baseDomain === domain2.baseDomain) {
    return true;
  }
  
  // One is international variant of the other?
  if (domain1.canonicalForm === url2 || domain2.canonicalForm === url1) {
    return true;
  }
  
  // Both have same canonical form?
  if (domain1.canonicalForm && domain1.canonicalForm === domain2.canonicalForm) {
    return true;
  }
  
  return false;
}

/**
 * Enhanced pattern extraction for learning system
 * Returns patterns in order of specificity
 */
export function extractSmartPatterns(url: string): {
  pattern: string;
  type: 'exact' | 'canonical' | 'base' | 'segment';
  confidence: number;
}[] {
  const patterns: Array<{pattern: string; type: any; confidence: number}> = [];
  const domainInfo = analyzeDomain(url);
  const hierarchy = generatePatternHierarchy(url);
  
  hierarchy.forEach((pattern, index) => {
    let type: 'exact' | 'canonical' | 'base' | 'segment' = 'exact';
    let confidence = 1 - (index * 0.1); // Decrease confidence as we get less specific
    
    if (index === 0) type = 'exact';
    else if (domainInfo.canonicalForm && pattern === domainInfo.canonicalForm) type = 'canonical';
    else if (pattern === domainInfo.baseDomain) type = 'base';
    else type = 'segment';
    
    patterns.push({ pattern, type, confidence: Math.max(0.5, confidence) });
  });
  
  return patterns;
}