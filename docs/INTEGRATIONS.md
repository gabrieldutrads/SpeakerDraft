# Integrations — SpeakerDraft

**Last Updated:** 2026-10-24  
**Status:** Phase 1 — Supabase not configured; local mode only

---

## 1. Supabase Status

### 1.1 Current Configuration

| Setting | Value | Status |
|---------|-------|--------|
| Project ID | `speaker-draft` | Configured in `supabase/config.toml` |
| API Enabled | `true` | ✅ (was `false`, needs verification) |
| Studio Enabled | `true` | ✅ |
| Auth Enabled | `true` | ✅ |
| Realtime Enabled | `true` | ✅ |
| Storage Enabled | `true` | ✅ |
| Local Ports | API: 54321, DB: 54322, Studio: 54323 | Configured |

### 1.2 What's Missing

- [ ] **Migrations** — No SQL migrations in `supabase/migrations/`
- [ ] **Seed Data** — `seed.sql` is placeholder only
- [ ] **RLS Policies** — None defined
- [ ] **Types Generation** — `packages/db-types` empty
- [ ] **Edge Functions** — `supabase/functions/` empty
- [ ] **Credentials** — No `.env` with `SUPABASE_URL` and `SUPABASE_ANON_KEY`

### 1.3 Required Environment Variables

```bash
# .env (NOT committed - see .env.example)
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
# Optional: for server-side/admin operations (never in frontend)
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### 1.4 Detection Logic (Runtime)

```typescript
// apps/web/src/lib/supabase.ts
const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL &&
                          import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = hasSupabaseConfig;

// Repository selection
export const repositoryBackend = isSupabaseConfigured ? 'supabase' : 'local';
```

---

## 2. Supabase Schema Plan (Migrations)

### 2.1 Migration Order

```
001_initial_schema.sql      -- Core tables, RLS enabled
002_indexes.sql             -- Performance indexes, GIN for search
003_rls_policies.sql        -- All RLS policies
004_realtime.sql            -- Realtime publications
005_storage.sql             -- Storage buckets + policies
006_functions.sql           -- Helper functions, triggers
```

### 2.2 Core Tables (001)

```sql
-- profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT,
  denomination TEXT,
  theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('system','light','dark')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- sermons (documents)
CREATE TABLE sermons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'sermon' CHECK (kind IN ('sermon','teaching','devotional','study_note','quick_note')),
  title TEXT NOT NULL DEFAULT 'Sem título',
  bible_references TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_progress','ready','archived')),
  content_json JSONB NOT NULL DEFAULT '{"type":"doc","content":[{"type":"paragraph"}],"schema_version":1}',
  plain_text TEXT DEFAULT '',
  duration_minutes INT,
  preached_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- folders (hierarchical)
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- events (agenda)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT,
  event_type TEXT NOT NULL DEFAULT 'culto' CHECK (event_type IN ('culto','ebd','estudo','conferencia','reuniao','outro')),
  document_id UUID REFERENCES sermons(id) ON DELETE SET NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- library_items
CREATE TABLE library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL DEFAULT 'illustration' CHECK (item_type IN ('illustration','quote','exegetical_note','commentary','outline_template')),
  title TEXT NOT NULL,
  author TEXT,
  content TEXT NOT NULL,
  citation TEXT,
  tags TEXT[] DEFAULT '{}',
  bible_references TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- notes
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  linked_sermon_id UUID REFERENCES sermons(id) ON DELETE SET NULL,
  linked_verse_id UUID, -- references bible_verses if needed
  linked_library_id UUID REFERENCES library_items(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- favorites (polymorphic)
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  favoritable_type TEXT NOT NULL CHECK (favoritable_type IN ('sermon','event','library_item','note','verse')),
  favoritable_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (owner_id, favoritable_type, favoritable_id)
);

-- bible_versions (for multi-translation support)
CREATE TABLE bible_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE, -- e.g., 'ARA', 'WEB', 'KJV'
  name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'pt-BR',
  license TEXT NOT NULL, -- 'public_domain', 'licensed'
  attribution TEXT,
  source_url TEXT,
  is_default BOOLEAN DEFAULT FALSE
);

-- bible_verses (pluggable text)
CREATE TABLE bible_verses (
  version_id UUID NOT NULL REFERENCES bible_versions(id) ON DELETE CASCADE,
  book_id INT NOT NULL, -- 1-66
  chapter INT NOT NULL,
  verse INT NOT NULL,
  text TEXT NOT NULL,
  PRIMARY KEY (version_id, book_id, chapter, verse)
);
```

### 2.3 RLS Policies (003)

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
-- bible_versions and bible_verses are public read

-- Policy pattern: users only access their own data
CREATE POLICY "Users can manage own profiles" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own sermons" ON sermons
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can manage own folders" ON folders
  FOR ALL USING (auth.uid() = owner_id);

-- ... repeat for all user-owned tables
```

