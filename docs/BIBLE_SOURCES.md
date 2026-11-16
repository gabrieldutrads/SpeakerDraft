# Bible Sources & Licensing — SpeakerDraft

**Last Updated:** 2026-10-24  
**Status:** Research complete — implementation pending

---

## 1. Licensing Principle

**Only public domain or explicitly licensed translations may be included.** No copyrighted text (NVI, ARA 1993+, NAA, NTLH, etc.) without written permission.

---

## 2. Candidate Translations (Public Domain)

| Translation | Code | Language | Copyright Status | Source |
|-------------|------|----------|------------------|--------|
| **Almeida Revista e Atualizada (1993)** | ARA | Portuguese (Brazil) | **Public Domain in Brazil** (Law 9.610/98, Art. 41 — 70 years after publication; 1993 + 70 = 2063, but earlier editions exist) | Bible Gateway, CrossWire |
| **King James Version (1769)** | KJV | English | Public Domain (worldwide) | CrossWire, Project Gutenberg |
| **World English Bible** | WEB | English | Public Domain (explicit dedication) | eBible.org, CrossWire |
| **American Standard Version (1901)** | ASV | English | Public Domain | CrossWire |
| **Reina Valera 1909** | RVR1909 | Spanish | Public Domain | CrossWire |
| **Louis Segond 1910** | LSG | French | Public Domain | CrossWire |
| **Lutherbibel 1912** | LUT1912 | German | Public Domain | CrossWire |

---

## 3. Brazilian Portuguese Specifics

### 3.1 ARA (Almeida Revista e Atualizada)

**Critical**: The **1993 edition** (ARA) is **NOT public domain** in Brazil (copyright expires 2063). However:
- **1969 edition** or earlier → Public domain (70 years after publication)
- **1848 Almeida (original)** → Public domain
- **Figueiredo Almeida (1995)** → Copyrighted

**Safe approach**: Use **ARA 1969 or earlier** or **WEB Portuguese** (if available).

### 3.2 Recommended for SpeakerDraft

| Option | Pros | Cons |
|--------|------|------|
| **WEB (Portuguese)** | Explicitly public domain, modern Portuguese | Less known in Brazil |
| **ARA 1969 (scanned)** | Traditional, familiar | Requires OCR/verification |
| **ACF (Almeida Corrigida Fiel)** | Public domain claim | Textual variants from ARA |

**Decision**: Ship with **WEB Portuguese** as default (explicit public domain). Allow users to add ARA if they own a license.

---

## 4. Data Sources & Attribution

### 4.1 CrossWire Bible Society (Sword Project)

- **Source**: https://crosswire.org/sword/
- **Format**: OSIS, USFX, ThML
- **License**: Public domain texts only; CrossWire asserts no copyright on PD texts
- **Attribution**: "Bible text from CrossWire Bible Society (public domain)"

### 4.2 eBible.org

- **Source**: https://ebible.org/
- **Format**: USFX (XML), plain text
- **License**: Public domain dedication
- **Attribution**: "Bible text from eBible.org (public domain)"

### 4.3 Bible Gateway API (NOT for redistribution)

- **License**: Terms prohibit bulk download/redistribution
- **Use**: Reference only, not for local storage

---

## 5. Implementation: Pluggable Bible Text Adapter

### 5.1 Interface (in `packages/core/src/bible/text-adapter.ts`)

```typescript
export interface BibleTextAdapter {
  readonly versionCode: string;      // e.g., 'WEB', 'ARA1969'
  readonly versionName: string;      // 'World English Bible'
  readonly language: string;         // 'pt-BR'
  readonly license: 'public_domain' | 'licensed';
  readonly attribution: string;      // Required attribution text
  readonly sourceUrl: string;        // Where text was obtained

  // Get verse text
  getVerse(bookId: number, chapter: number, verse: number): Promise<string | null>;

  // Get passage (range)
  getPassage(bookId: number, chapterStart: number, verseStart?: number, chapterEnd?: number, verseEnd?: number): Promise<string | null>;

  // Get entire chapter
  getChapter(bookId: number, chapter: number): Promise<string[] | null>; // array of verses

  // Search
  search(query: string, options?: { limit?: number; testament?: 'OT' | 'NT' }): Promise<BibleSearchResult[]>;

  // Metadata
  getAvailableBooks(): Promise<BibleBook[]>;
}

export interface BibleSearchResult {
  bookId: number;
  chapter: number;
  verse: number;
  text: string;
  context?: string; // surrounding verses
}
```

