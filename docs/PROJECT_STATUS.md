# Estado operacional — Orbiter

**Última atualização:** 2026-10-24
**Fase atual para implementação:** 1 — Planetário vivo
**Situação:** pronta para atribuição a agente; código ainda não implementado
**Última decisão de gate:** Fase 0 documentada; Fase 1 autorizada
**Próxima ação do humano:** iniciar um agente com a issue da Fase 1 e `docs/phases/PHASE_01.md`.

## Resumo imutável de produto

Física híbrida; observação + intervenção opcional; um sistema planetário; uma civilização inicial (a partir da fase 3); persistência entre sessões; 2D top-down.

## Atividade corrente

| Item | Situação | Referência |
|---|---|---|
| Fase 0: fundação | Documentação preparada | Este commit |
| Fase 1: planetário vivo | Não iniciada | `docs/phases/PHASE_01.md` |
| Fase 2+ | Não autorizadas | `docs/ROADMAP.md` |

## Riscos a observar

- Física visual falsa disfarçada de orbital.
- Escopo excessivo antes de existir um screensaver observável.
- Determinismo quebrado por FPS ou fontes aleatórias globais.
- Arquivos salvos incompatíveis após refatorações.
- Agentes esquecendo decisões tomadas fora do repositório.

## Em cada retorno à orquestradora

O humano envia URL do PR, resumo da demonstração e eventuais desejos de mudança. A orquestradora:
1. Verifica artefatos e evidências.
2. Classifica gate: **APROVADO**, **AJUSTES NECESSÁRIOS** ou **REPLANEJAR**.
3. Atualiza este arquivo, próximo brief, backlog e decisões via PR/commit.
4. Autoriza a próxima fase *somente quando apropriado*.

## Handoff mais recente

Fundação documental criada; ainda não existe implementação, CI nem evidência de navegador. Nenhum teste de código foi executado. O primeiro agente deve criar setup, scripts e validações na Fase 1.
