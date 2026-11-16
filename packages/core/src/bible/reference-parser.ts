import { findBibleBook } from './books';
import type { ParsedBibleReference } from './types';

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

// Regex mais simples para achar UMA referência isolada
const SINGLE_REF_REGEX =
  /^((?:[1-3]\s*)?[A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)?)\s+(\d{1,3})(?:(?::|\.)(\d{1,3}))?(?:\s*(?:[-–—]|,\s*|\s+a\s+)\s*(?:(\d{1,3})(?::|\.))?(\d{1,3}))?$/i;

export function parseBibleReference(input: string): ParsedBibleReference | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  const match = SINGLE_REF_REGEX.exec(trimmed);
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

export function extractBibleReferences(text: string): ParsedBibleReference[] {
  if (!text || typeof text !== 'string') return [];

  const results: ParsedBibleReference[] = [];
  
  // Quebra o texto em palavras
  const words = text.split(/\s+/);
  
  // Tenta juntar de 2 a 4 palavras para formar uma referência (ex: "João 3:16" ou "1 Coríntios 13:4-8")
  for (let i = 0; i < words.length; i++) {
    // Tenta combinações de 4, 3 e 2 palavras
    for (let j = 4; j >= 2; j--) {
      if (i + j <= words.length) {
        const chunk = words.slice(i, i + j).join(' ').replace(/[.,;!?]$/, ''); // Remove pontuação do final
        const parsed = parseBibleReference(chunk);
        
        if (parsed) {
          // Evita duplicatas exatas
          const exists = results.some((r) => r.canonical === parsed.canonical);
          if (!exists) {
            results.push(parsed);
            i += j - 1; // Pula as palavras que já foram usadas nesta referência
            break; // Vai para a próxima palavra
          }
        }
      }
    }
  }

  return results;
}