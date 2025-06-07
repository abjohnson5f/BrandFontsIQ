/**
 * Learning System for Company Identification Patterns
 * 
 * This module tracks successful company identifications and learns patterns
 * to improve future identification accuracy without hardcoding.
 */

import * as fs from 'fs';
import * as path from 'path';
import { analyzeDomain, generatePatternHierarchy, extractSmartPatterns } from './domain-intelligence';

interface LearnedPattern {
  pattern: string;
  company: string;
  parentCompany?: string;
  confidence: number;
  occurrences: number;
  lastSeen: Date;
  sources: string[]; // Which URLs taught us this pattern
}

interface LearningData {
  patterns: Record<string, LearnedPattern>;
  domainMappings: Record<string, string>; // e.g., "peanutbutter" -> "Skippy"
  subdomainRules: Array<{
    pattern: string;
    extractionRule: 'first-segment' | 'second-segment' | 'full-domain';
    examples: string[];
  }>;
}

class CompanyIdentificationLearningSystem {
  private dataPath: string;
  private data: LearningData;

  constructor(dataPath: string = path.join(__dirname, '../learned-patterns.json')) {
    this.dataPath = dataPath;
    this.data = this.loadData();
  }

  private loadData(): LearningData {
    try {
      if (fs.existsSync(this.dataPath)) {
        const raw = fs.readFileSync(this.dataPath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (error) {
      console.error('Failed to load learning data:', error);
    }

    // Initialize with empty data
    return {
      patterns: {},
      domainMappings: {},
      subdomainRules: []
    };
  }

  private saveData(): void {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Failed to save learning data:', error);
    }
  }

  /**
   * Learn from a successful identification
   */
  learn(url: string, identifiedCompany: string, parentCompany?: string, confidence: number = 1): void {
    // Extract patterns from the URL
    const patterns = this.extractPatterns(url);
    
    // Debug: Log what we're trying to learn
    if (patterns.length > 0) {
      console.log(`Learning from ${url} → ${identifiedCompany}: patterns [${patterns.join(', ')}]`);
    }
    
    patterns.forEach(pattern => {
      // SAFETY: Don't learn overly generic patterns that could cause confusion
      if (this.isPatternTooGeneric(pattern)) {
        console.log(`Skipping overly generic pattern: "${pattern}"`);
        return;
      }

      if (this.data.patterns[pattern]) {
        const existing = this.data.patterns[pattern];
        
        // SAFETY: Check for conflicts - same pattern pointing to different companies
        if (existing.company !== identifiedCompany) {
          console.warn(`Pattern conflict detected for "${pattern}": ${existing.company} vs ${identifiedCompany}`);
          // Only update if new identification has significantly higher confidence
          if (confidence > existing.confidence + 0.2) {
            console.log(`Updating pattern "${pattern}" from ${existing.company} to ${identifiedCompany}`);
            existing.company = identifiedCompany;
            existing.parentCompany = parentCompany;
          } else {
            // Mark pattern as ambiguous
            existing.confidence = Math.min(0.5, existing.confidence);
            return;
          }
        }
        
        // Update existing pattern
        existing.occurrences++;
        existing.lastSeen = new Date();
        existing.confidence = (existing.confidence * (existing.occurrences - 1) + confidence) / existing.occurrences;
        if (!existing.sources.includes(url)) {
          existing.sources.push(url);
          // Limit sources to prevent memory bloat
          if (existing.sources.length > 10) {
            existing.sources = existing.sources.slice(-10);
          }
        }
      } else {
        // Create new pattern
        this.data.patterns[pattern] = {
          pattern,
          company: identifiedCompany,
          parentCompany,
          confidence,
          occurrences: 1,
          lastSeen: new Date(),
          sources: [url]
        };
      }
    });

    // Learn domain mappings with intelligence
    const domainInfo = analyzeDomain(url);
    
    // If this is an international domain, also learn the base pattern
    if (domainInfo.isInternational && domainInfo.baseDomain && confidence > 0.8) {
      // Learn that the base domain maps to this company
      if (!this.data.domainMappings[domainInfo.baseDomain] || 
          this.data.domainMappings[domainInfo.baseDomain] === identifiedCompany) {
        this.data.domainMappings[domainInfo.baseDomain] = identifiedCompany;
        console.log(`Learned base domain pattern: ${domainInfo.baseDomain} → ${identifiedCompany}`);
      }
    }
    
    // Standard domain mapping
    const domain = this.extractDomain(url);
    if (domain && confidence > 0.8) {
      if (this.data.domainMappings[domain] && this.data.domainMappings[domain] !== identifiedCompany) {
        console.warn(`Domain mapping conflict for "${domain}": ${this.data.domainMappings[domain]} vs ${identifiedCompany}`);
      } else {
        this.data.domainMappings[domain] = identifiedCompany;
      }
    }

    this.saveData();
  }

  /**
   * Check if a pattern is too generic and might cause false matches
   */
  private isPatternTooGeneric(pattern: string): boolean {
    // Single letters or numbers
    if (pattern.length <= 2) return true;
    
    // Common words that appear in many company names
    const genericWords = ['www', 'com', 'net', 'org', 'inc', 'corp', 'llc', 'ltd', 
                         'company', 'group', 'international', 'global', 'services',
                         'products', 'solutions', 'systems', 'tech', 'online', 'web'];
    
    if (genericWords.includes(pattern.toLowerCase())) return true;
    
    // Patterns that are just numbers
    if (/^\d+$/.test(pattern)) return true;
    
    return false;
  }

  /**
   * Extract multiple patterns from a URL
   */
  private extractPatterns(url: string): string[] {
    if (!url || url.trim() === '') return [];
    
    const patterns: string[] = [];
    
    // Normalize URL
    const normalized = url.toLowerCase()
      .replace(/^(https?|ftp):\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');

    if (!normalized) return [];

    // Full domain
    const fullDomain = normalized.split('/')[0];
    if (fullDomain) patterns.push(fullDomain);

    // Domain parts
    const domainParts = fullDomain.split('.');
    
    // First segment (e.g., "burke" from "burke.nationjob.com")
    if (domainParts.length > 2 && domainParts[0]) {
      patterns.push(domainParts[0]);
    }

    // Base domain without TLD (e.g., "peanutbutter" from "peanutbutter.mx")
    if (domainParts.length >= 2 && domainParts[0] && domainParts[0] !== patterns[patterns.length - 1]) {
      patterns.push(domainParts[0]);
    }

    // Second-level domain (e.g., "hormelfoods" from "investor.hormelfoods.com")
    if (domainParts.length > 2) {
      const secondLevel = domainParts[domainParts.length - 2];
      if (secondLevel && !patterns.includes(secondLevel)) {
        patterns.push(secondLevel);
      }
    }

    return [...new Set(patterns.filter(p => p && p.length > 0))]; // Remove duplicates and empty strings
  }

  /**
   * Extract the main domain identifier
   */
  private extractDomain(url: string): string | null {
    const normalized = url.toLowerCase()
      .replace(/^(https?|ftp):\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];

    const parts = normalized.split('.');
    if (parts.length >= 2) {
      // For international domains, return the base (e.g., "peanutbutter" from "peanutbutter.mx")
      return parts[0];
    }
    return null;
  }

  /**
   * Suggest a company based on learned patterns
   */
  suggest(url: string): { company: string; parentCompany?: string; confidence: number } | null {
    // Use smart pattern extraction that understands international domains
    const smartPatterns = extractSmartPatterns(url);
    
    // Find the best matching pattern
    let bestMatch: LearnedPattern | null = null;
    let bestScore = 0;
    let patternType: string = '';

    // Check patterns in order of specificity
    for (const { pattern, type, confidence: patternConfidence } of smartPatterns) {
      const learned = this.data.patterns[pattern];
      if (learned) {
        // Score based on confidence, occurrences, recency, and pattern type
        const recencyScore = 1 - (Date.now() - new Date(learned.lastSeen).getTime()) / (365 * 24 * 60 * 60 * 1000);
        const score = learned.confidence * Math.log(learned.occurrences + 1) * Math.max(0.5, recencyScore) * patternConfidence;
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = learned;
          patternType = type;
        }
      }
    }

    if (bestMatch) {
      // Adjust confidence based on pattern type
      let confidence = bestMatch.confidence;
      if (patternType === 'canonical') confidence *= 0.95; // Slight reduction for international variants
      if (patternType === 'base') confidence *= 0.9;
      if (patternType === 'segment') confidence *= 0.85;
      
      return {
        company: bestMatch.company,
        parentCompany: bestMatch.parentCompany,
        confidence: Math.min(0.9, confidence)
      };
    }

    // Check domain mappings with intelligence
    const domainInfo = analyzeDomain(url);
    
    // Check canonical form first
    if (domainInfo.canonicalForm && this.data.domainMappings[domainInfo.canonicalForm]) {
      return {
        company: this.data.domainMappings[domainInfo.canonicalForm],
        confidence: 0.85 // High confidence for canonical match
      };
    }
    
    // Check base domain
    if (domainInfo.baseDomain && this.data.domainMappings[domainInfo.baseDomain]) {
      return {
        company: this.data.domainMappings[domainInfo.baseDomain],
        confidence: 0.8
      };
    }

    return null;
  }

  /**
   * Get statistics about learned patterns
   */
  getStats(): {
    totalPatterns: number;
    totalDomainMappings: number;
    companiesLearned: Set<string>;
    mostCommonPatterns: Array<{ pattern: string; company: string; occurrences: number }>;
  } {
    const companiesLearned = new Set<string>();
    Object.values(this.data.patterns).forEach(p => companiesLearned.add(p.company));

    const mostCommonPatterns = Object.values(this.data.patterns)
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 10)
      .map(p => ({ pattern: p.pattern, company: p.company, occurrences: p.occurrences }));

    return {
      totalPatterns: Object.keys(this.data.patterns).length,
      totalDomainMappings: Object.keys(this.data.domainMappings).length,
      companiesLearned,
      mostCommonPatterns
    };
  }
}

export const learningSystem = new CompanyIdentificationLearningSystem();

/**
 * Hook to be called after successful identification
 */
export function recordSuccessfulIdentification(
  url: string,
  company: string,
  parentCompany?: string,
  confidence: number = 1
): void {
  // Only learn from high-confidence identifications
  if (confidence >= 0.8 && company !== 'Unknown') {
    learningSystem.learn(url, company, parentCompany, confidence);
  }
}

/**
 * Hook to be called before LLM identification
 */
export function checkLearnedPatterns(url: string): { company: string; parentCompany?: string; confidence: number } | null {
  return learningSystem.suggest(url);
}