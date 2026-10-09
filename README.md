# SpeakerDraft

SpeakerDraft é uma futura plataforma multiplataforma para apoiar pregadores, líderes, professores e estudantes da Bíblia. Esta etapa contém apenas a fundação técnica do monorepo; funcionalidades de produto serão desenvolvidas depois.

## Stack

- pnpm workspaces e Turborepo
- TypeScript em modo strict
- Web: React, Vite e PrimeReact
- Mobile: Expo, React Native e Expo Router, preparada para development builds e EAS
- Supabase reservado para infraestrutura futura

## Estrutura

- `apps/web`: aplicação web mínima
- `apps/mobile`: aplicação Expo mínima
- `packages/core`: base independente de plataforma para domínio
- `packages/data`: ponto central futuro para acesso e persistência
- `packages/db-types`: destino futuro para tipos gerados do banco
- `packages/design-tokens`: valores fundamentais compartilháveis
- `packages/i18n`: estrutura de internacionalização, idioma inicial pt-BR
- `packages/config`: configurações compartilhadas
- `supabase`: configuração e diretórios vazios para evolução futura
- `docs/adr`: decisões de arquitetura

## Requisitos e comandos

Instale Node.js compatível com Expo e pnpm 9, então execute:

```sh
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
```

`pnpm dev` inicia os apps em paralelo. Para iniciar individualmente:

```sh
pnpm --filter @speaker-draft/web dev
pnpm --filter @speaker-draft/mobile dev
```

O app mobile usa Expo Router e está preparado para development builds/EAS; Expo Go não é uma dependência arquitetural.

## Scripts

Na raiz: `dev`, `build`, `lint`, `typecheck` e `format`. Os apps e pacotes expõem scripts adequados aos seus arquivos.

## Novos packages

Crie uma pasta em `packages/<nome>` com `package.json`, `tsconfig.json` e `src/index.ts`. Use um nome com escopo `@speaker-draft/<nome>` e dependências `workspace:*` para outros pacotes locais. Adicione o pacote apenas quando existir uma responsabilidade clara.

## Observações de arquitetura

- Regras de domínio em `core` não devem depender de React, React Native, Supabase ou APIs específicas de Node/navegador.
- O acesso futuro ao Supabase deve ficar centralizado em `data`, sem clientes espalhados pelos apps.
- Design tokens e i18n são dados compartilhados; componentes visuais específicos de plataforma permanecem nos respectivos apps.
- Tipos do banco devem ser gerados a partir do schema real, sem antecipar tabelas.
- Não há chaves de API nos exemplos de ambiente. Copie os arquivos `.env.example` quando variáveis forem necessárias.
