/**
 * Bible API Service
 * Integrates with bible-api.com (seven1m/bible_api) for Scripture access
 * Supports multiple translations including Portuguese (NVI, ARA, NTLH, ACF) and English (KJV, NIV, ESV, etc.)
 */

import { findBibleBook, BIBLE_BOOKS } from './books';
import type { ParsedBibleReference } from './types';

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
  'pt': { name: 'Bíblia Livre', language: 'pt', fullName: 'Bíblia Livre (português brasileiro)' },
};


/**
 * Fontes: bible.helloao.org (Bíblia Livre PT, após checar metadados/licença)
 * e bible-api.com (somente KJV). Não confundir NVI/ARA/NTLH com texto livre.
 * A aplicação deve exibir o crédito/licença da tradução antes da publicação.
 */
const AO_BASE = 'https://bible.helloao.org/api';
const LEGACY_BASE = 'https://bible-api.com';
const CACHE_TTL = 24 * 60 * 60 * 1000;

// IDs USFM/OSIS dos 66 livros. Não usar abreviações PT na URL da API.
const BOOK_IDS = [
  'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI',
  '1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER',
  'LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP',
  'HAG','ZEC','MAL','MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL',
  'EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE',
  '2PE','1JN','2JN','3JN','JUD','REV',
] as const;

const EN_BOOK_NAMES = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra',
  'Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon',
  'Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos',
  'Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah',
  'Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians',
  '2 Corinthians','Galatians','Ephesians','Philippians','Colossians',
  '1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon',
  'Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation',
] as const;

interface AoTranslation {
  id: string;
  name: string;
  language: string;
  licenseUrl?: string;
  licenseNotice?: string | null;
  license?: { commercialUse?: string; attribution?: string; publicDomain?: boolean } | null;
  numberOfBooks?: number;
}
interface AoChapter {
  chapter?: {
    content?: Array<{ type: string; number?: number; text?: string }>;
  };
}
interface LegacyResponse {
  verses?: Array<{ verse?: number; text?: string }>;
}

const readJson = async <T>(url: string): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error('Não foi possível acessar o serviço bíblico. Verifique a conexão e tente novamente.');
  }
  if (!response.ok) {
    throw new Error(`O provedor bíblico não respondeu corretamente (HTTP ${response.status}).`);
  }
  return (await response.json()) as T;
};

class BibleApiService {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private pendingRequests = new Map<string, Promise<unknown>>();
  private defaultTranslation: TranslationCode = 'pt';
  private portugueseTranslation: Promise<AoTranslation> | null = null;

  setDefaultTranslation(translation: TranslationCode): void {
    this.defaultTranslation = translation;
  }

  getDefaultTranslation(): TranslationCode { return this.defaultTranslation; }

