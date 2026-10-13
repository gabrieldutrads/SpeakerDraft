import { findBibleBook } from './books';
import type { ParsedBibleReference } from './types';

/**
 * Formats a parsed Bible reference into canonical Portuguese representation.
 * E.g. "João 3:16", "1 Coríntios 13:4-8", "Salmos 23"
 */
export function formatBibleReference(ref: {
  bookName: string;
  chapterStart: number;
  verseStart?: number;
  chapterEnd?: number;
  verseEnd?: number;
}): string {
  if (ref.verseStart === undefined) {
    if (ref.chapterEnd && ref.chapterEnd !== ref.chapterStart) {
      return `${ref.bookName} ${ref.chapterStart}—${ref.chapterEnd}`;
    }
    return `${ref.bookName} ${ref.chapterStart}`;
  }

  if (ref.chapterEnd && ref.chapterEnd !== ref.chapterStart) {
    return `${ref.bookName} ${ref.chapterStart}:${ref.verseStart}—${ref.chapterEnd}:${ref.verseEnd ?? ''}`;
  }

  if (ref.verseEnd && ref.verseEnd !== ref.verseStart) {
    return `${ref.bookName} ${ref.chapterStart}:${ref.verseStart}–${ref.verseEnd}`;
  }

  return `${ref.bookName} ${ref.chapterStart}:${ref.verseStart}`;
}

/**
 * Regex for matching single Bible reference.
 * Group 1: Book name/prefix (e.g. "1 Coríntios", "Jo", "Gênesis")
 * Group 2: Chapter start
 * Group 3: Verse start (optional)
 * Group 4: Range separator or chapter/verse end (optional)
 * Group 5: Verse end or Chapter end (optional)
 */
const BIBLE_REF_REGEX =
  /(?:^|[^\wÀ-ÿ])((?:[1-3]\s*)?[A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)?)\s+(\d{1,3})(?:(?::|\.)(\d{1,3}))?(?:\s*(?:[-–—]|,\s*|\s+a\s+)\s*(?:(\d{1,3})(?::|\.))?(\d{1,3}))?/gi;

/**
 * Parses a single string containing a Bible reference.
 * E.g. "João 3:16", "1Co 13:4-8", "Sl 23"
 */
export function parseBibleReference(input: string): ParsedBibleReference | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // Try matching against the regex
  BIBLE_REF_REGEX.lastIndex = 0;
  const match = BIBLE_REF_REGEX.exec(' ' + trimmed);
  if (!match) return null;

  const rawBook = match[1]?.trim();
  const rawChapterStart = match[2];
  const rawVerseStart = match[3];
  const rawChapterEnd = match[4];
  const rawVerseEnd = match[5];

  if (!rawBook || !rawChapterStart) return null;

  const book = findBibleBook(rawBook);
  if (!book) return null;

  const chapterStart = parseInt(rawChapterStart, 10);
  if (isNaN(chapterStart) || chapterStart < 1 || chapterStart > book.chapters) {
    return null;
  }

  const verseStart = rawVerseStart ? parseInt(rawVerseStart, 10) : undefined;
  const chapterEnd = rawChapterEnd ? parseInt(rawChapterEnd, 10) : undefined;
  const verseEnd = rawVerseEnd ? parseInt(rawVerseEnd, 10) : undefined;

  const canonical = formatBibleReference({
    bookName: book.name,
    chapterStart,
    verseStart,
    chapterEnd,
    verseEnd,
  });

  return {
    bookId: book.id,
    bookName: book.name,
    bookAbbrev: book.abbrev,
    chapterStart,
    verseStart,
    chapterEnd,
    verseEnd,
    raw: trimmed,
    canonical,
  };
}

/**
 * Extracts all valid Bible references found within a larger text body.
 */
export function extractBibleReferences(text: string): ParsedBibleReference[] {
  if (!text || typeof text !== 'string') return [];

  const results: ParsedBibleReference[] = [];
  const regex = new RegExp(BIBLE_REF_REGEX.source, 'gi');
  let match: RegExpExecArray | null;

  while ((match = regex.exec(' ' + text)) !== null) {
    const rawMatch = match[0].trim();
    const parsed = parseBibleReference(rawMatch);
    if (parsed) {
      // Avoid duplicate consecutive identical matches
      const exists = results.some(
        (r) => r.canonical === parsed.canonical && Math.abs(regex.lastIndex - text.indexOf(rawMatch)) < 50
      );
      if (!exists) {
        results.push(parsed);
      }
    }
  }

  return results;
}
