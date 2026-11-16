# Mobile Handoff Guide — SpeakerDraft Mobile (Expo + React Native)

**Last Updated:** 2026-10-24  
**Target:** Future mobile development team  
**Status:** Architecture prepared, implementation pending

---

## 1. What's Ready (Shared Packages)

All platform-agnostic logic lives in `packages/` — **do not duplicate** in mobile.

| Package | Exports | Mobile Usage |
|---------|---------|--------------|
| `@speaker-draft/core` | Types, Zod schemas, Bible parser, domain logic, route constants | Direct import — zero modification needed |
| `@speaker-draft/data` | Repository interfaces (`SermonRepository`, etc.) | Implement React Native adapters (SQLite + Supabase) |
| `@speaker-draft/design-tokens` | Colors, typography, spacing, motion, breakpoints as TS objects | Convert to StyleSheet / `react-native-reanimated` values |
| `@speaker-draft/i18n` | Locale config, translation strings | Use with `i18next` + `react-i18next` |
| `@speaker-draft/db-types` | Generated Supabase types (post-migrations) | Direct import for type-safe Supabase client |

---

## 2. What Mobile Must Implement

### 2.1 Repository Adapters (React Native)

```typescript
// apps/mobile/src/adapters/local/SermonRepository.sqlite.ts
import { SermonRepository } from '@speaker-draft/data/repositories';
import { openDatabase } from 'expo-sqlite';

export class SqliteSermonRepository implements SermonRepository {
  private db = openDatabase('speakerdraft.db');
  // Implement all interface methods using expo-sqlite
}

// apps/mobile/src/adapters/supabase/SermonRepository.supabase.ts
import { SermonRepository } from '@speaker-draft/data/repositories';
import { createClient } from '@supabase/supabase-js';

export class SupabaseSermonRepository implements SermonRepository {
  private client = createClient(url, anonKey);
  // Implement using Supabase JS client (works in RN)
}
```

**Selection**: Same env var logic — `EXPO_PUBLIC_STORAGE_BACKEND=local|supabase`

### 2.2 Navigation (Expo Router)

```
app/
├── _layout.tsx          # Root layout, providers
├── (auth)/
│   ├── login.tsx
│   └── register.tsx
├── (app)/
│   ├── _layout.tsx      # Tab layout: Home, Outlines, Bible, Agenda, Library
│   ├── index.tsx        # Dashboard
│   ├── outlines/
│   │   ├── index.tsx    # List (FlashList)
│   │   ├── [id].tsx     # Editor
│   │   └── new.tsx
│   ├── bible/
│   │   ├── index.tsx    # Book/Chapter picker
│   │   └── [book]/[chapter].tsx
│   ├── agenda/
│   │   ├── index.tsx    # Calendar (react-native-calendars)
│   │   └── [id].tsx
│   ├── library/
│   └── settings/
└── +not-found.tsx
```

### 2.3 UI Components (React Native)

| Web (PrimeReact) | Mobile Equivalent |
|------------------|-------------------|
| `DataTable` | `FlashList` (Shopify) + custom row |
| `Dialog` / `Sidebar` | `react-native-reanimated` bottom sheet / drawer |
| `Calendar` / `Schedule` | `react-native-calendars` or `react-native-scheduler` |
| `Tree` | Custom recursive `FolderTree` with `Pressable` |
| `AutoComplete` | `react-native-autocomplete-input` |
| `Chips` | Custom `Chip` component |
| `Toast` | `react-native-toast-message` |
| `ConfirmDialog` | `Alert.alert` or custom modal |
| `TabView` | `react-native-tab-view` |
| `OverlayPanel` | `react-native-popover-view` |
| `SpeedDial` | Custom FAB with `reanimated` |
| `Skeleton` | `react-native-skeleton-placeholder` |
| `ProgressBar` | `Progress` from `react-native-paper` or custom |

### 2.4 Editor (TipTap → React Native)

**Option A**: `react-native-tiptap` (experimental, limited)
**Option B**: Custom block editor with `slate-react-native` or `draft-js` fork
**Option C**: Simplified mobile editor (Markdown + live preview) — **recommended for MVP**

> **Decision**: Start with Markdown editor (`react-native-markdown-editor`) for mobile. Full TipTap parity is complex; desktop web is primary authoring surface.

### 2.5 Bible Text Storage

- **Local**: SQLite (`expo-sqlite`) with `bible_verses` table (same schema as Supabase)
- **Sync**: Download selected translation on first use / settings change
- **Search**: SQLite FTS5 virtual table for full-text search

### 2.6 PDF Import

- `expo-document-picker` + `expo-file-system`
- Text extraction: `pdfjs-dist` via WebView or native `react-native-pdf` (limited text extraction)
- **Honest limitation**: No OCR on mobile either — same messaging as web

### 2.7 Animations

- `react-native-reanimated` v3 for all motion
- Shared values for: drawer, modals, list reorder, tab transitions
- Respect `useReducedMotion` hook (from `react-native-reanimated`)

### 2.8 Offline-First Sync

```
Local (SQLite) ←→ Supabase (Postgres)
     ↑                    ↑
  Mutations            Realtime
     ↓                    ↓
  Queue (WatermelonDB or custom) → Background sync
```

**Recommended**: `WatermelonDB` + `supabase` adapter for robust offline sync. Or custom queue with `expo-background-fetch`.

