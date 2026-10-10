# Plano de Testes — SpeakerDraft

**Ultima atualizacao:** 2026-10-10  
**Fase atual:** 0 (auditoria e correcao de bloqueio)

---

## Estrategia Geral

### Piramide de Testes

1. **Unitarios (Vitest):** foco em packages/core e packages/data
   - Parser de referencias biblicas
   - Validacao Zod dos schemas
   - Logica de sincronizacao
   - Transformacoes de dados

2. **Integracao de banco (pgTAP):** obrigatorio para RLS do Supabase
   - Toda tabela com RLS deve ter testes pgTAP cobrindo:
     - Usuario so acessa seus proprios dados
     - Usuario nao acessa dados de outro usuario
     - Operacoes CRUD permitidas e bloqueadas corretamente

3. **Componentes (Testing Library):** fluxos criticos do web
   - Login/cadastro
   - Criar e editar documento
   - Navegacao entre secoes

4. **E2E (Playwright):** fluxos ponta a ponta no web
   - Login -> criar documento -> organizar -> modo pregacao
   - Busca global

5. **Mobile (jest-expo):** logica e componentes-chave
   - Navegacao de rotas
   - Componentes de lista e cards

6. **E2E Mobile (Maestro):** apos MVP

---

## O que sera testado em cada fase

### Fase 0 (atual): Validacao do ambiente
- [ ] 
px expo-doctor sem erros criticos
- [ ] expo start inicia sem erro de expo-asset
- [ ] pnpm typecheck passa em todos os workspaces
- [ ] pnpm lint passa em todos os workspaces

### Fase 1: Infraestrutura
- [ ] Schema Supabase: supabase db reset aplica todas as migrations
- [ ] RLS: testes pgTAP passando para todas as tabelas
- [ ] pnpm test no core e data (unitarios basicos)
- [ ] db-types gerado corretamente

### Fase 2: UI Base
- [ ] Web carrega sem erros no browser (Vite dev server)
- [ ] Mobile: metro bundler compila sem erros
- [ ] Temas claro/escuro alternam corretamente

### Fase 3: MVP Funcional
- [ ] Fluxo completo: login -> criar documento -> salvar -> pesquisar
- [ ] Biblia offline: texto carrega sem conexao
- [ ] Modo pregacao: funciona offline com fonte grande

### Criterio de Prontidao por Fase
Nenhuma fase avanca sem:
- pnpm typecheck verde
- pnpm lint verde
- pnpm test verde (nos pacotes afetados)
- Inspecao manual no browser/emulador

---

## O que NAO sera testado automaticamente (e por que)

| Item | Razao |
|------|-------|
| Dispositivo fisico iOS/Android | Sem hardware disponivel |
| Notificacoes push reais | Exige dispositivo fisico |
| Login social (Google/Apple) | Exige credenciais e configuracao de OAuth |
| Upload e leitura de PDFs | Dependencia de ambiente de build nativo |
| Modo pregacao em landscape | Exige dispositivo fisico |
| Sincronizacao entre dispositivos | Exige dois dispositivos e rede |

---

## Ferramentas e Configuracao

- **Vitest:** configurado no workspace raiz via pnpm
- **pgTAP:** executado via supabase test db
- **Playwright:** configurado em apps/web
- **jest-expo:** configurado em apps/mobile
- **Maestro:** apos MVP (nao configurado ainda)
