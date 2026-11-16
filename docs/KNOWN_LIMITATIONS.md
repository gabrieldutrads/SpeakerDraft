# Known Limitations — SpeakerDraft Web

**Last Updated:** 2026-10-24  
**Status:** Documented for transparency

---

## 1. Bible Text Availability

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **No licensed Portuguese translation by default** | Bible reader shows placeholder text; verse expansion in editor unavailable | Ships with WEB Portuguese (public domain); pluggable adapter for user-provided texts |
| **ARA/NVI/NAA/NTLH cannot be included** | Users familiar with these translations won't find them | Clear documentation; user can add if they have personal license |
| **No audio Bible** | No text-to-speech or audio playback | Future: integrate with public domain audio sources (e.g., Bible.is) |
| **No cross-references/footnotes** | Study experience limited | Future: add if source data includes them |

---

## 2. Supabase / Backend

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **No Supabase project configured** | Auth, realtime, storage, sync unavailable | Full local mode (IndexedDB) works; Supabase integration ready when credentials provided |
| **No real-time collaboration** | Multiple users can't edit same outline simultaneously | Single-user focus; future: Yjs + Supabase Realtime |
| **No push notifications** | Agenda reminders only work when app open | Future: Expo Notifications + Supabase Edge Functions |
| **No server-side rendering** | SEO limited (not needed for app) | SPA only; acceptable for authenticated app |
| **No background sync (web)** | Local changes don't sync until online + manual | Future: Service Worker + Background Sync API |

---

## 3. PDF Import

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **No OCR for scanned PDFs** | Image-only PDFs return no text | Honest error message: "Este PDF não contém texto extraível. OCR não está disponível." |
| **No password-protected PDF support** | Encrypted PDFs fail silently | Detect encryption, show clear message |
| **Large PDFs may crash tab** | pdfjs-dist worker memory limits | File size limit (50MB); chunked processing |
| **Formatting loss** | Extracted text is plain, no structure | Acceptable for search/indexing; user edits after import |

---

## 4. Editor (TipTap)

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **No collaborative editing** | Single user only | Future: Yjs integration |
| **No inline image paste/upload** | Images must be added via library | Future: TipTap image extension + Supabase Storage |
| **No table support** | Tables not in sermon schema | Not needed for sermon outlines |
| **Limited undo/redo across blocks** | ProseMirror history per-doc | Acceptable for single-user |

---

## 5. Mobile Parity

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Mobile app not built** | No native iOS/Android app | Architecture ready; handoff guide in `MOBILE_HANDOFF.md` |
| **No offline-first sync (web)** | Local data trapped in browser | Export/Import JSON; future: Service Worker sync |
| **No native share sheet** | Can't share outlines to other apps | Future: Web Share API |

---

## 6. Accessibility

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **No screen reader testing with NVDA/JAWS** | Potential issues undiscovered | Test with VoiceOver (macOS) + NVDA (Windows) before launch |
| **No high-contrast mode** | Users with low vision may struggle | CSS `prefers-contrast: more` support planned |
| **Keyboard shortcuts not fully documented** | Power users may miss features | Command palette (Cmd+K) shows all shortcuts |

---

## 7. Internationalization

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Only pt-BR implemented** | Non-Portuguese users excluded | i18next infrastructure ready; add locale files for other languages |
| **Bible books only in Portuguese** | Reference parser language-specific | Parser supports aliases; add locale-specific alias maps |

---

## 8. Performance

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **No virtualization in outline list (yet)** | Large libraries (>500) may lag | PrimeReact DataTable has virtualization; enable it |
| **Search index rebuilt on load** | Slow startup with many documents | Persist MiniSearch index to IndexedDB |
| **TipTap bundle size** | ~150KB gzipped | Code-split editor route; lazy load |

---

## 9. Security

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **No Content Security Policy** | XSS risk if unsanitized content rendered | TipTap outputs sanitized HTML; DOMPurify on any user HTML |
| **No rate limiting on auth (local mode)** | Brute force possible in local demo | Supabase Auth has built-in rate limiting |
| **localStorage/IndexedDB unencrypted** | Local data readable on device | Acceptable for personal device; Supabase encrypts at rest |

---

## 10. Testing Coverage

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **No E2E tests implemented** | Regressions possible | Playwright config ready; critical flows first |
| **No pgTAP tests for RLS** | RLS policies untested | Required before Supabase enable |
| **No visual regression testing** | UI drift possible | Future: Chromatic or Playwright screenshots |

---

## 11. Features Not in Scope (v1)

| Feature | Reason |
|---------|--------|
| Multi-user workspaces / teams | Complexity; single-user focus |
| Sermon series management (beyond folders) | Folders + tags sufficient for v1 |
| Video/audio recording in Preaching Mode | Privacy, storage complexity |
| AI-assisted writing (sermon generation) | Post-MVP; ethical considerations |
| Public sharing / publishing | Privacy-first; personal tool |
| Multi-device sync without Supabase | Requires backend |
| Plugin/extension system | Over-engineering for v1 |

---

## 12. Technical Debt (Intentional)

| Debt | Reason | Paydown Plan |
|------|--------|--------------|
| Single-file `App.tsx` prototype | Phase 0 speed | Refactor to `features/` structure in Phase 1 |
| Custom SVG icons instead of PrimeReact | Phase 0 speed | Replace with PrimeReact + custom theme |
| `window.alert`/`prompt` for forms | Prototype only | Replace with React Hook Form + PrimeReact Dialog |
| localStorage in `packages/data` | Violates boundary | Move to `LocalAdapter` in Phase 1 |
| No ESLint flat config | ESLint v9 migration pending | Add `eslint.config.js` in Phase 1 |

---

## 13. Browser Support

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 110+ | Full support |
| Firefox | 115+ | Full support |
| Safari | 16+ | Full support (IndexedDB, Wake Lock) |
| Edge | 110+ | Full support |
| **Mobile Safari** | 16+ | PWA installable; Wake Lock requires user gesture |
| **Chrome Android** | 110+ | PWA installable |

**Not supported**: IE11, Safari < 16 (no modern crypto, IndexedDB issues)

---

## 14. Data Portability

| Format | Export | Import |
|--------|--------|--------|
| JSON (full) | ✅ | ✅ (with validation) |
| Markdown (outlines) | ✅ | ❌ (planned) |
| PDF (preaching mode) | ✅ (print) | ❌ |
| CSV (agenda) | ❌ | ❌ |

---

## 15. When to Revisit

| Limitation | Trigger for Revisit |
|------------|---------------------|
| Bible text licensing | Partnership with Bible society / user demand |
| Collaborative editing | Team feature requests |
| Mobile app | User demand + resources |
| AI features | Clear ethical framework + user request |
| Public API | Ecosystem demand |