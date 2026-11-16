# SpeakerDraft Web

Aplicação web para pregadores e pastores criarem, organizarem e ministrarem esboços de pregação.

## Stack

- **React 18** + **TypeScript** (strict mode)
- **Vite 6** — Build tool & dev server
- **React Router 6** — Routing
- **PrimeReact 10** + **PrimeIcons** — Component library
- **TipTap (ProseMirror)** — Rich text editor
- **TanStack Query 5** — Server state management
- **Zustand** — Client state management
- **React Hook Form + Zod** — Forms & validation
- **i18next** — Internationalization
- **Framer Motion** — Animations
- **pdfjs-dist** — PDF text extraction
- **MiniSearch** — Local full-text search
- **Supabase JS** — Backend (optional, local mode by default)

## Estrutura

```
apps/web/src/
├── app/                    # Providers, Router, Layout
│   ├── providers.tsx       # Theme, Auth, Query, i18n providers
│   ├── router.tsx          # Route definitions
│   └── layout.tsx          # Shell (Sidebar + Topbar + Outlet)
├── features/               # Feature modules (domain-driven)
│   ├── auth/
│   ├── outlines/
│   ├── editor/
│   ├── preaching/
│   ├── bible/
│   ├── agenda/
│   ├── library/
│   ├── notes/
│   ├── search/
│   └── settings/
├── components/             # Shared UI components
│   ├── ui/                 # PrimeReact wrappers
│   ├── layout/
│   └── feedback/
├── hooks/                  # Shared hooks
├── styles/                 # CSS system
│   ├── globals.css         # Reset, @font-face, base
│   ├── tokens.css          # Design token CSS variables
│   ├── primereact.css      # PrimeReact theme overrides
│   └── utilities.css       # Helper classes
├── lib/                    # Utilities, constants
└── test/                   # Test utilities, mocks
```

## Pacotes Compartilhados (workspace)

| Pacote | Descrição |
|--------|-----------|
| `@speaker-draft/core` | Tipos, schemas Zod, parser bíblico, lógica de domínio |
| `@speaker-draft/data` | Interfaces de repositório + adapters (Local/Supabase) |
| `@speaker-draft/design-tokens` | Tokens de design (cores, tipografia, espaçamento, motion) |
| `@speaker-draft/i18n` | Config de locale + strings de tradução |
| `@speaker-draft/db-types` | Tipos gerados do Supabase (pós-migrations) |

---

## Instalação

### Pré-requisitos

- Node.js 20+ (compatível com Expo SDK 52)
- pnpm 9.x

### Passos

```bash
# Na raiz do monorepo
pnpm install

# Copiar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais (opcional — funciona em modo local)
```

---

## Variáveis de Ambiente

| Variável | Obrigatória? | Descrição |
|----------|--------------|-----------|
| `VITE_SUPABASE_URL` | Não | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Não | Chave anônima do Supabase |
| `VITE_STORAGE_BACKEND` | Não | `local` (padrão) ou `supabase` |
| `VITE_DEFAULT_BIBLE_VERSION` | Não | Código da tradução padrão (ex: `WEB_PT`) |

Veja `.env.example` para lista completa.

---

## Scripts

```bash
# Desenvolvimento
pnpm dev              # Inicia Vite dev server (porta 5173)
pnpm --filter @speaker-draft/web dev

# Qualidade
pnpm lint             # ESLint (flat config)
pnpm typecheck        # TypeScript strict check
pnpm format           # Prettier

# Build
pnpm build            # Build de produção (tsc + vite build)
pnpm --filter @speaker-draft/web build

# Testes
pnpm test             # Vitest (unitários)
pnpm test:e2e         # Playwright (E2E)
```

---

## Modo Local vs Supabase

### Modo Local (Padrão)
- **Sem configuração necessária** — funciona out-of-the-box
- Dados salvos no **IndexedDB** do navegador
- Autenticação simulada (demo mode)
- Selo "Modo local: dados somente neste navegador" visível na UI
- Export/Import JSON disponível em Configurações

### Modo Supabase
Requer projeto Supabase configurado:

