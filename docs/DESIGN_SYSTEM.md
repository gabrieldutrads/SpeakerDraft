# Design System — SpeakerDraft Web

**Last Updated:** 2026-10-24  
**Version:** 1.0  
**Status:** Phase 1 — Implementation in progress

---

## 1. Design Principles

| Principle | Description |
|-----------|-------------|
| **Clarity over density** | Generous whitespace, clear hierarchy, readable typography |
| **Calm authority** | Navy depth for structure, gold for sacred accents, sage for peaceful actions |
| **Editorial comfort** | Serif for reading/preaching, sans for UI — like a well-crafted book |
| **Fluid & fast** | Animations only on `transform`/`opacity`, respect `prefers-reduced-motion` |
| **Accessible by default** | WCAG AA contrast, visible focus, keyboard navigation, screen reader support |
| **Platform consistency** | Tokens shared; web = PrimeReact + CSS, mobile = React Native StyleSheet |

---

## 2. Color Palette (Mandatory Tokens)

### 2.1 Base Palette (from spec)

| Role | Hex | Usage |
|------|-----|-------|
| **Navy (Primary)** | `#17243A` | Primary brand, dark theme background, primary buttons |
| **Ivory/Cream (Background)** | `#F7F4ED` | Light theme background, reading surfaces |
| **Gold (Accent)** | `#C9A86A` | Highlights, CTAs, active states, sacred emphasis |
| **Sage (Secondary)** | `#527568` | Success states, secondary actions, calm emphasis |

### 2.2 Full Scale (50–950)

All scales defined in `packages/design-tokens/src/colors.ts` as `palette.navy`, `palette.cream`, `palette.gold`, `palette.sage`, `palette.charcoal`.

### 2.3 Semantic Tokens (Light Theme)

```css
:root {
  /* Surfaces */
  --sd-background: #F7F4ED;           /* cream[100] */
  --sd-surface: #FFFFFF;              /* Pure white */
  --sd-surface-subtle: #FAF9F5;       /* cream[50] */
  --sd-surface-elevated: #FFFFFF;     /* Cards, modals */
  --sd-surface-hover: #EFECE3;        /* cream[200] */

  /* Borders */
  --sd-border: #E5E0D8;               /* cream[300] */
  --sd-border-subtle: #ECE7DF;
  --sd-border-focus: #17243A;         /* navy[800] */

  /* Text */
  --sd-text-primary: #252A32;         /* charcoal[700] */
  --sd-text-secondary: #6E7681;       /* charcoal[400] */
  --sd-text-muted: #8C95A0;
  --sd-text-inverse: #F7F4ED;         /* cream[100] */

  /* Brand */
  --sd-primary: #17243A;              /* navy[800] */
  --sd-primary-foreground: #F7F4ED;   /* cream[100] */
  --sd-primary-hover: #243B53;        /* navy[700] */
  --sd-accent: #C9A86A;               /* gold[400] */
  --sd-accent-foreground: #0F1724;    /* navy[900] */
  --sd-accent-secondary: #527568;     /* sage[500] */

  /* Status */
  --sd-success: #527568;              /* sage[500] */
  --sd-success-bg: #EBF4F0;
  --sd-warning: #D99B26;
  --sd-warning-bg: #FDF6E9;
  --sd-error: #C0392B;
  --sd-error-bg: #FDEEED;
  --sd-info: #3A6B88;
  --sd-info-bg: #EDF5F9;
}
```

### 2.4 Semantic Tokens (Dark Theme)

