# Auditoria do Repositório — SpeakerDraft

**Data:** 2026-10-10  
**Responsavel:** Antigravity  
**Fase:** 0 — Pre-implementacao

## 1. Estrutura do Monorepo

Estrutura existente alinhada a arquitetura-alvo da secao 3 do prompt mestre.
Todos os pacotes esperados existem: apps/mobile, apps/web, packages/core,
packages/data, packages/db-types, packages/design-tokens, packages/i18n, packages/config.
supabase/ existe com config.toml, migrations/, seed.sql, tests/.
docs/adr/ existe mas vazio.

## 2. Versoes Identificadas

- Node.js: 24.21.0
- pnpm: 9.15.4 (declarado no packageManager do root)
- Turborepo: ^2.3.3
- TypeScript: ^5.7.2 (strict: true no tsconfig.base.json)
- Expo SDK: 52.0.49 (package.json declara ~52.0.11)
- expo CLI: 0.22.28
- expo-router: 4.0.22 (declarado ~4.0.9)
- React: 18.3.1
- React Native: 0.76.3 (DESATUALIZADO — esperado 0.76.9)
- react-native-screens: 4.1.0 (DESATUALIZADO — esperado ~4.4.0)
- react-native-safe-area-context: 4.12.0
- PrimeReact: ^10.9.1 (versao 10, usa styled mode por padrao)
- Vite: ^6.0.1
- ESLint: ^9.16.0 (flat config)
- Prettier: ^3.4.2

## 3. BLOQUEIO CRITICO — expo-asset ausente

**Sintoma:** expo start falha com "The required package expo-asset cannot be found"

**Causa raiz:** No pnpm com modo de resolucao isolado (padrao), dependencias
transitivas NAO sao hoistadas. expo-asset e dependencia transitiva de expo e
expo-router, mas nao esta declarada explicitamente no package.json de apps/mobile.

**Pacotes peers ausentes (confirmado pelo expo-doctor):**
- expo-asset (exigido por expo/expo-router)
- expo-constants (peer de expo-router)
- expo-linking (peer de expo-router)

**Versoes desatualizadas:**
- react-native@0.76.3 -> esperado 0.76.9
- react-native-screens@4.1.0 -> esperado ~4.4.0

**Correcao:** instalar via 
px expo install dentro de apps/mobile.

## 4. Estado dos Pacotes

### packages/core
Contem: interfaces simples (Outline, StudyNote, CalendarEvent, WorkspaceData)
e dados demo (demoWorkspace).
Problemas: dados demo nao marcados como TODO(mock); sem Zod; sem parser biblico;
sem schema canonico de documento JSON/ProseMirror.
Acao: expandir na Fase 1/3.

### packages/data
Contem: workspaceStore usando localStorage.
Problemas: localStorage e codigo web no pacote shared (viola fronteiras);
sem Supabase; sem TanStack Query; sem adapters de plataforma.
Acao: refatorar para adapter pattern na Fase 1.

### packages/design-tokens
Contem: 5 objetos TS minimos com cores genericas.
Problemas: paleta NAO corresponde a especificada (#17243A, #F7F4ED, #C9A86A,
#527568, #252A32); sem tokens semanticos; sem tema claro/escuro; sem presets motion.
Acao: reescrever completamente na Fase 1.

### packages/i18n
Contem: apenas declaracao de locale.
Acao: adicionar strings UI e integracao i18next na Fase 1.

### packages/db-types
Contem: VAZIO.
Acao: popular apos criar migrations na Fase 1.

### packages/config
Contem: tsconfig.base.json (strict: true), eslint.config.js, prettier.config.js.
Problemas: sem regras de fronteira; sem config React.
Acao: reforcar na Fase 1.

## 5. Estado apps/web

Stack: Vite 6 + React 18 + PrimeReact 10.9.1
Problema critico: PrimeReact NAO esta sendo usado na UI atual.
UI usa componentes custom sem roteador (navegacao por useState<Page>).
Usa localStorage via data package. Sem Framer Motion. Sem auth real.
CSS custom de 34KB bem estruturado — pode servir como referencia visual.
Usa window.alert/window.prompt para formularios (nao aceitavel para produto).

## 6. Estado apps/mobile

Stack: Expo 52 + Expo Router 4 + React Native 0.76.3
UI: tela de placeholder ("A fundacao do projeto esta funcionando").
Problemas: expo-asset, expo-constants, expo-linking ausentes.
Sem navegacao real, sem telas.

## 7. Estado Supabase

config.toml: api.enabled = false e studio.enabled = false.
PROBLEMA: Supabase local nao vai iniciar com API desativada.
Sem migrations, sem schema, sem seed real, sem testes pgTAP.
Acao: reconfigurar config.toml e criar schema completo na Fase 1.

## 8. Git

2 commits no historico:
- ec13591: primeiro commit do app
- 00a22cd: style: refine SpeakerDraft web app layout
Sem tags, sem branches adicionais, sem CI configurado.

## 9. Dependencias Ausentes para o Produto

Mobile (instalar via npx expo install):
- expo-asset, expo-constants, expo-linking (CRITICO)
- expo-font, expo-splash-screen
- react-native-reanimated, react-native-gesture-handler
- expo-haptics, expo-notifications, expo-sqlite
- expo-secure-store, expo-keep-awake

Ambas as plataformas (via pnpm):
- @supabase/supabase-js
- zustand, @tanstack/react-query, zod
- react-hook-form, @hookform/resolvers
- i18next, react-i18next

Web:
- react-router
- framer-motion
- @tiptap/react + extensoes

## 10. Status das Fases

- [x] **Fase 0 (Concluída):**
  - Auditoria completa realizada.
  - Bloqueio crítico `expo-asset` e dependências peers resolvidas (`expo-constants`, `expo-linking`, `expo-font`, `expo-splash-screen`).
  - Atualização do `react-native` (0.76.9) e `react-native-screens` (~4.4.0) alinhados ao Expo SDK 52.
  - Resolução de `query-string` e criação de `apps/mobile/metro.config.js` para monorepo.
  - Reconfiguração do `supabase/config.toml` (API, Studio habilitados).
  - Correção de erro de compilação estrita em `apps/web/src/App.tsx`.
  - Compilação total do monorepo (`pnpm -r build`) 100% verde (8 de 8 projetos compilando sem erros).
  - Documentação inicial criada: `AUDIT.md`, `DEPENDENCIES.md`, `TESTING.md`, `TROUBLESHOOTING.md`, ADR-001 e ADR-002.

- [ ] **Fase 1 (Próxima):** Refatorar pacotes do monorepo (`packages/core` com schemas Zod canônicos e parser bíblico, `packages/design-tokens` com paleta completa, `packages/data` com adapters, migrations Supabase + RLS + pgTAP, geração de `packages/db-types`).
- [ ] **Fase 2:** Tema PrimeReact; componentes App*; navegação mobile; temas claro/escuro; Framer Motion + Reanimated.
- [ ] **Fase 3:** Auth, Dashboard, Documentos, Editor ProseMirror/TipTap, Bíblia offline, Modo Pregação, Pesquisa global.
- [ ] **Fase 4:** Biblioteca, Agenda, Sincronização offline-first.
- [ ] **Fase 5:** Fundação IA, polimento, testes e documentação final.