1. Crie projeto em [supabase.com](https://supabase.com)
2. Execute migrations: `cd supabase && supabase db push`
3. Configure `.env`:
   ```bash
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima
   VITE_STORAGE_BACKEND=supabase
   ```
4. Reinicie o dev server

---

## Design System

Tokens definidos em `@speaker-draft/design-tokens` e expostos como CSS custom properties:

```css
:root {
  --sd-primary: #17243A;      /* Navy */
  --sd-accent: #C9A86A;       /* Gold */
  --sd-background: #F7F4ED;   /* Cream */
  --sd-accent-secondary: #527568; /* Sage */
  /* ... todos os tokens semânticos */
}

[data-theme="dark"] {
  --sd-primary: #C9A86A;
  --sd-background: #0F1724;
  /* ... tokens dark */
}
```

**Temas**: Claro (padrão), Escuro, Sistema — alternável em Configurações.

**Fontes**: Inter (UI), Newsreader (leitura/pregação), JetBrains Mono (código) — self-hosted.

---

## Acessibilidade

- Navegação completa por teclado
- Foco visível (`outline: 3px solid var(--sd-border-focus)`)
- ARIA labels em botões ícone
- Landmarks semânticos
- `prefers-reduced-motion` respeitado
- `prefers-contrast` suportado
- `lang="pt-BR"`

---

## Estrutura de Dados (Resumo)

### Sermon (Esboço)
```typescript
{
  id: string (UUID)
  kind: 'sermon' | 'teaching' | 'devotional' | 'study_note' | 'quick_note'
  title: string
  bible_references: string[]      // Ex: ["João 3:16", "Salmos 23"]
  tags: string[]
  folder_id: string | null
  status: 'draft' | 'in_progress' | 'ready' | 'archived'
  content_json: ProseMirrorDoc    // TipTap JSON
  plain_text: string              // Para busca
  duration_minutes: number | null
  preached_at: string | null      // ISO datetime
}
```

### Event (Agenda)
```typescript
{
  id: string
  title: string
  date: string (YYYY-MM-DD)
  time: string (HH:MM)
  event_type: 'culto' | 'ebd' | 'estudo' | 'conferencia' | 'reuniao' | 'outro'
  document_id: string | null      // Link para esboço
  status: 'scheduled' | 'completed' | 'cancelled'
}
```

### LibraryItem
```typescript
{
  id: string
  item_type: 'illustration' | 'quote' | 'exegetical_note' | 'commentary' | 'outline_template'
  title: string
  author: string | null
  content: string                 // Texto extraído do PDF
  citation: string | null
  tags: string[]
  bible_references: string[]
}
```

---

## Bible Parser (Core)

Parser robusto para referências em português:

```typescript
parseBibleReference("Jo 3:16")           // { book: "João", chapter: 3, verse: 16 }
parseBibleReference("1Co 13:4-8")        // Range de versículos
parseBibleReference("Salmos 23")         // Capítulo inteiro
extractBibleReferences(text)             // Encontra todas no texto
```

Suporta abreviações: `Gn`, `Êx`, `Lv`, `Nm`, `Dt`, `Js`, `Jz`, `Rt`, `1Sm`, `2Sm`, `1Rs`, `2Rs`, `1Cr`, `2Cr`, `Ed`, `Ne`, `Et`, `Jó`, `Sl`, `Pv`, `Ec`, `Ct`, `Is`, `Jr`, `Lm`, `Ez`, `Dn`, `Os`, `Jl`, `Am`, `Ob`, `Jn`, `Mq`, `Na`, `Hc`, `Sf`, `Ag`, `Zc`, `Ml`, `Mt`, `Mc`, `Lc`, `Jo`, `At`, `Rm`, `1Co`, `2Co`, `Gl`, `Ef`, `Fp`, `Cl`, `1Ts`, `2Ts`, `1Tm`, `2Tm`, `Tt`, `Fm`, `Hb`, `Tg`, `1Pe`, `2Pe`, `1Jo`, `2Jo`, `3Jo`, `Jd`, `Ap`.

---

## Editor (TipTap)

Schema customizado para esboços:

```typescript
// Block nodes
heading, paragraph, bulletList, orderedList, listItem,
blockquote, horizontalRule,

// Custom nodes para pregação
bibleReference,      // Referência com expansão de texto
illustration,        // Bloco de ilustração
application,         // Bloco de aplicação
callToAction,        // Apelo/convite
```

**Funcionalidades**:
- Drag-and-drop reordenação (SortableJS)
- Autosave com indicador visual
- Atalhos: `Ctrl+B` (negrito), `Ctrl+I` (itálico), `Ctrl+K` (paleta comandos)
- Modo foco (distraction-free)
- Export: PDF (print), Markdown, Texto

---

## Modo Pregação

Tela imersiva otimizada para leitura à distância:

- Fonte serif (Newsreader), tamanho ajustável (16–28px)
- Temas: Claro, Escuro, Sépia
- Cronômetro com alerta discreto (som/vibração)
- Navegação por teclado: `←/→` (blocos), `Espaço` (scroll), `F` (tela cheia), `Esc` (sair)
- Wake Lock API (mantém tela acesa)
- Preferências persistem no localStorage

---

## Pesquisa Global (`Cmd+K`)

- Indexação local com MiniSearch
- Busca em: esboços, anotações, biblioteca (texto PDF), agenda, versículos, tags
- Resultados agrupados por tipo com highlight
- Navegação por teclado (`↑/↓`, `Enter` para abrir)
- Itens recentes + filtros por tipo

---

## Testes

```bash
# Unitários (Vitest)
pnpm test

# E2E (Playwright)
pnpm test:e2e

# Coverage
pnpm test:coverage
```

**Estrutura de testes**:
- `packages/core/test/` — Parser bíblico, validações, domínio
- `packages/data/test/` — Repositories (local adapter)
- `apps/web/test/` — Componentes, hooks, fluxos críticos

---

## Deploy

### Vercel (Recomendado)
```bash
# Conecte o repo no Vercel
# Build Command: pnpm build
# Output Directory: apps/web/dist
# Env Variables: Configure no dashboard
```

### Netlify
```bash
# Build Command: pnpm build
# Publish Directory: apps/web/dist
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @speaker-draft/web build
EXPOSE 4173
CMD ["pnpm", "--filter", "@speaker-draft/web", "preview", "--host", "0.0.0.0"]
```

---

## Documentação Relacionada

| Documento | Localização |
|-----------|-------------|
| Arquitetura Web | `docs/WEB_ARCHITECTURE.md` |
| Design System | `docs/DESIGN_SYSTEM.md` |
| Integrações (Supabase) | `docs/INTEGRATIONS.md` |
| Fontes Bíblicas | `docs/BIBLE_SOURCES.md` |
| Handoff Mobile | `docs/MOBILE_HANDOFF.md` |
| Limitações Conhecidas | `docs/KNOWN_LIMITATIONS.md` |
| Progresso | `docs/PROGRESS.md` |

---

## Licença

Proprietário — SpeakerDraft. Todos os direitos reservados.