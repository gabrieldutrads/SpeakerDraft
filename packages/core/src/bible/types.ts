export type Testament = 'OT' | 'NT';

export interface BibleBook {
  id: number;
  name: string;
  abbrev: string;
  testament: Testament;
  chapters: number;
  aliases: string[];
}

export interface ParsedBibleReference {
  bookId: number;
  bookName: string;
  bookAbbrev: string;
  chapterStart: number;
  verseStart?: number;
  chapterEnd?: number;
  verseEnd?: number;
  raw: string;
  canonical: string;
}