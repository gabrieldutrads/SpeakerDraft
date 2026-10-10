# Troubleshooting — SpeakerDraft

Este arquivo documenta problemas encontrados, diagnostico e correcoes aplicadas.

---

## PROBLEMA-001: expo-asset nao encontrado ao iniciar apps/mobile

**Primeiro identificado:** 2026-10-10 (Fase 0)  
**Status:** RESOLVIDO

### Sintoma

Ao tentar iniciar pps/mobile com expo start ou expo export, o bundler Metro
falha com a mensagem:

`
The required package expo-asset cannot be found
`

### Diagnostico

1. O pnpm usa resolucao isolada por padrao: cada pacote acessa apenas
   suas dependencias declaradas diretamente.
2. expo-asset e dependencia transitiva de expo e expo-router mas NAO
   estava declarado explicitamente no package.json de pps/mobile.
3. O Metro bundler exige que o pacote seja resolvivel a partir da raiz do app.
4. No pnpm isolado, transitivas nao sao hoistadas para 
ode_modules do app.

Confirmacao: ls apps/mobile/node_modules/expo-asset retornava "False".

Pacotes adicionalmente ausentes (descobertos via 
px expo-doctor):
- expo-constants (peer de expo-router)
- expo-linking (peer de expo-router)

### Correcao Aplicada

`powershell
# Dentro de apps/mobile:
Set-Location apps/mobile
npx expo install expo-asset expo-constants expo-linking expo-font expo-splash-screen
`

O comando 
px expo install determina automaticamente as versoes compativeis
com o SDK Expo instalado (52.x) e usa o gerenciador de pacotes do projeto (pnpm).

**Resultado:** instalados com sucesso:
- expo-asset@~11.0.5
- expo-constants@~17.0.8
- expo-font@~13.0.4
- expo-linking@~7.0.5
- expo-splash-screen@~0.29.24

### Versoes desatualizadas corrigidas


px expo-doctor tambem identificou:
- react-native@0.76.3 (esperado 0.76.9)
- react-native-screens@4.1.0 (esperado ~4.4.0)

Correcao:
`powershell
Set-Location apps/mobile
npx expo install react-native@0.76.9 react-native-screens@~4.4.0
`

### Validacao

Apos a correcao, rodar:
`powershell
pnpm --filter @speaker-draft/mobile exec npx expo-doctor
`
Esperado: checks passando sem erros criticos relacionados a dependencias.

### Alternativas NAO aplicadas

- **node-linker=hoisted no .npmrc:** Mudaria o comportamento global do monorepo.
  Rejeitado como solucao primaria.
- **watchFolders no metro.config.js:** Necessario para resolver modulos nos
  pacotes internos do workspace, mas nao resolve instalacao de pacotes ausentes.
  Reservado para configuracao futura do Metro.
- **Upgrade do Expo SDK:** Nao foi necessario e nao foi feito.

---

## PROBLEMA-002: query-string ausente durante empacotamento Metro no mobile

**Primeiro identificado:** 2026-10-10 (Fase 0)  
**Status:** RESOLVIDO

### Sintoma

Ao executar `expo export --platform all` em `apps/mobile`:
```
Error: Unable to resolve module query-string from .../node_modules/expo-router/build/fork/getPathFromState.js: query-string could not be found within the project or in these directories
```

### Diagnostico

O `expo-router@4.0.22` possui um fork de `getPathFromState.js` que requer `query-string`. No entanto, `query-string` não foi declarado como dependência explícita no `package.json` de `expo-router`. Em ambientes pnpm isolados, dependências não hoistadas não são resolvidas a menos que estejam declaradas diretamente no app ou acessíveis na cadeia de resolução do Metro.

Além disso, faltava o `apps/mobile/metro.config.js` com a configuração recomendada pela documentação oficial do Expo para monorepos (`watchFolders` e `nodeModulesPaths`).

### Correcao Aplicada

1. Instalação de `query-string@^7.1.3` (versão CommonJS) em `apps/mobile`:
   ```bash
   pnpm --filter @speaker-draft/mobile add query-string@^7.1.3
   ```
2. Criação de `apps/mobile/metro.config.js` com suporte a monorepo:
   ```javascript
   const { getDefaultConfig } = require('expo/metro-config');
   const path = require('path');

   const projectRoot = __dirname;
   const monorepoRoot = path.resolve(projectRoot, '../..');

   const config = getDefaultConfig(projectRoot);

   config.watchFolders = [monorepoRoot];
   config.resolver.nodeModulesPaths = [
     path.resolve(projectRoot, 'node_modules'),
     path.resolve(monorepoRoot, 'node_modules'),
   ];

   module.exports = config;
   ```

### Validacao

Execução de `pnpm --filter @speaker-draft/mobile build`:
- Android Bundled (900 módulos)
- iOS Bundled (903 módulos)
- Exportado com sucesso para `dist` com exit code 0.

---

## PROBLEMA-003: TS2367 em apps/web/src/App.tsx durante build do Vite

**Primeiro identificado:** 2026-10-10 (Fase 0)  
**Status:** RESOLVIDO

### Sintoma

```
src/App.tsx(314,932): error TS2367: This comparison appears to be unintentional because the types '"outlines" | "home" | "editor" | "bible" | "agenda" | "library" | "search" | "settings"' and '"preaching"' have no overlap.
src/App.tsx(314,989): error TS2367: This comparison appears to be unintentional because the types '"outlines" | "home" | "editor" | "bible" | "agenda" | "library" | "search" | "settings"' and '"login"' have no overlap.
```

### Diagnostico

As páginas `"login"` e `"preaching"` já retornavam antecipadamente nas linhas 308-309 (`if (page === "login") return ...; if (page === "preaching") return ...;`). Devido ao afunilamento de tipos (control flow type narrowing) do TypeScript, na linha 314 o tipo de `page` não mais contemplava `"preaching"` ou `"login"`, tornando as verificações posteriores redundantes e causando o erro de compilação estrita.

### Correcao Aplicada

Remoção das checagens redundantes `{page === "preaching" && ...}` e `{page === "login" && ...}` da árvore do shell principal em `apps/web/src/App.tsx`.

### Validacao

`pnpm --filter @speaker-draft/web build` executou `tsc -b` e `vite build` gerando os bundles de produção com sucesso (exit code 0).

