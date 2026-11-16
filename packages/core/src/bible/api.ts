/**
 * Bible API Service
 * Integrates with bible-api.com (seven1m/bible_api) for Scripture access
 * Supports multiple translations including Portuguese (NVI, ARA, NTLH, ACF) and English (KJV, NIV, ESV, etc.)
 */

import { findBibleBook, BIBLE_BOOKS } from './books';
import type { BibleBook, ParsedBibleReference } from './types';

export interface BibleVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleChapter {
  book_id: string;
  book_name: string;
  chapter: number;
  verses: BibleVerse[];
  reference: string;
  verses_count: number;
}

export interface BibleSearchResult {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

export interface BibleSearchResponse {
  verses: BibleSearchResult[];
  total: number;
  query: string;
  translation: string;
}

export type TranslationCode =
  | 'nvi' | 'ara' | 'ntlh' | 'acf' | 'kjv' | 'niv' | 'esv' | 'nlt' | 'nasb' | 'csb'
  | 'rvr1960' | 'rvr1909' | 'lbla' | 'nvi-pt' | 'pt';

export const TRANSLATIONS: Record<TranslationCode, { name: string; language: 'pt' | 'en' | 'es'; fullName: string }> = {
  'nvi': { name: 'NVI', language: 'pt', fullName: 'Nova Versão Internacional' },
  'nvi-pt': { name: 'NVI-PT', language: 'pt', fullName: 'Nova Versão Internacional (Português)' },
  'ara': { name: 'ARA', language: 'pt', fullName: 'Almeida Revista e Atualizada' },
  'ntlh': { name: 'NTLH', language: 'pt', fullName: 'Nova Tradução na Linguagem de Hoje' },
  'acf': { name: 'ACF', language: 'pt', fullName: 'Almeida Corrigida Fiel' },
  'kjv': { name: 'KJV', language: 'en', fullName: 'King James Version' },
  'niv': { name: 'NIV', language: 'en', fullName: 'New International Version' },
  'esv': { name: 'ESV', language: 'en', fullName: 'English Standard Version' },
  'nlt': { name: 'NLT', language: 'en', fullName: 'New Living Translation' },
  'nasb': { name: 'NASB', language: 'en', fullName: 'New American Standard Bible' },
  'csb': { name: 'CSB', language: 'en', fullName: 'Christian Standard Bible' },
  'rvr1960': { name: 'RVR1960', language: 'es', fullName: 'Reina Valera 1960' },
  'rvr1909': { name: 'RVR1909', language: 'es', fullName: 'Reina Valera 1909' },
  'lbla': { name: 'LBLA', language: 'es', fullName: 'La Biblia de las Américas' },
  'pt': { name: 'PT', language: 'pt', fullName: 'Português (padrão)' },
};

const API_BASE = 'https://bible-api.com';
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class BibleApiService {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTranslation: TranslationCode = 'nvi';
  private pendingRequests = new Map<string, Promise<any>>();

  setDefaultTranslation(translation: TranslationCode) {
    this.defaultTranslation = translation;
  }

  getDefaultTranslation(): TranslationCode {
    return this.defaultTranslation;
  }

  private getCacheKey(endpoint: string, params: Record<string, string> = {}): string {
    const searchParams = new URLSearchParams(params).toString();
    return `${endpoint}?${searchParams}`;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private async fetchWithCache<T>(url: string, cacheKey: string): Promise<T> {
    const cached = this.getFromCache<T>(cacheKey);
    if (cached) return cached;

    // Deduplicate concurrent requests for the same resource
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey) as Promise<T>;
    }

    const promise = fetch(url)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Bible API error: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        this.setCache(cacheKey, data);
        this.pendingRequests.delete(cacheKey);
        return data as T;
      })
      .catch((error) => {
        this.pendingRequests.delete(cacheKey);
        throw error;
      });

    this.pendingRequests.set(cacheKey, promise);
    return promise;
  }

  /**
   * Get a full chapter with all verses
   */
  async getChapter(
    bookId: number | string,
    chapter: number,
    translation?: TranslationCode
  ): Promise<BibleChapter> {
    const book = typeof bookId === 'number' ? BIBLE_BOOKS.find(b => b.id === bookId) : findBibleBook(bookId);
    if (!book) throw new Error(`Book not found: ${bookId}`);

    const t = translation || this.defaultTranslation;
    const cacheKey = this.getCacheKey('chapter', { book: book.abbrev, chapter: chapter.toString(), translation: t });
    const url = `${API_BASE}/${book.abbrev}+${chapter}?translation=${t}`;

    return this.fetchWithCache<BibleChapter>(url, cacheKey);
  }

  /**
   * Get a specific verse or verse range
   */
  async getVerses(
    bookId: number | string,
    chapter: number,
    verseStart?: number,
    verseEnd?: number,
    translation?: TranslationCode
  ): Promise<BibleVerse | BibleVerse[]> {
    const book = typeof bookId === 'number' ? BIBLE_BOOKS.find(b => b.id === bookId) : findBibleBook(bookId);
    if (!book) throw new Error(`Book not found: ${bookId}`);

    const t = translation || this.defaultTranslation;
    let reference = `${book.abbrev}+${chapter}`;
    if (verseStart) {
      reference += `:${verseStart}`;
      if (verseEnd && verseEnd !== verseStart) {
        reference += `-${verseEnd}`;
      }
    }

    const cacheKey = this.getCacheKey('verses', { reference, translation: t });
    const url = `${API_BASE}/${reference}?translation=${t}`;

    return this.fetchWithCache<BibleVerse | BibleVerse[]>(url, cacheKey);
  }

  /**
   * Get passage using parsed reference
   */
  async getPassage(ref: ParsedBibleReference, translation?: TranslationCode): Promise<BibleChapter | BibleVerse | BibleVerse[]> {
    if (ref.verseStart === undefined) {
      return this.getChapter(ref.bookId, ref.chapterStart, translation);
    }
    return this.getVerses(ref.bookId, ref.chapterStart, ref.verseStart, ref.verseEnd, translation);
  }

  /**
   * Search for verses containing text
   */
  async search(query: string, translation?: TranslationCode, limit = 50): Promise<BibleSearchResponse> {
    const t = translation || this.defaultTranslation;
    const cacheKey = this.getCacheKey('search', { query, translation: t, limit: limit.toString() });
    const url = `${API_BASE}/search/${encodeURIComponent(query)}?translation=${t}&limit=${limit}`;

    return this.fetchWithCache<BibleSearchResponse>(url, cacheKey);
  }

  /**
   * Get random verse
   */
  async getRandomVerse(translation?: TranslationCode): Promise<BibleVerse> {
    const t = translation || this.defaultTranslation;
    const cacheKey = this.getCacheKey('random', { translation: t });
    const url = `${API_BASE}/random?translation=${t}`;

    return this.fetchWithCache<BibleVerse>(url, cacheKey);
  }

  /**
   * Get all available books with chapter counts for a translation
   */
  async getBooks(translation?: TranslationCode): Promise<{ books: Array<{ name: string; chapters: number }> }> {
    const t = translation || this.defaultTranslation;
    const cacheKey = this.getCacheKey('books', { translation: t });
    const url = `${API_BASE}/books?translation=${t}`;

    return this.fetchWithCache(url, cacheKey);
  }

  /**
   * Clear cache (useful for testing or translation changes)
   */
  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Preload common chapters for offline-first experience
   */
  async preloadCommonPassages(translation?: TranslationCode): Promise<void> {
    const commonPassages = [
      { book: 'jo', chapter: 3 },    // John 3
      { book: 'sl', chapter: 23 },   // Psalm 23
      { book: 'rm', chapter: 8 },    // Romans 8
      { book: 'fp', chapter: 4 },    // Philippians 4
      { book: 'is', chapter: 53 },   // Isaiah 53
      { book: 'mt', chapter: 5 },    // Matthew 5 (Sermon on Mount)
      { book: '1co', chapter: 13 },  // 1 Corinthians 13
      { book: 'hb', chapter: 11 },   // Hebrews 11
      { book: 'gn', chapter: 1 },    // Genesis 1
      { book: 'ap', chapter: 21 },   // Revelation 21
    ];

    await Promise.allSettled(
      commonPassages.map(({ book, chapter }) => this.getChapter(book, chapter, translation))
    );
  }
}

// Singleton instance
export const bibleApi = new BibleApiService();

// Helper to get translation display name
export function getTranslationDisplayName(code: TranslationCode): string {
  return TRANSLATIONS[code]?.name || code.toUpperCase();
}

export function getTranslationFullName(code: TranslationCode): string {
  return TRANSLATIONS[code]?.fullName || code.toUpperCase();
}

export function getTranslationsByLanguage(language: 'pt' | 'en' | 'es'): TranslationCode[] {
  return Object.entries(TRANSLATIONS)
    .filter(([, v]) => v.language === language)
    .map(([k]) => k as TranslationCode);
}