### 2.4 Search Indexes (002)

```sql
-- Full-text search on sermons
CREATE INDEX sermons_fts_idx ON sermons USING GIN (
  to_tsvector('portuguese', title || ' ' || plain_text)
);

-- Partial index for active sermons
CREATE INDEX sermons_active_idx ON sermons (owner_id, status)
  WHERE deleted_at IS NULL AND status != 'archived';

-- Events by date
CREATE INDEX events_date_idx ON events (owner_id, date, time);

-- Library items search
CREATE INDEX library_items_fts_idx ON library_items USING GIN (
  to_tsvector('portuguese', title || ' ' || content)
);
```

---

## 3. Local Mode Implementation

### 3.1 Storage Backend: IndexedDB (via `idb`)

```typescript
// packages/data/src/adapters/local/db.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SpeakerDraftDB extends DBSchema {
  sermons: { key: string; value: Sermon; indexes: { 'by-updated': string; 'by-status': string } };
  events: { key: string; value: CalendarEvent; indexes: { 'by-date': string } };
  notes: { key: string; value: StudyNote; indexes: { 'by-updated': string } };
  library: { key: string; value: LibraryItem; indexes: { 'by-updated': string } };
  favorites: { key: string; value: Favorite; indexes: { 'by-type': string } };
  settings: { key: string; value: UserSettings };
  searchIndex: { key: string; value: SearchDocument };
}

export const dbPromise = openDB<SpeakerDraftDB>('speakerdraft', 1, {
  upgrade(db) {
    // Create object stores with indexes
    const sermons = db.createObjectStore('sermons', { keyPath: 'id' });
    sermons.createIndex('by-updated', 'updatedAt');
    sermons.createIndex('by-status', 'status');
    // ... etc
  },
});
```

### 3.2 Repository Adapter Interface

```typescript
// packages/data/src/repositories/SermonRepository.ts
export interface SermonRepository {
  findById(id: string): Promise<Sermon | null>;
  findAll(filters?: SermonFilters): Promise<Sermon[]>;
  create(input: CreateSermonInput): Promise<Sermon>;
  update(id: string, input: UpdateSermonInput): Promise<Sermon>;
  delete(id: string): Promise<void>;
  duplicate(id: string): Promise<Sermon>;
  archive(id: string): Promise<void>;
  restore(id: string): Promise<void>;
}

// Local implementation
export class LocalSermonRepository implements SermonRepository { ... }

// Supabase implementation
export class SupabaseSermonRepository implements SermonRepository { ... }
```

### 3.3 Sync Strategy (Future)

| Field | Purpose |
|-------|---------|
| `id` | UUID (client-generated, same across devices) |
| `created_at` | Server timestamp (immutable) |
| `updated_at` | Server timestamp (last sync) |
| `deleted_at` | Soft delete for sync |
| `version` | Integer for conflict resolution |

**Conflict Resolution**: Last-write-wins with `updated_at`; UI shows conflict banner if local newer than server.

---

## 4. Other Integrations

### 4.1 Bible Text Sources

See `docs/BIBLE_SOURCES.md` for licensing and adapter details.

### 4.2 PDF Processing

- **Library**: `pdfjs-dist@4.x`
- **Worker**: Configured via Vite `worker` plugin
- **Storage**: Local = IndexedDB (base64 or blob); Remote = Supabase Storage
- **No OCR**: Honest messaging for image-only PDFs

### 4.3 Export/Import

- **Export**: Full JSON dump of all local data
- **Import**: Validate with Zod schemas, merge with conflict resolution
- **Format**: Versioned JSON with metadata

---

## 5. What's Needed to Enable Supabase

1. **Create Supabase project** at supabase.com
2. **Run migrations** via `supabase db push` or CLI
3. **Copy credentials** to `.env`:
   ```bash
   VITE_SUPABASE_URL=https://xyz.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
4. **Enable Realtime** for tables needing live updates
5. **Configure Storage** buckets: `library`, `avatars`
6. **Test RLS** with pgTAP (see `docs/TESTING.md`)

---

## 6. Current Limitations

| Limitation | Workaround |
|------------|------------|
| No Supabase credentials | Local mode fully functional |
| No real-time sync | Manual export/import |
| No push notifications | Not implemented |
| No social auth | Email/password only |
| No server-side rendering | SPA only (Vite) |