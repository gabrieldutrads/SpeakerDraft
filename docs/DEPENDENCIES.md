# Registro de Dependencias — SpeakerDraft

Este arquivo documenta toda mudanca de versao de dependencia, com justificativa.
Formato: Data | Pacote | De | Para | Justificativa | Quem instalou

---

## Alteracoes — Fase 0 (2026-10-10)

### Mobile — Adicoes de dependencias ausentes (expo install)

| Data | Pacote | Versao | Justificativa |
|------|--------|--------|---------------|
| 2026-10-10 | expo-asset | compativel com Expo 52 | Dependencia transitiva de expo/expo-router nao hoistada pelo pnpm isolado; exigida em runtime pelo Expo. Causa do bloqueio "The required package expo-asset cannot be found". |
| 2026-10-10 | expo-constants | compativel com Expo 52 | Peer dependency de expo-router reportada pelo expo-doctor como ausente. |
| 2026-10-10 | expo-linking | compativel com Expo 52 | Peer dependency de expo-router reportada pelo expo-doctor como ausente. |
| 2026-10-10 | expo-font | compativel com Expo 52 | Necessaria para carregamento de fontes customizadas (requisito de design, secao 4.2). |
| 2026-10-10 | expo-splash-screen | compativel com Expo 52 | Padrao do Expo Router para tela de splash antes do carregamento. |
| 2026-10-10 | query-string | ^7.1.3 | Exigido pelo fork de getPathFromState do expo-router 4.0.22 em ambiente pnpm isolado. |

### Mobile — Atualizacoes de versao

| Data | Pacote | De | Para | Justificativa |
|------|--------|-----|-------|---------------|
| 2026-10-10 | react-native | 0.76.3 | 0.76.9 | Versao esperada pelo SDK Expo 52, reportada pelo expo-doctor. Patch update sem breaking changes. |
| 2026-10-10 | react-native-screens | 4.1.0 | ~4.4.0 | Versao esperada pelo SDK Expo 52, reportada pelo expo-doctor. |

---

## Regras

1. Nenhum upgrade sem registro neste arquivo.
2. Para pacotes do ecossistema Expo, usar sempre 
px expo install para garantir compatibilidade com o SDK.
3. Nunca atualizar major de Expo/React Native sem ADR separado.
4. Apos qualquer alteracao, rodar 
px expo-doctor e registrar resultado.
