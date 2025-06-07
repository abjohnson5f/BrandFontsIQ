/**
 * Intelligent Learning Module
 * 
 * Enhances the learning system with cross-domain pattern recognition
 * and proactive pattern generation
 */

import { analyzeDomain, generatePatternHierarchy, areLikelyRelated } from './domain-intelligence';
import { recordSuccessfulIdentification } from './learning-system';
import { CompanyData, CompanyIdentificationResult } from './index';

/**
 * Learn from a batch of results intelligently
 * This function analyzes patterns across all results to learn more effectively
 */
export function learnFromBatch(
  dataArray: CompanyData[],
  results: CompanyIdentificationResult[]
): void {
  // Build a map of successful identifications
  const successfulIdentifications = new Map<string, {
    company: string;
    parentCompany?: string;
    confidence: number;
    urls: string[];
  }>();

  // First pass: collect all successful identifications
  results.forEach((result, index) => {
    if (result.company !== 'Unknown' && result.confidence >= 0.8) {
      const key = result.company;
      if (!successfulIdentifications.has(key)) {
        successfulIdentifications.set(key, {
          company: result.company,
          parentCompany: result.parentCompany,
          confidence: result.confidence,
          urls: []
        });
      }
      successfulIdentifications.get(key)!.urls.push(dataArray[index].url);
    }
  });

  // Second pass: learn patterns and find related domains
  successfulIdentifications.forEach((identification) => {
    const { company, parentCompany, urls } = identification;
    
    // Analyze all URLs for this company to find common patterns
    const domainPatterns = new Map<string, number>();
    
    urls.forEach(url => {
      const domainInfo = analyzeDomain(url);
      
      // Record base domain pattern
      if (domainInfo.baseDomain) {
        const count = domainPatterns.get(domainInfo.baseDomain) || 0;
        domainPatterns.set(domainInfo.baseDomain, count + 1);
      }
      
      // If it's an international domain, record the canonical form
      if (domainInfo.canonicalForm) {
        const count = domainPatterns.get(domainInfo.canonicalForm) || 0;
        domainPatterns.set(domainInfo.canonicalForm, count + 1);
      }
    });

    // Learn the most common patterns
    domainPatterns.forEach((count, pattern) => {
      if (count >= 2 || pattern.length > 3) { // Pattern appears multiple times or is specific enough
        recordSuccessfulIdentification(
          pattern, 
          company, 
          parentCompany, 
          Math.min(0.95, identification.confidence)
        );
      }
    });
  });

  // Third pass: find and learn from unidentified international variants
  results.forEach((result, index) => {
    if (result.company === 'Unknown') {
      const unknownUrl = dataArray[index].url;
      const unknownDomain = analyzeDomain(unknownUrl);
      
      // Check if this is an international variant of a known domain
      if (unknownDomain.isInternational && unknownDomain.canonicalForm) {
        // Look for the canonical form in successful identifications
        successfulIdentifications.forEach((identification) => {
          identification.urls.forEach(knownUrl => {
            if (areLikelyRelated(unknownUrl, knownUrl)) {
              // This unknown URL is likely the same company!
              console.log(`Inferring: ${unknownUrl} is likely ${identification.company} (based on ${knownUrl})`);
              recordSuccessfulIdentification(
                unknownUrl,
                identification.company,
                identification.parentCompany,
                0.85 // Lower confidence for inferred matches
              );
            }
          });
        });
      }
    }
  });
}

/**
 * Pre-process a batch to find related domains
 * This helps the system understand relationships before identification
 */
export function preprocessDomainRelationships(dataArray: CompanyData[]): Map<string, Set<string>> {
  const relationships = new Map<string, Set<string>>();
  
  // Group URLs by their base domain
  dataArray.forEach(data => {
    const url = data.url;
    if (!url) return;
    
    const domainInfo = analyzeDomain(url);
    const key = domainInfo.canonicalForm || domainInfo.baseDomain;
    
    if (key) {
      if (!relationships.has(key)) {
        relationships.set(key, new Set());
      }
      relationships.get(key)!.add(url);
    }
  });
  
  // Find URLs that are likely related
  dataArray.forEach((data1, i) => {
    dataArray.slice(i + 1).forEach(data2 => {
      if (areLikelyRelated(data1.url, data2.url)) {
        const key = `${data1.url}|${data2.url}`;
        if (!relationships.has(key)) {
          relationships.set(key, new Set([data1.url, data2.url]));
        }
      }
    });
  });
  
  return relationships;
}

/**
 * Enhanced company identification that learns proactively
 */
export function enhanceWithIntelligentLearning(
  identifyCompaniesFn: Function
): typeof identifyCompaniesFn {
  return async function(dataArray: CompanyData[], options?: any) {
    // Preprocess to understand domain relationships
    const relationships = preprocessDomainRelationships(dataArray);
    console.log(`Found ${relationships.size} domain relationship groups`);
    
    // Run normal identification
    const results = await identifyCompaniesFn(dataArray, options);
    
    // Post-process to learn intelligently
    learnFromBatch(dataArray, results);
    
    // Second pass: try to identify unknowns using newly learned patterns
    let improvedCount = 0;
    results.forEach((result, index) => {
      if (result.company === 'Unknown') {
        // Check if we've learned anything new that could help
        const { checkLearnedPatterns } = require('./learning-system');
        const learned = checkLearnedPatterns(dataArray[index].url);
        if (learned) {
          results[index] = {
            company: learned.company,
            parentCompany: learned.parentCompany,
            confidence: learned.confidence,
            reasoning: 'Identified via intelligent pattern learning'
          };
          improvedCount++;
        }
      }
    });
    
    if (improvedCount > 0) {
      console.log(`Intelligent learning improved ${improvedCount} identifications`);
    }
    
    return results;
  };
}