---

## 3. Design Token Conversion

```typescript
// apps/mobile/src/theme/tokens.ts
import { palette, lightTheme, darkTheme, spacing, radius, fontFamilies, fontSizes } from '@speaker-draft/design-tokens';

export const colors = {
  light: lightTheme,
  dark: darkTheme,
};

export const spacing = spacing; // Direct use (numbers = dp)
export const radius = radius;
export const typography = {
  fontFamilies: {
    sans: 'Inter_400Regular', // Load via expo-font
    serif: 'Newsreader_400Regular',
    mono: 'JetBrainsMono_400Regular',
  },
  fontSizes,
};

// Convert motion tokens for Reanimated
export const motion = {
  duration: { fast: 150, normal: 250, slow: 400 },
  easing: { default: Easing.out(Easing.cubic), spring: Easing.out(Easing.back(1.5)) },
};
```

---

## 4. Supabase Client (Mobile)

```typescript
// apps/mobile/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key) => SecureStore.getItemAsync(key),
      setItem: (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Not a web browser
  },
});
```

---

## 5. Key Differences from Web

| Area | Web | Mobile |
|------|-----|--------|
| **Routing** | React Router v6 | Expo Router (file-based) |
| **State** | Zustand + TanStack Query | Same (works in RN) |
| **Editor** | TipTap (ProseMirror) | Markdown editor (simpler) |
| **PDF** | pdfjs-dist (Worker) | expo-file-system + pdfjs (limited) |
| **Storage** | IndexedDB (`idb`) | SQLite (`expo-sqlite`) + SecureStore |
| **Animations** | Framer Motion + CSS | Reanimated 3 |
| **Calendar** | PrimeReact Schedule | react-native-calendars |
| **Notifications** | Web Push API | Expo Notifications (FCM/APNs) |
| **Wake Lock** | Screen Wake Lock API | `expo-keep-awake` |
| **Haptics** | N/A | `expo-haptics` |
| **Biometrics** | WebAuthn | `expo-local-authentication` |

---

## 6. Required Mobile Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2",
    "@tanstack/react-query": "^5",
    "zustand": "^4",
    "i18next": "^23",
    "react-i18next": "^14",
    "react-hook-form": "^7",
    "@hookform/resolvers": "^3",
    "zod": "^4",
    "expo-router": "~4",
    "expo-sqlite": "~14",
    "expo-secure-store": "~13",
    "expo-file-system": "~17",
    "expo-document-picker": "~12",
    "expo-font": "~13",
    "expo-keep-awake": "~13",
    "expo-haptics": "~13",
    "expo-local-authentication": "~14",
    "expo-notifications": "~0.28",
    "react-native-reanimated": "~3.10",
    "react-native-gesture-handler": "~2.16",
    "react-native-screens": "~4.4",
    "react-native-safe-area-context": "~4.10",
    "@shopify/flash-list": "~1.6",
    "react-native-calendars": "^1.1300",
    "react-native-toast-message": "^2.2",
    "react-native-markdown-editor": "^1.0",
    "pdfjs-dist": "^4",
    "minisearch": "^7"
  }
}
```

---

## 7. Testing Strategy (Mobile)

| Type | Tool | Scope |
|------|------|-------|
| Unit | `jest-expo` + `vitest` | Core logic, adapters |
| Component | `@testing-library/react-native` | UI components |
| Integration | Detox (E2E) | Critical flows |
| Visual | None (manual) | Design review |

---

## 8. Build & Deploy

| Platform | Tool | Notes |
|----------|------|-------|
| iOS | EAS Build → TestFlight → App Store | Needs Apple Developer account |
| Android | EAS Build → Play Console | Needs Google Play account |
| OTA Updates | EAS Update (expo-updates) | For JS bundle updates without store review |

---

## 9. First Steps for Mobile Team

1. **Clone repo**, run `pnpm install`
2. **Verify shared packages**: `pnpm --filter @speaker-draft/core typecheck` passes
3. **Fix mobile deps**: Run `npx expo-doctor` in `apps/mobile`, install missing peers
4. **Set up Supabase**: Copy `.env.example` → `.env`, add credentials
5. **Generate db-types**: `pnpm --filter @speaker-draft/db-types build` (after migrations)
6. **Implement SQLite adapters** for all repositories
7. **Build navigation shell** with Expo Router tabs
8. **Port Dashboard** first (simplest screen)
9. **Implement Outlines list** with FlashList
10. **Build simplified Markdown editor** for mobile

---

## 10. Architecture Decision Records (ADRs)

See `docs/adr/` for:
- ADR-001: Monorepo structure & package boundaries
- ADR-002: Repository pattern with local/Supabase adapters
- ADR-003: TipTap for web, Markdown for mobile
- ADR-004: Bible text adapter pattern
- ADR-005: Offline-first with WatermelonDB (pending)

---

## 11. Contact & Questions

- **Web implementation**: This repo's `apps/web` — reference for UI patterns
- **Shared logic**: `packages/core`, `packages/data` — single source of truth
- **Design tokens**: `packages/design-tokens` — convert to RN StyleSheet
- **Supabase schema**: `supabase/migrations/` (once created)

**Golden Rule**: If it's in `packages/`, it's shared. If it's platform-specific (UI, navigation, native modules), it goes in `apps/mobile` or `apps/web`.