### 5.2 Default Adapter: Static JSON (Local)

```typescript
// packages/core/src/bible/adapters/web-portuguese.ts
// Ships with minimal WEB Portuguese text (key verses only)
// Full text downloadable on demand

export const webPortugueseAdapter: BibleTextAdapter = {
  versionCode: 'WEB_PT',
  versionName: 'World English Bible (Português)',
  language: 'pt-BR',
  license: 'public_domain',
  attribution: 'Texto bíblico da World English Bible (domínio público), via eBible.org',
  sourceUrl: 'https://ebible.org/',

  async getVerse(bookId, chapter, verse) { /* ... */ },
  async getPassage(bookId, chapterStart, verseStart, chapterEnd, verseEnd) { /* ... */ },
  async getChapter(bookId, chapter) { /* ... */ },
  async search(query, options) { /* ... */ },
  async getAvailableBooks() { return BIBLE_BOOKS; },
};
```

### 5.3 Registration & Selection

```typescript
// apps/web/src/lib/bible.ts
import { webPortugueseAdapter } from '@speaker-draft/core/bible/adapters/web-portuguese';

const adapters = new Map<string, BibleTextAdapter>([
  ['WEB_PT', webPortugueseAdapter],
  // Future: ['ARA1969', ara1969Adapter], // if user provides
]);

export function getBibleAdapter(code: string = 'WEB_PT'): BibleTextAdapter {
  return adapters.get(code) ?? webPortugueseAdapter;
}

export function registerBibleAdapter(adapter: BibleTextAdapter) {
  adapters.set(adapter.versionCode, adapter);
}
```

---

## 6. Data Format for Distribution

### 6.1 USFX (Unified Standard Format XML) — Preferred

```xml
<?xml version="1.0" encoding="utf-8"?>
<bible version="WEB_PT" language="pt-BR">
  <book id="GEN" name="Gênesis">
    <chapter number="1">
      <verse number="1">No princípio, Deus criou os céus e a terra.</verse>
      <verse number="2">A terra, porém, era sem forma e vazia...</verse>
    </chapter>
  </book>
</bible>
```

### 6.2 Conversion Pipeline

```
Source (USFX/OSIS) → Python script → JSON per book → Import to Supabase bible_verses
```

### 6.3 Storage Options

| Mode | Storage |
|------|---------|
| **Local** | IndexedDB (JSON, ~5MB for full NT) |
| **Supabase** | `bible_verses` table (version_id, book_id, chapter, verse, text) with GIN index |
| **Hybrid** | Core verses local; full text on-demand from Supabase |

---

## 7. Attribution Display Requirements

Every Bible display must show:

```
[Translation Name] — [Attribution]
Exemplo: "World English Bible (Português) — Texto bíblico da World English Bible (domínio público), via eBible.org"
```

In **Preaching Mode**: Small attribution footer (user can disable in settings).

---

## 8. What NOT to Include

| Translation | Reason |
|-------------|--------|
| NVI (Nova Versão Internacional) | Copyrighted by Sociedade Bíblica do Brasil / Biblica |
| ARA (1993+) | Copyrighted (70 years from publication) |
| NAA (Nova Almeida Atualizada) | Copyrighted by Sociedade Bíblica do Brasil |
| NTLH (Nova Tradução na Linguagem de Hoje) | Copyrighted |
| TPT (The Passion Translation) | Copyrighted |
| MSG (The Message) | Copyrighted |

---

## 9. Future: User-Provided Licensed Texts

If a user has a **personal license** for a copyrighted translation:
1. They can upload their own USFX/JSON file via Settings
2. App validates format, stores locally (IndexedDB) or in their Supabase bucket
3. **Never synced/shared** — strictly personal use
4. Clear warning: "You are responsible for license compliance"

---

## 10. Verification Checklist

- [ ] All included texts verified as public domain in target jurisdictions
- [ ] Attribution displayed wherever Bible text appears
- [ ] No copyrighted text in repository or default build
- [ ] Adapter interface allows pluggable sources
- [ ] Default ships with WEB Portuguese (explicit PD)
- [ ] Documentation cites sources for each included translation