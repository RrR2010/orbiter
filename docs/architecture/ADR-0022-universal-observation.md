# ADR-0022 — Identidade e observação read-only no M2

**Data:** 2026-11-02. **Estado:** proposta implementada na branch da Fase 8; pendente de gate e merge.

## Contexto

O Orbiter já possui estados cinemáticos SI, épocas e frames de M1, mas seleção, HUD e câmera resolviam corpos, voos locais e sondas por funções independentes. IDs históricos de corpo, missão, veículo e sonda não podem ser renomeados nos saves V2.

## Decisão

Adotar uma fachada de consulta `createStateProvider(world, civilization?)` com `resolve` e `at(id, epochS, frameId)`, sem mutação nem propagação nova. Criar identidades **somente observacionais** `body/<id>`, `local/<missionId>` e `probe/<missionId>`; o `sourceId` mantém a identidade de origem e a serialização não muda.

Usar os três caminhos físicos já existentes, mas com saída comum via `reference-frames.ts` de M1. Campos opcionais nunca são inferidos: `stateTelemetry` retorna `null` para massa/propelente ausentes e `null` para estado não observável. Preservar o HUD especializado para AP/PE, fases e cronologia até as migrações explicitamente autorizadas. Representações ilustrativas legadas não entram no provider físico.

## Consequências e riscos

- Compatibilidade de saves e solvers: nenhum schema, evento ou integrador alterado.
- Foco, follow, picking e HUD podem consultar um mesmo estado SI.
- A fachada hoje depende de funções puras em `rendering/flight-view` e `rendering/interplanetary-probe-symbols`. Este acoplamento é **técnico e transitório**; mover os samplers de estado ao domínio, com API estável e testes, deve ser avaliado antes de M6, não criar mais uma propagação.
- Repetir consultas a sondas pode repropagar trajetória e afetar FPS em cenas densas; mensurar em navegador antes de qualquer otimização por cache. Não fazer cache de cursor/eventos sem garantir época e imutabilidade.
- As simulações e o renderer continuam especializados, por design; M3–M7 não são parte desta decisão.

**Evidências:** `src/ui/state-provider.ts`, `tests/phase8-m2-state-provider.test.ts`, `docs/systems/state-observation.md`. A aprovação final depende do validate no HEAD, smoke e CI manual.