```css
[data-theme="dark"], .dark {
  --sd-background: #0F1724;           /* navy[900] */
  --sd-surface: #17243A;              /* navy[800] */
  --sd-surface-subtle: #141E2E;
  --sd-surface-elevated: #1E2B40;
  --sd-surface-hover: #23334D;

  --sd-border: #2C3A50;
  --sd-border-subtle: #1D2A3D;
  --sd-border-focus: #C9A86A;         /* gold[400] */

  --sd-text-primary: #F7F4ED;         /* cream[100] */
  --sd-text-secondary: #A8B2C1;
  --sd-text-muted: #6C7A8E;
  --sd-text-inverse: #252A32;         /* charcoal[700] */

  --sd-primary: #C9A86A;              /* gold[400] */
  --sd-primary-foreground: #0F1724;   /* navy[900] */
  --sd-primary-hover: #DBBE82;        /* gold[300] */
  --sd-accent: #C9A86A;               /* gold[400] */
  --sd-accent-foreground: #0F1724;
  --sd-accent-secondary: #689584;

  --sd-success: #689584;
  --sd-success-bg: #132A20;
  --sd-warning: #E2AB40;
  --sd-warning-bg: #2D200E;
  --sd-error: #E05344;
  --sd-error-bg: #2D1412;
  --sd-info: #4B88AB;
  --sd-info-bg: #12232E;
}
```

### 2.5 WCAG AA Contrast Verification

| Pair | Ratio | Pass |
|------|-------|------|
| Navy `#17243A` on Cream `#F7F4ED` | 12.6:1 | ✅ AAA |
| Gold `#C9A86A` on Navy `#17243A` | 6.8:1 | ✅ AA |
| Sage `#527568` on Cream `#F7F4ED` | 5.2:1 | ✅ AA |
| Charcoal `#252A32` on Cream `#F7F4ED` | 13.8:1 | ✅ AAA |
| Cream `#F7F4ED` on Navy `#0F1724` | 15.3:1 | ✅ AAA |

**Gold on white fails AA** — never use gold text on light backgrounds. Use gold only on navy/dark surfaces or as decorative accent.

---

## 3. Typography

### 3.1 Font Families

| Role | Font Stack | Source |
|------|------------|--------|
| **Sans (UI)** | `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` | Google Fonts (self-hosted via `@fontsource/inter`) |
| **Serif (Reading)** | `"Newsreader", "Merriweather", Georgia, Cambria, serif` | Google Fonts (self-hosted via `@fontsource/newsreader`) |
| **Mono (Code)** | `"JetBrains Mono", "Fira Code", monospace` | Google Fonts (self-hosted via `@fontsource/jetbrains-mono`) |

**Self-hosting**: All fonts downloaded to `apps/web/public/fonts/` with `@font-face` in `globals.css`. No external font requests.

### 3.2 Type Scale

| Token | Size (px) | Line Height | Weight | Usage |
|-------|-----------|-------------|--------|-------|
| `--sd-text-xs` | 12 | 1.5 | 400 | Captions, labels |
| `--sd-text-sm` | 14 | 1.5 | 400 | Body small, meta |
| `--sd-text-base` | 16 | 1.5 | 400 | Body default |
| `--sd-text-lg` | 18 | 1.625 | 400 | Body large, reading |
| `--sd-text-xl` | 20 | 1.625 | 500 | Subheadings |
| `--sd-text-2xl` | 24 | 1.375 | 600 | Section headings |
| `--sd-text-3xl` | 30 | 1.25 | 700 | Page titles |
| `--sd-text-4xl` | 36 | 1.25 | 700 | Hero, preaching mode |
| `--sd-text-5xl` | 48 | 1.15 | 700 | Display, login hero |

### 3.3 Reading Mode (Preaching/Bible)

- **Font**: Serif (Newsreader)
- **Size**: User-adjustable (base 20px, range 16–28px)
- **Line height**: 1.8 (loose)
- **Max width**: 42ch (optimal reading measure)
- **Letter spacing**: 0.01em

---

## 4. Spacing & Layout

### 4.1 Spacing Scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| `--sd-space-0` | 0 | Reset |
| `--sd-space-1` | 4px | Micro gaps |
| `--sd-space-2` | 8px | Tight gaps |
| `--sd-space-3` | 12px | Small gaps |
| `--sd-space-4` | 16px | Standard unit |
| `--sd-space-5` | 20px | Medium |
| `--sd-space-6` | 24px | Large |
| `--sd-space-8` | 32px | Section gaps |
| `--sd-space-10` | 40px | Major sections |
| `--sd-space-12` | 48px | Page margins |
| `--sd-space-16` | 64px | Hero sections |

