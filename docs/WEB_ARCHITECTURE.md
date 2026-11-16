# Web Architecture — SpeakerDraft Web

**Last Updated:** 2026-10-24  
**Status:** Phase 1 — Foundations & Infrastructure

---

## 1. Diagnosis (Phase 0 Findings)

### Current State (from AUDIT.md)

| Area | Status | Issues |
|------|--------|--------|
| **Monorepo** | ✅ Working | pnpm workspaces + Turborepo configured |
| **TypeScript** | ✅ Strict mode | All packages pass `typecheck` |
| **Web App** | ⚠️ Prototype | Single-file App.tsx (33KB), useState navigation, no router, no PrimeReact usage |
| **Core Package** | ⚠️ Minimal | Basic types + demo data; no Zod schemas, no Bible parser complete |
| **Data Package** | ❌ Web-coupled | Uses localStorage directly in shared package (violates platform boundary) |
| **Design Tokens** | ⚠️ Incomplete | Colors don't match spec; no semantic tokens, no dark theme, no motion |
| **i18n** | ⚠️ Stub | Only locale declaration |
| **Supabase** | ❌ Not ready | Config has API disabled; no migrations, no RLS, no seed |
| **Mobile** | ❌ Broken | Fixed in Phase 0 but not part of web scope |

### Critical Gaps for Web

1. **No routing** — Navigation via `useState<Page>` in single component
2. **No PrimeReact** — Installed but not used; custom SVG icons + CSS only
3. **No state management** — No TanStack Query, no auth context, no theme provider
4. **No editor** — Textarea only; TipTap not installed
5. **No repository abstraction** — localStorage in shared package
6. **No test infrastructure** — Vitest, Playwright not configured
7. **No ESLint config** — ESLint v9 needs flat config

---

## 2. Architecture Decisions

### 2.1 Package Boundaries (Enforced)

```
packages/
├── core/           # ✅ Platform-agnostic: types, schemas, domain logic, Bible parser
├── data/           # 🔄 Repository interfaces + adapters (Local/IndexedDB, Supabase)
├── design-tokens/  # ✅ Design tokens (colors, typography, spacing, motion) as TS + CSS vars
├── i18n/           # 🔄 Translation strings + i18next setup
├── db-types/       # ⏳ Generated from Supabase schema (post-migrations)
└── config/         # ✅ Shared TS/ESLint/Prettier configs

apps/web/           # 🌐 Web-specific: React Router, PrimeReact, TipTap, UI components
apps/mobile/        # 📱 Mobile-specific: Expo Router, React Native, Reanimated
```

**Rule**: `core`, `data` (interfaces), `design-tokens`, `i18n`, `db-types` **must not** import:
- React DOM, PrimeReact, CSS, `window`, `document`, browser APIs
- They must be consumable by React Native

### 2.2 Repository Pattern (Data Layer)

```typescript
// packages/data/src/repositories/
// interfaces (platform-agnostic)
export interface SermonRepository {
  findById(id: string): Promise<Sermon | null>;
  findAll(filters?: SermonFilters): Promise<Sermon[]>;
  create(input: CreateSermonInput): Promise<Sermon>;
  update(id: string, input: UpdateSermonInput): Promise<Sermon>;
  delete(id: string): Promise<void>;
  // ... etc
}

// implementations (platform-specific)
// packages/data/src/adapters/local/SermonRepository.local.ts  → IndexedDB (idb/Dexie)
// packages/data/src/adapters/supabase/SermonRepository.supabase.ts  → Supabase client
```

**Selection**: Via environment variable `VITE_STORAGE_BACKEND=local|supabase` with auto-detection.

### 2.3 Editor Choice: TipTap (ProseMirror)

**Justification**:
- Mature, extensible, headless editor framework
- ProseMirror's structured document model fits sermon outlines (blocks: intro, points, subpoints, illustrations, conclusion)
- Excellent React integration (`@tiptap/react`)
- Extensions for: Bible references, drag-drop reordering, collaboration-ready
- Outputs JSON (ProseMirror schema) — serializable, portable, queryable
- Better than Slate for complex nested structures; better than Quill for customization

