# ADR-002: pnpm isolado e solucao para dependencias transitivas do Metro/Expo

**Status:** Aceito  
**Data:** 2026-10-10  
**Contexto:** Fase 0 — Correcao do erro expo-asset

## Contexto

O pnpm usa por padrao o modo de resolucao **isolado** (node-linker=isolated),
onde cada pacote so acessa suas dependencias diretas. O Metro bundler e o runtime
do Expo exigem que certas dependencias (expo-asset, expo-constants, expo-linking,
expo-font, expo-splash-screen) estejam acessiveis a partir do diretorio do app,
mesmo que sejam dependencias transitivas de expo e expo-router.

O erro "The required package expo-asset cannot be found" ocorre porque o Metro
tenta resolver expo-asset a partir de pps/mobile mas ele nao estava
declarado no package.json do app.

## Decisao

**Declarar explicitamente as dependencias transitivas exigidas pelo runtime Expo
no package.json de pps/mobile**, instalando via 
px expo install para
garantir versoes compativeis com o SDK instalado.

NAO foi necessario:
- Mudar o node-linker para "hoisted" (seria uma mudanca global invasiva)
- Ajustar metro.config.js com watchFolders/nodeModulesPaths (reservado como plano B)
- Fazer upgrade do Expo SDK

## Pacotes declarados explicitamente

- expo-asset@~11.0.5
- expo-constants@~17.0.8
- expo-linking@~7.0.5
- expo-font@~13.0.4
- expo-splash-screen@~0.29.24

## Consequencias

- O package.json de apps/mobile fica um pouco mais verboso, listando deps que
  tecnicamente sao transitivas, mas isso e pratica recomendada em monorepos pnpm
  com Expo (e documentada no guia oficial do Expo para pnpm).
- Qualquer dev que fizer pnpm install a partir da raiz terá o ambiente correto.

## Alternativas consideradas

**node-linker=hoisted:** Resolveria o problema automaticamente mas quebraria o
isolamento do monorepo e poderia causar conflitos de versao entre apps.
Rejeitado como solucao primaria; mantido como opcao de ultimo recurso com ADR.

**metro.config.js com nodeModulesPaths:** Valido para hoisting parcial via Metro,
mas nao resolve o problema de instalacao dos modulos nativos. Reservado para
problemas futuros especificos do Metro.