### 4.2 Border Radius

| Token | Value |
|-------|-------|
| `--sd-radius-none` | 0 |
| `--sd-radius-xs` | 2px |
| `--sd-radius-sm` | 4px |
| `--sd-radius-md` | 8px |
| `--sd-radius-lg` | 12px |
| `--sd-radius-xl` | 16px |
| `--sd-radius-2xl` | 24px |
| `--sd-radius-pill` | 9999px |

### 4.3 Shadows

| Token | Light | Dark |
|-------|-------|------|
| `--sd-shadow-sm` | `0 1px 2px rgba(23,36,58,0.05)` | `0 1px 2px rgba(0,0,0,0.3)` |
| `--sd-shadow-md` | `0 4px 6px -1px rgba(23,36,58,0.08), 0 2px 4px -1px rgba(23,36,58,0.04)` | `0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -1px rgba(0,0,0,0.2)` |
| `--sd-shadow-lg` | `0 10px 15px -3px rgba(23,36,58,0.10), 0 4px 6px -2px rgba(23,36,58,0.05)` | `0 10px 15px -3px rgba(0,0,0,0.5), 0 4px 6px -2px rgba(0,0,0,0.3)` |
| `--sd-shadow-xl` | `0 20px 25px -5px rgba(23,36,58,0.12), 0 10px 10px -5px rgba(23,36,58,0.04)` | `0 20px 25px -5px rgba(0,0,0,0.6), 0 10px 10px -5px rgba(0,0,0,0.4)` |

---

## 5. Motion & Animation

### 5.1 Duration Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--sd-duration-instant` | 100ms | Immediate feedback |
| `--sd-duration-fast` | 150ms | Hover, focus, small transitions |
| `--sd-duration-normal` | 250ms | Standard transitions |
| `--sd-duration-slow` | 400ms | Modals, drawers, page transitions |
| `--sd-duration-gentle` | 600ms | Complex orchestration |

### 5.2 Easing Tokens

| Token | Value |
|-------|-------|
| `--sd-ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--sd-ease-out` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--sd-ease-in` | `cubic-bezier(0.4, 0, 1, 1)` |
| `--sd-ease-spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` |

### 5.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**All animations must respect this.** Use `transform` and `opacity` only.

### 5.4 Key Animations

| Animation | Duration | Easing | Notes |
|-----------|----------|--------|-------|
| Page transition (fade + slide) | 250ms | ease-out | Route-level |
| Sidebar collapse/expand | 200ms | ease-default | Layout |
| Modal/drawer enter | 200ms | ease-out | Scale + fade |
| Toast enter/exit | 150ms | ease-out | Slide + fade |
| Button press | 100ms | ease-out | Scale 0.98 |
| Drag reorder | 150ms | spring | SortableJS |
| Autosave indicator pulse | 1500ms | ease-in-out | Infinite while saving |

---

## 6. Component Patterns

### 6.1 Buttons

```css
/* Primary */
.btn-primary {
  background: linear-gradient(135deg, var(--sd-primary), var(--sd-primary-hover));
  color: var(--sd-primary-foreground);
  box-shadow: var(--sd-shadow-md);
}

/* Secondary */
.btn-secondary {
  background: var(--sd-surface-elevated);
  color: var(--sd-text-primary);
  border: 1px solid var(--sd-border);
}

/* Ghost */
.btn-ghost {
  background: transparent;
  color: var(--sd-text-primary);
  border: 1px solid var(--sd-border);
}