**Schema Design** (in `packages/core/src/schemas/document.ts`):
```typescript
// Block types for sermon structure
const blockTypes = [
  'heading',           // H1/H2/H3 for sections
  'paragraph',         // Body text
  'bulletList',        // Points
  'orderedList',       // Numbered points
  'listItem',          // List items
  'blockquote',        // Scripture quotes
  'bibleReference',    // Custom node: inline Bible ref with expansion
  'illustration',      // Custom node: illustration block
  'application',       // Custom node: application block
  'callToAction',      // Custom node: altar call/appeal
  'horizontalRule',    // Section dividers
];
```

### 2.4 PDF Import: pdfjs-dist

- Client-side extraction in browser (Web Workers)
- Worker configured via Vite `worker` plugin
- Text + metadata extraction → LibraryItem creation
- No OCR fallback (honest messaging for scanned PDFs)
- Storage: IndexedDB (local) or Supabase Storage (remote)

### 2.5 Search: MiniSearch (Local) + Postgres FTS (Supabase)

- **Local**: MiniSearch index in memory + IndexedDB persistence
- **Supabase**: `tsvector` + GIN indexes on content columns
- Unified `SearchService` interface with both implementations

### 2.6 State Management

| Layer | Tool | Scope |
|-------|------|-------|
| Server state | TanStack Query | API calls, caching, mutations |
| Client state | Zustand | UI state (sidebar, modals, editor) |
| Auth | Supabase Auth + Context | User session, profile |
| Theme | Context + CSS vars | Light/dark/system |
| i18n | i18next + react-i18next | Translations |

---

## 3. Folder Structure (apps/web/src)

```
apps/web/src/
├── app/
│   ├── providers.tsx      # Theme, Auth, Query, i18n providers
│   ├── router.tsx         # React Router v6 routes
│   ├── layout.tsx         # Shell: Sidebar + Topbar + Outlet
│   └── routes/            # Route components (lazy-loaded)
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/
│   ├── outlines/
│   │   ├── components/    # OutlineList, OutlineCard, OutlineTable, Filters
│   │   ├── editor/        # TipTap editor components
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/
│   ├── bible/
│   ├── agenda/
│   ├── library/
│   ├── notes/
│   ├── search/
│   └── settings/
├── components/            # Shared web UI (Button, Card, Modal, etc.)
│   ├── ui/               # PrimeReact wrappers with custom styling
│   ├── layout/
│   └── feedback/
├── hooks/                # Shared hooks (useTheme, useAuth, etc.)
├── styles/
│   ├── globals.css       # CSS reset, CSS variables, base styles
│   ├── tokens.css        # Design token CSS custom properties
│   ├── primereact.css    # PrimeReact theme overrides
│   └── utilities.css     # Helper classes
├── lib/                  # Utilities, constants
└── test/                 # Test utilities, mocks
```

---

## 4. Implementation Plan (Phased)

### Phase 1: Foundations (Weeks 1-2)
- [ ] Complete design tokens (WCAG AA, dark theme, motion tokens)
- [ ] Generate CSS variables, integrate with PrimeReact theme
- [ ] Complete Zod schemas in `core` for all entities
- [ ] Enhance Bible parser, add verse text adapter interface
- [ ] Define repository interfaces in `data`
- [ ] Implement Local adapters (IndexedDB via `idb`)
- [ ] Create Supabase migrations + RLS policies
- [ ] Generate `db-types` package
- [ ] Set up React Router, providers, app shell
- [ ] Configure PrimeReact with custom theme
- [ ] Set up ESLint flat config, Vitest, Playwright

### Phase 2: Core Features (Weeks 3-5)
- [ ] Authentication (Supabase + local demo mode)
- [ ] Dashboard with real data
- [ ] Outlines: List (PrimeReact DataTable), CRUD, filters
- [ ] TipTap editor with custom sermon schema
- [ ] Autosave + keyboard shortcuts + preview + export
- [ ] Preaching Mode (immersive, timer, Wake Lock)

### Phase 3: Extended Features (Weeks 6-8)
- [ ] Bible Reader (passage, search, parallel, highlights)
- [ ] Agenda (Calendar view, CRUD, drag-reschedule)
- [ ] Library (PDF import, text extraction, search index)
- [ ] Notes (rich editor, linking, pin/archive)
- [ ] Global Search (Cmd+K, MiniSearch, grouped results)

