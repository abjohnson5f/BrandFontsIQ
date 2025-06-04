/**
 * Company Cache
 * In-memory and persistent caching for company identification results
 */

import { CompanyIdentificationResult } from '../company-identification/types';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

export interface CacheEntry {
  key: string;
  result: CompanyIdentificationResult;
  timestamp: number;
  hits: number;
}

export class CompanyCache {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private cacheDir: string;
  private maxMemoryEntries: number;
  private ttlMs: number;
  private isDirty: boolean = false;
  
  constructor(options: {
    cacheDir?: string;
    maxMemoryEntries?: number;
    ttlHours?: number;
  } = {}) {
    this.cacheDir = options.cacheDir || path.join(process.cwd(), '.cache', 'company-identification');
    this.maxMemoryEntries = options.maxMemoryEntries || 10000;
    this.ttlMs = (options.ttlHours || 24 * 7) * 60 * 60 * 1000; // Default 1 week
  }
  
  /**
   * Initialize cache and load from disk
   */
  async initialize(): Promise<void> {
    // Ensure cache directory exists
    await fs.mkdir(this.cacheDir, { recursive: true });
    
    // Load existing cache
    await this.loadFromDisk();
  }
  
  /**
   * Generate cache key from input data
   */
  private generateKey(inputs: {
    websiteAppTitle?: string;
    url?: string;
    appUrl?: string;
  }): string {
    const normalized = {
      title: (inputs.websiteAppTitle || '').toLowerCase().trim(),
      url: (inputs.url || '').toLowerCase().trim(),
      appUrl: (inputs.appUrl || '').toLowerCase().trim()
    };
    
    const keyString = `${normalized.title}|${normalized.url}|${normalized.appUrl}`;
    return createHash('md5').update(keyString).digest('hex');
  }
  
  /**
   * Get result from cache
   */
  get(inputs: {
    websiteAppTitle?: string;
    url?: string;
    appUrl?: string;
  }): CompanyIdentificationResult | null {
    const key = this.generateKey(inputs);
    const entry = this.memoryCache.get(key);
    
    if (!entry) return null;
    
    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.memoryCache.delete(key);
      this.isDirty = true;
      return null;
    }
    
    // Update hit count
    entry.hits++;
    return { ...entry.result, method: 'cached_result' as any };
  }
  
  /**
   * Set result in cache
   */
  set(
    inputs: {
      websiteAppTitle?: string;
      url?: string;
      appUrl?: string;
    },
    result: CompanyIdentificationResult
  ): void {
    const key = this.generateKey(inputs);
    
    // Implement LRU eviction if needed
    if (this.memoryCache.size >= this.maxMemoryEntries) {
      this.evictLeastUsed();
    }
    
    this.memoryCache.set(key, {
      key,
      result,
      timestamp: Date.now(),
      hits: 1
    });
    
    this.isDirty = true;
  }
  
  /**
   * Batch get from cache
   */
  batchGet(inputsList: Array<{
    websiteAppTitle?: string;
    url?: string;
    appUrl?: string;
  }>): (CompanyIdentificationResult | null)[] {
    return inputsList.map(inputs => this.get(inputs));
  }
  
  /**
   * Batch set in cache
   */
  batchSet(entries: Array<{
    inputs: {
      websiteAppTitle?: string;
      url?: string;
      appUrl?: string;
    };
    result: CompanyIdentificationResult;
  }>): void {
    entries.forEach(({ inputs, result }) => this.set(inputs, result));
  }
  
  /**
   * Evict least recently used entries
   */
  private evictLeastUsed(): void {
    // Sort by hits and timestamp
    const entries = Array.from(this.memoryCache.entries());
    entries.sort((a, b) => {
      // First by hits, then by timestamp
      if (a[1].hits !== b[1].hits) {
        return a[1].hits - b[1].hits;
      }
      return a[1].timestamp - b[1].timestamp;
    });
    
    // Remove bottom 10%
    const toRemove = Math.floor(this.maxMemoryEntries * 0.1);
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      this.memoryCache.delete(entries[i][0]);
    }
  }
  
  /**
   * Save cache to disk
   */
  async saveToDisk(): Promise<void> {
    if (!this.isDirty) return;
    
    const cacheFile = path.join(this.cacheDir, 'company-cache.json');
    const data = {
      version: 1,
      timestamp: Date.now(),
      entries: Array.from(this.memoryCache.entries()).map(([key, entry]) => ({
        ...entry,
        result: entry.result
      }))
    };
    
    await fs.writeFile(cacheFile, JSON.stringify(data, null, 2));
    this.isDirty = false;
  }
  
  /**
   * Load cache from disk
   */
  private async loadFromDisk(): Promise<void> {
    const cacheFile = path.join(this.cacheDir, 'company-cache.json');
    
    try {
      const content = await fs.readFile(cacheFile, 'utf-8');
      const data = JSON.parse(content);
      
      if (data.version !== 1) return;
      
      // Load entries that aren't expired
      const now = Date.now();
      data.entries.forEach((entry: CacheEntry) => {
        if (now - entry.timestamp <= this.ttlMs) {
          this.memoryCache.set(entry.key, entry);
        }
      });
    } catch (error) {
      // Cache file doesn't exist or is corrupted, start fresh
    }
  }
  
  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    this.isDirty = true;
    await this.saveToDisk();
  }
  
  /**
   * Get cache statistics
   */
  getStats(): {
    entries: number;
    hitRate: number;
    avgHits: number;
    memoryUsage: number;
  } {
    const entries = Array.from(this.memoryCache.values());
    const totalHits = entries.reduce((sum, e) => sum + e.hits, 0);
    
    return {
      entries: this.memoryCache.size,
      hitRate: entries.length > 0 ? entries.filter(e => e.hits > 1).length / entries.length : 0,
      avgHits: entries.length > 0 ? totalHits / entries.length : 0,
      memoryUsage: this.estimateMemoryUsage()
    };
  }
  
  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    // Rough estimation: 1KB per entry
    return this.memoryCache.size * 1024;
  }
  
  /**
   * Export cache for analysis
   */
  async exportCache(outputPath: string): Promise<void> {
    const entries = Array.from(this.memoryCache.values())
      .sort((a, b) => b.hits - a.hits)
      .map(entry => ({
        company: entry.result.company,
        parent: entry.result.parentCompany,
        confidence: entry.result.confidence,
        method: entry.result.method,
        hits: entry.hits,
        age: Math.floor((Date.now() - entry.timestamp) / 1000 / 60 / 60) + ' hours'
      }));
    
    await fs.writeFile(outputPath, JSON.stringify(entries, null, 2));
  }
}