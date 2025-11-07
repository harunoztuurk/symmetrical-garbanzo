// Parsing cache mekanizması
import type { ExpressionType } from '../types';

interface CacheEntry {
  compiled: any;
  type?: ExpressionType;
  inequalityType?: '>' | '<' | '>=' | '<=';
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 dakika

/**
 * Cache'den değer al
 */
export function getCached(expression: string): CacheEntry | null {
  const entry = cache.get(expression);
  if (!entry) return null;
  
  // TTL kontrolü
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(expression);
    return null;
  }
  
  return entry;
}

/**
 * Cache'e değer kaydet
 */
export function setCached(expression: string, value: Omit<CacheEntry, 'timestamp'>): void {
  cache.set(expression, {
    ...value,
    timestamp: Date.now(),
  });
}

/**
 * Cache'i temizle
 */
export function clearCache(): void {
  cache.clear();
}