### Phase 4: Polish & Integration (Weeks 9-10)
- [ ] Favorites/Tags/Categories management
- [ ] Profile & Settings (export/import, deletion)
- [ ] Supabase integration (Auth, Realtime, Storage)
- [ ] Animations (Framer Motion), reduced motion
- [ ] Accessibility audit, responsive polish

### Phase 5: Testing & Docs (Week 11)
- [ ] Unit tests (core, data)
- [ ] Integration tests (pgTAP for RLS)
- [ ] E2E tests (Playwright critical flows)
- [ ] Final documentation

---

## 5. Key Dependencies (Web)

| Category | Packages |
|----------|----------|
| **Core** | `react@18`, `react-dom@18`, `react-router@6`, `typescript@5` |
| **UI** | `primereact@10`, `primeicons@7`, `framer-motion@11` |
| **Editor** | `@tiptap/react@2`, `@tiptap/starter-kit`, `@tiptap/extension-*` |
| **Forms** | `react-hook-form@7`, `@hookform/resolvers`, `zod@4` |
| **State** | `@tanstack/react-query@5`, `zustand@4` |
| **Auth/Backend** | `@supabase/supabase-js@2` |
| **Search** | `minisearch@7` |
| **PDF** | `pdfjs-dist@4` |
| **Bible** | Custom parser in `core` + pluggable text adapters |
| **i18n** | `i18next@23`, `react-i18next@14` |
| **Storage** | `idb@8` (IndexedDB wrapper) |
| **Dev** | `vite@6`, `vitest@2`, `playwright@1`, `eslint@9` |

---

## 6. Supabase Schema Overview (Planned)

```sql
-- Core tables with RLS
profiles (id, email, full_name, avatar_url, role, denomination, theme_preference)
sermons (id, owner_id, kind, title, bible_references[], tags[], folder_id, status, content_json, plain_text, duration_minutes, preached_at)
folders (id, owner_id, name, parent_id, color, icon)
tags (id, owner_id, name, color)
events (id, owner_id, title, date, time, location, event_type, document_id, notes, status)
library_items (id, owner_id, item_type, title, author, content, citation, tags[], bible_references[])
notes (id, owner_id, title, body, linked_sermon_id, linked_verse_id, linked_library_id, is_pinned, is_archived, tags[])
favorites (id, owner_id, favoritable_type, favoritable_id)
bible_versions (id, code, name, language, license, attribution, source_url)
bible_verses (version_id, book_id, chapter, verse, text)
```

**RLS Policy Pattern**: All tables enable RLS; policies restrict to `auth.uid() = owner_id`.

---

## 7. Bible Text Licensing Strategy

**Principle**: Only public domain or explicitly licensed translations.

| Translation | License | Status |
|-------------|---------|--------|
| Almeida Revista e Atualizada (ARA) - 1993 | Public domain (Brazil) | ✅ Candidate |
| King James Version (KJV) | Public domain | ✅ Candidate |
| World English Bible (WEB) | Public domain | ✅ Candidate |
| ASV (1901) | Public domain | ✅ Candidate |
| NVI, NAA, NTLH, etc. | Copyrighted | ❌ Cannot use without license |

**Implementation**: Pluggable `BibleTextAdapter` interface in `core`. Default ships with minimal public domain text (WEB/ARA 1993) clearly marked. Users can add licensed translations via settings if they have rights.

---

## 8. Mobile Handoff Preparation

Shared packages ready for mobile:
- `core` — All types, schemas, Bible parser, domain logic
- `data` — Repository interfaces (mobile implements React Native adapters)
- `design-tokens` — Tokens as TS objects (convertible to RN StyleSheet)
- `i18n` — Translation strings
- `db-types` — Generated Supabase types

Mobile will need:
- React Native adapters for repositories (SQLite/AsyncStorage + Supabase)
- Native navigation (Expo Router)
- Reanimated for animations
- Native PDF handling (expo-file-system + PDF parser)
- Platform-specific Bible text storage (SQLite)