# ADR-001: Modelo de Dados — Apenas owner_id (sem workspaces/equipes no MVP)

**Status:** Aceito  
**Data:** 2026-10-10  
**Contexto:** Fase 0/1

## Contexto

O SpeakerDraft e destinado a pregadores, lideres e professores individuais.
Sera necessario decidir se o modelo de dados suporta desde o inicio:
(a) apenas o usuario individual (owner_id), ou
(b) workspaces/igrejas/equipes com membros e permissoes compartilhadas.

## Decisao

Usar **apenas owner_id** em todas as tabelas no MVP e v1.0.
Nenhuma tabela de workspaces, organizations ou members sera criada agora.
Toda politica RLS verifica uth.uid() = owner_id.

## Consequencias positivas

- Schema dramaticamente mais simples e seguro de implementar.
- RLS trivial e facil de testar com pgTAP.
- Menos surface de bugs de isolamento de dados entre usuarios.
- Foco no produto core sem overhead de multi-tenancy prematuro.

## Consequencias negativas / riscos

- Adicionar workspaces depois exigira migrations e mudancas nas policies de RLS.
- Usuarios nao podem compartilhar esbocos com colegas.
- Se o produto pivotar para uso em equipe rapidamente, ha custo de refatoracao.

## Alternativas consideradas

**Workspaces desde o inicio:** Rejeitado. Complexidade prematura para MVP de usuario individual.  
**Campo workspace_id nullable:** Rejeitado. Complica RLS e nao simplifica o caminho de evolucao.

## Revisao

Reavaliar apos validacao de produto com usuarios reais. A migracao para workspaces
sera tratada como nova fase (v2+) com ADR dedicado.