/* Icon */
.btn-icon {
  width: 38px; height: 38px;
  border-radius: var(--sd-radius-md);
}
```

**States**: Hover = `transform: translateY(-1px)`, Active = `transform: translateY(0)`, Focus = `outline: 3px solid var(--sd-border-focus)`

### 6.2 Cards & Surfaces

```css
.card {
  background: var(--sd-surface-elevated);
  border: 1px solid var(--sd-border);
  border-radius: var(--sd-radius-xl);
  box-shadow: var(--sd-shadow-sm);
  transition: box-shadow var(--sd-duration-fast), transform var(--sd-duration-fast);
}
.card:hover { box-shadow: var(--sd-shadow-md); transform: translateY(-2px); }
```

### 6.3 Inputs

```css
.input {
  background: var(--sd-surface);
  border: 1px solid var(--sd-border);
  border-radius: var(--sd-radius-lg);
  padding: 12px 14px;
  color: var(--sd-text-primary);
  transition: border-color var(--sd-duration-fast), box-shadow var(--sd-duration-fast);
}
.input:focus { border-color: var(--sd-border-focus); box-shadow: 0 0 0 3px var(--sd-primary-soft); }
```

### 6.4 PrimeReact Integration

PrimeReact components styled via:
1. **CSS Variables** — Map PrimeReact tokens to `--sd-*` variables
2. **Custom Theme** — Extend `PrimeReact` theme with design tokens
3. **Scoped Overrides** — Component-specific CSS in `primereact.css`

**Key PrimeReact Components Used**:
- `DataTable` → Outlines list, Agenda
- `Dialog` / `Sidebar` → Modals, drawers
- `Calendar` / `Schedule` → Agenda views
- `Tree` → Folder navigation
- `AutoComplete` → Bible reference picker
- `Chips` → Tags
- `Toast` → Notifications
- `ConfirmDialog` → Delete confirmations
- `TabView` → Settings sections
- `OverlayPanel` → Dropdown menus
- `SpeedDial` → Floating actions
- `Skeleton` → Loading states
- `ProgressBar` → Autosave, reading progress

---

## 7. Breakpoints (Responsive)

| Token | Value | Target |
|-------|-------|--------|
| `--sd-bp-sm` | 640px | Large phones |
| `--sd-bp-md` | 768px | Tablets |
| `--sd-bp-lg` | 1024px | Small desktop |
| `--sd-bp-xl` | 1280px | Desktop |
| `--sd-bp-2xl` | 1536px | Large desktop |

**Layout shifts**:
- `< 768px`: Sidebar → Drawer, Bottom nav visible, Tables → Cards
- `768–1024px`: Condensed sidebar, two-column grids
- `> 1024px`: Full sidebar, multi-column layouts

---

## 8. Accessibility Checklist

- [ ] All interactive elements: visible focus (`outline: 3px solid var(--sd-border-focus)`)
- [ ] Color never sole indicator (icons + text + color)
- [ ] ARIA labels on icon-only buttons
- [ ] Landmarks: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`
- [ ] Heading hierarchy (h1 → h2 → h3)
- [ ] Form labels associated (`htmlFor` / `<label>`)
- [ ] Live regions for toasts, autosave status
- [ ] Skip link for keyboard users
- [ ] `lang="pt-BR"` on `<html>`
- [ ] Touch targets ≥ 44×44px
- [ ] `prefers-reduced-motion` respected globally
- [ ] Screen reader announcements for async actions

---

## 9. Implementation Files

| File | Purpose |
|------|---------|
| `packages/design-tokens/src/colors.ts` | Palette + semantic themes (TS) |
| `packages/design-tokens/src/typography.ts` | Font families, sizes, weights |
| `packages/design-tokens/src/layout.ts` | Spacing, radius, shadows, motion, breakpoints |
| `packages/design-tokens/src/css-variables.ts` | CSS variable generator |
| `apps/web/src/styles/globals.css` | CSS reset, @font-face, base styles |
| `apps/web/src/styles/tokens.css` | `:root` + `[data-theme="dark"]` variables (generated) |
| `apps/web/src/styles/primereact.css` | PrimeReact component overrides |
| `apps/web/src/styles/utilities.css` | Helper classes (`.sr-only`, `.visually-hidden`, etc.) |