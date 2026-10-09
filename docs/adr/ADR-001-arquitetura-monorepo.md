# ADR-001 — Arquitetura Monorepo

- Status: Aceito
- Data: 2026-10-07

## Contexto

SpeakerDraft terá clientes web e mobile e precisa compartilhar tipos, regras puras e configuração sem acoplar os clientes entre si.

## Decisão

- **pnpm** organiza workspaces e instala dependências com eficiência.
- **Turborepo** coordena tarefas e dependências entre apps e pacotes.
- **Expo** fornece a base React Native para Android e iOS, com development builds e EAS.
- **Vite** oferece um fluxo simples de desenvolvimento e build para Web.
- **React** é a base da interface web; **PrimeReact** fornece componentes para a futura experiência web.
- **Packages compartilhados** concentram domínio independente de plataforma, dados, tipos gerados, tokens, i18n e configurações.
- **Supabase** é a plataforma de backend planejada; nesta fundação ficam apenas diretórios e configuração inicial, sem schema ou serviços funcionais.

## Consequências

Os apps evoluem separadamente e consomem pacotes locais. O pacote `core` permanece independente das plataformas. Componentes de UI não serão compartilhados entre Web e React Native. A implementação de funcionalidades e schema fica para etapas posteriores.