  private cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
      return Promise.resolve(entry.data as T);
    }
    const pending = this.pendingRequests.get(key);
    if (pending) return pending as Promise<T>;
    const promise = loader().then(data => {
      this.cache.set(key, { data, timestamp: Date.now() });
      return data;
    }).finally(() => this.pendingRequests.delete(key));
    this.pendingRequests.set(key, promise);
    return promise;
  }

  private getPortugueseTranslation(): Promise<AoTranslation> {
    if (!this.portugueseTranslation) {
      this.portugueseTranslation = readJson<{ translations: AoTranslation[] }>(
        `${AO_BASE}/available_translations.json`,
      ).then(({ translations }) => {
        // Não selecionar uma tradução portuguesa aleatória e rotulá-la como Bíblia Livre.
        // A Bíblia Livre (edição de fevereiro de 2018) é licenciada sob
        // Creative Commons Attribution 4.0 Brasil, conforme a fonte original:
        // https://ebible.org/Bible/details.php?id=porbr2018
        // O catálogo pode omitir o objeto `license` ou usar ID normalizado.
        // Identificar a tradução pela referência à MESMA edição, nunca por
        // ser simplesmente uma tradução em português.
        const bibleLivre = translations.find(item => {
          const id = item.id.toLowerCase().replace(/[^a-z0-9]/g, '');
          const licenseUrl = (item.licenseUrl || '').toLowerCase();
          return (id === 'porbr2018' || licenseUrl.includes('porbr2018'))
            && item.language === 'por'
            && (item.numberOfBooks ?? 0) >= 66;
        });
        if (!bibleLivre) {
          const portugueseIds = translations
            .filter(item => item.language === 'por')
            .map(item => item.id)
            .slice(0, 15)
            .join(', ');
          throw new Error(
            'A edição Bíblia Livre (porbr2018) não foi localizada no catálogo deste provedor.'
            + (portugueseIds ? ` Versões portuguesas disponíveis: ${portugueseIds}.` : ''),
          );
        }
        return bibleLivre;
      }).catch(error => {
        this.portugueseTranslation = null;
        throw error;
      });
    }
    return this.portugueseTranslation;
  }

  /** Crédito que deve ser exibido na UI para atender a licença da versão portuguesa. */
  async getPortugueseAttribution(): Promise<{ name: string; notice: string; licenseUrl: string }> {
    const version = await this.getPortugueseTranslation();
    return {
      name: version.name,
      notice: version.licenseNotice || 'Bíblia Livre (2018) — Diego Santos, Mario Sérgio e Marco Teles. CC BY 4.0 Brasil.',
      licenseUrl: version.licenseUrl || 'https://creativecommons.org/licenses/by/4.0/br/',
    };
  }

  private getBook(bookId: number | string) {
    const book = typeof bookId === 'number'
      ? BIBLE_BOOKS.find(item => item.id === bookId)
      : findBibleBook(bookId);
    if (!book) throw new Error(`Livro bíblico não encontrado: ${bookId}`);
    return book;
  }

  async getChapter(bookId: number | string, chapter: number, translation?: TranslationCode): Promise<BibleChapter> {
    const book = this.getBook(bookId);
    if (!Number.isInteger(chapter) || chapter < 1 || chapter > book.chapters) {
      throw new Error('Capítulo bíblico inválido.');
    }
    const version = translation || this.defaultTranslation;
    const reference = `${book.name} ${chapter}`;
    const makeVerse = (number: number, text: string): BibleVerse => ({
      book_id: book.abbrev, book_name: book.name, chapter, verse: number, text,
    });
    if (version === 'pt') {
      const selected = await this.getPortugueseTranslation();
      const osis = BOOK_IDS[book.id - 1];
      return this.cached(`ao:${selected.id}:${osis}:${chapter}`, async () => {
        const data = await readJson<AoChapter>(
          `${AO_BASE}/${encodeURIComponent(selected.id)}/${osis}/${chapter}.simple.json`,
        );
        const verses = (data.chapter?.content || [])
          .filter(v => v.type === 'verse' && typeof v.number === 'number' && typeof v.text === 'string')
          .map(v => makeVerse(v.number!, v.text!));
        if (!verses.length) throw new Error('O capítulo retornou vazio ou em formato desconhecido.');
        return { book_id: book.abbrev, book_name: book.name, chapter, verses, reference, verses_count: verses.length };
      });
    }
    if (version === 'kjv') {
      return this.cached(`legacy:kjv:${book.id}:${chapter}`, async () => {
        const englishBook = EN_BOOK_NAMES[book.id - 1];
        const result = await readJson<LegacyResponse>(
          `${LEGACY_BASE}/${encodeURIComponent(`${englishBook} ${chapter}`)}?translation=kjv`,
        );
        const verses = (result.verses || [])
          .filter(v => typeof v.verse === 'number' && typeof v.text === 'string')
          .map(v => makeVerse(v.verse!, v.text!));
        if (!verses.length) throw new Error('O capítulo retornou vazio.');
        return { book_id: book.abbrev, book_name: book.name, chapter, verses, reference, verses_count: verses.length };
      });
    }
    throw new Error(`A tradução ${TRANSLATIONS[version]?.name || version} não está integrada ou licenciada. Selecione Bíblia Livre (PT) ou KJV.`);
  }

  async getVerses(
    bookId: number | string, chapter: number, verseStart?: number, verseEnd?: number,
    translation?: TranslationCode,
  ): Promise<BibleVerse | BibleVerse[]> {
    const data = await this.getChapter(bookId, chapter, translation);
    if (verseStart === undefined) return data.verses;
    const verses = data.verses.filter(v => v.verse >= verseStart && v.verse <= (verseEnd ?? verseStart));
    if (verses.length === 0) throw new Error('Versículo não encontrado neste capítulo.');
    return verseEnd !== undefined && verseEnd !== verseStart ? verses : verses[0];
  }

  async getPassage(ref: ParsedBibleReference, translation?: TranslationCode): Promise<BibleChapter | BibleVerse | BibleVerse[]> {
    if (ref.verseStart === undefined) return this.getChapter(ref.bookId, ref.chapterStart, translation);
    return this.getVerses(ref.bookId, ref.chapterStart, ref.verseStart, ref.verseEnd, translation);
  }

  async search(_query: string, _translation?: TranslationCode, _limit = 50): Promise<BibleSearchResponse> {
    // Nenhum desses provedores possui o endpoint /search/... usado anteriormente.
    // Não forjar resultados nem fazer 1.189 solicitações no navegador.
    throw new Error('Busca por palavras ainda não está disponível neste provedor. Use a busca por referência bíblica.');
  }

  async getRandomVerse(translation?: TranslationCode): Promise<BibleVerse> {
    const book = BIBLE_BOOKS[Math.floor(Math.random() * BIBLE_BOOKS.length)];
    const chapter = Math.floor(Math.random() * book.chapters) + 1;
    const data = await this.getChapter(book.id, chapter, translation);
    return data.verses[Math.floor(Math.random() * data.verses.length)];
  }

  async getBooks(_translation?: TranslationCode): Promise<{ books: Array<{ name: string; chapters: number }> }> {
    return { books: BIBLE_BOOKS.map(book => ({ name: book.name, chapters: book.chapters })) };
  }

  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    this.portugueseTranslation = null;
  }

  async preloadCommonPassages(translation?: TranslationCode): Promise<void> {
    await Promise.allSettled([[43,3],[19,23],[45,8],[50,4],[23,53],[40,5],[46,13],[58,11],[1,1],[66,21]]
      .map(([book, chapter]) => this.getChapter(book, chapter, translation)));
  }
}

export const bibleApi = new BibleApiService();
export function getTranslationDisplayName(code: TranslationCode): string { return TRANSLATIONS[code]?.name || code.toUpperCase(); }
export function getTranslationFullName(code: TranslationCode): string { return TRANSLATIONS[code]?.fullName || code.toUpperCase(); }
export function getTranslationsByLanguage(language: 'pt' | 'en' | 'es'): TranslationCode[] {
  return language === 'pt' ? ['pt'] : language === 'en' ? ['kjv'] : [];
}
