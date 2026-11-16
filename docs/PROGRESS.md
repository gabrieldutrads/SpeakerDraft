# Progress Tracker — SpeakerDraft Web

**Last Updated:** 2026-10-24  
**Current Phase:** Phase 1 — Foundations & Infrastructure (Implementation Started)

---

## Module Status Overview

| Module | Status | Notes |
|--------|--------|-------|
| **Phase 0: Inspection & Audit** | ✅ Completed | Audit docs exist (AUDIT.md, DEPENDENCIES.md, TESTING.md, TROUBLESHOOTING.md) |
| **Design System (tokens, themes, typography)** | 🔄 In Progress | Partial tokens in `packages/design-tokens`; needs WCAG validation, dark theme, PrimeReact integration |
| **Shared Types & Schemas (Zod)** | 🔄 In Progress | Core has basic types; needs canonical schemas, Bible parser, ProseMirror doc schema |
| **Repository Layer (Local + Supabase)** | ⏳ Pending | Only localStorage stub in `packages/data`; needs adapter pattern |
| **Supabase Auth & Migrations** | ⏳ Pending | Config exists but no migrations, no RLS |
| **App Shell (Layout, Sidebar, Router, Providers)** | ⏳ Pending | Web uses useState navigation; needs React Router, providers |
| **Authentication** | ⏳ Pending | Local demo mode only; needs Supabase Auth integration |
| **Dashboard** | ⏳ Pending | Static prototype in App.tsx; needs real data integration |
| **Outlines (CRUD, List, Filters)** | ⏳ Pending | Basic Outline type exists; needs full CRUD, PrimeReact DataTable |
| **Advanced Editor (TipTap)** | ⏳ Pending | Textarea only; needs TipTap block editor, autosave, keyboard shortcuts |
| **Preaching Mode** | ⏳ Pending | Basic prototype; needs immersive reader, timer, Wake Lock, keyboard nav |
| **Bible & References** | 🔄 In Progress | Parser exists in core; needs licensed text source, reader UI, integration |
| **Agenda & Events** | ⏳ Pending | Basic CalendarEvent type; needs Calendar view, CRUD, drag-reschedule |
| **Library & PDF Import** | ⏳ Pending | File upload stub; needs pdfjs-dist, text extraction, IndexedDB/Supabase Storage |
| **Notes** | ⏳ Pending | Basic StudyNote type; needs rich editor, linking, pin/archive |
| **Global Search (Cmd+K)** | ⏳ Pending | Basic filter in App.tsx; needs MiniSearch/FlexSearch, grouped results |
| **Favorites, Categories, Tags** | ⏳ Pending | No management UI; needs centralized management |
| **Profile & Settings** | ⏳ Pending | Basic theme toggle; needs full profile, export/import, account deletion |
| **Polish (Animations, A11y, Responsive)** | ⏳ Pending | CSS exists; needs prefers-reduced-motion, skeletons, focus management |
| **Tests (Unit, Integration, E2E)** | ⏳ Pending | No test config; needs Vitest, Playwright, pgTAP |
| **Documentation** | ✅ Completed | All 9 required docs created (PROGRESS, WEB_ARCHITECTURE, DESIGN_SYSTEM, INTEGRATIONS, BIBLE_SOURCES, MOBILE_HANDOFF, KNOWN_LIMITATIONS, apps/web/README, .env.example) |

---

## Phase 1: Foundations (Current)

- [ ] **Design System** — Complete tokens, semantic colors, dark theme, CSS variables, PrimeReact theme
- [ ] **Shared Types** — Zod schemas for all entities, Bible types, ProseMirror doc schema
- [ ] **Bible Parser** — Enhance parser, add book/chapter/verse navigation, verse text adapter
- [ ] **Repository Layer** — Define interfaces, implement Local (IndexedDB) and Supabase adapters
- [ ] **Supabase Migrations** — Create schema with RLS, generate db-types
- [ ] **App Shell** — React Router, providers (Theme, Auth, Query), layout components
- [ ] **PrimeReact Setup** — Configure PrimeReact with custom theme, global CSS reset

## Phase 2: Core Features

- [ ] **Authentication** — Login, register, password reset, session persistence, local demo mode
- [ ] **Dashboard** — Real data aggregation, quick actions, stats
- [ ] **Outlines** — List (table/cards), filters, CRUD, duplicate, archive
- [ ] **Editor** — TipTap block editor, autosave indicator, keyboard shortcuts, preview, export
- [ ] **Preaching Mode** — Immersive reader, timer, font/theme controls, Wake Lock, keyboard nav

## Phase 3: Extended Features

- [ ] **Bible Reader** — Passage view, search, parallel translations, verse highlights
- [ ] **Agenda** — Month/Week/List views, CRUD, drag-reschedule, outline linking
- [ ] **Library** — PDF import (pdfjs-dist), text extraction, IndexedDB/S3, search index
- [ ] **Notes** — Rich editor, linking, pin/archive, tags
- [ ] **Global Search** — Cmd+K, MiniSearch index, grouped results, recent items

## Phase 4: Polish & Integration

- [ ] **Favorites/Tags/Categories** — Centralized management, cross-module filters
- [ ] **Profile & Settings** — Theme, language, Bible translation, export/import, deletion
- [ ] **Supabase Integration** — Auth, real-time, Storage, sync strategy
- [ ] **Animations** — Page transitions, micro-interactions, reduced motion
- [ ] **Accessibility** — Keyboard nav, ARIA, focus management, screen reader announcements
- [ ] **Responsive** — Mobile drawer, tablet layouts, touch targets

## Phase 5: Testing & Docs

- [ ] **Unit Tests** — Bible parser, domain logic, repositories, search index
- [ ] **Integration Tests** — Supabase RLS (pgTAP), repository adapters
- [ ] **E2E Tests** — Critical flows (Playwright)
- [ ] **Final Documentation** — All docs complete, mobile handoff guide

---

## Known Limitations (to be documented in KNOWN_LIMITATIONS.md)

- No licensed Bible text available — structure ready, text pluggable
- Supabase not configured — local mode only until credentials provided
- Mobile app not developed — architecture prepared for handoff
- No CI/CD pipeline configured
- PDF text extraction requires pdfjs-dist worker setup