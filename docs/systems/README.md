# Catálogo As-Built de subsistemas

**Finalidade:** especificações vivas do comportamento **efetivamente implementado na main**, para orientar agentes sem exigir leitura integral do código. Conferir cada contrato com o código e os testes. Nenhum link sem arquivo é evidência de funcionalidade.

## Responsabilidades na consolidação inicial

| Escopo | Agente responsável | Documentos esperados | Estado |
|---|---|---|---|
| Fases 1–2 | Agente original | `orbital-engine.md`, `simulation-clock.md`, `camera-and-observer.md`, `world-generation.md`, `persistence.md` (parte legada e interfaces observatórias) | **Documentado na main em 2026-10-25** |
| Fase 3 | Agente de Fase 3 | `civilization.md`, `technology.md`, `missions.md`, `vehicles.md`, `spaceflight.md`, `mission-scheduler.md`, `strategic-persistence.md` | Documentado na `main` (2026-10-25) |

**Evitar conflito:** o agente 1–2 é proprietário inicial de `persistence.md`. O agente 3 documenta persistência estratégica num arquivo próprio `strategic-persistence.md` e referencia o contrato legado, sem editar `persistence.md` simultaneamente. Os nomes sugeridos podem ser ajustados para os limites reais do código, desde que este índice seja atualizado. Trabalhos devem ocorrer sequencialmente ou com sincronização entre pushes.

## Especificações disponíveis (Fases 1–2)

| Subsistema | Contrato vivo | Módulos fundamentais |
|---|---|---|
| Geração do mundo | [world-generation.md](world-generation.md) | `src/core/random.ts`, `src/simulation/world.ts` |
| Mecânica orbital | [orbital-engine.md](orbital-engine.md) | `src/simulation/orbits.ts`, `src/simulation/world.ts` |
| Relógio simulado | [simulation-clock.md](simulation-clock.md) | `src/core/clock.ts`, integração em `src/main.ts` |
| Câmera, render e observatório | [camera-and-observer.md](camera-and-observer.md) | `src/rendering/{camera,canvas,pick}.ts`, `src/ui/observatory.ts` |
| Save original e preferências | [persistence.md](persistence.md) | `src/persistence/save.ts`, `src/ui/observatory.ts` |

**Atenção à versão atual:** código integrado posteriormente (Fase 3) alterou save principal para v2, separou foco de follow e adotou preferências do observatório v2. Os contratos acima documentam o estado observado da `main`, incluindo diferenças em relação aos handoffs históricos. A lacuna de migração automática de saves legados é registrada em `persistence.md`, não resolvida nesta tarefa exclusivamente documental.

## Contratos implementados — Fase 3

- [Civilização](civilization.md) — identidade, economia, estado estratégico e integração.
- [Tecnologia](technology.md) — progressão de pesquisa e desbloqueios.
- [Missões](missions.md) — objetivos, estados, resultados e histórico.
- [Veículos](vehicles.md) — envelopes de desempenho e evolução de capacidade.
- [Mecânica de voo](spaceflight.md) — dinâmica V2, órbitas, guiagem, burns, checkpoints e impacto.
- [Scheduler](mission-scheduler.md) — cronologia de eventos, orçamento e watch launch.
- [Persistência estratégica](strategic-persistence.md) — saves V2 da civilização e missões; ver também [persistência geral das Fases 1–2](persistence.md).

Os documentos da Fase 3 foram conferidos contra o código integrado no commit `c54e049` (PR #7); esta consolidação não modifica código/testes. O histórico da Fase 3 consta em [auditoria](../phases/PHASE_03_FINAL_AUDIT.md).

## Modelo de contrato

Cada `docs/systems/<nome>.md` deve registrar concisamente:

1. **Objetivo e comportamentos reais:** o que existe e o que não existe.
2. **Fluxo e regras:** dados de entrada/saída, algoritmos, eventos, unidades e limites.
3. **Módulos e APIs:** arquivos, exports, quem chama/consome e relações.
4. **Estado e persistência:** identidade, versionamento, serialização e migração, quando aplicável.
5. **Testes de contrato:** localização dos testes, invariantes e como validar.
6. **Simplificações, riscos e extensão:** aproximações, limitações e cuidados para alterações.
7. **Referências:** ADRs, fases, PRs pertinentes, sem substituir a documentação atual.

Documentar exclusivamente fatos verificados no código; sinalizar lacunas e divergências. Não mover/refatorar código durante a consolidação documental.

## Ordem de leitura para novos agentes

1. `AGENTS.md`, `docs/PROJECT_STATUS.md`, `docs/ARCHITECTURE.md`.
2. Este índice e os arquivos As-Built relevantes para sua fase.
3. Brief da fase, ADRs relacionados, testes e código específico apenas quando necessário.

## Manutenção

Novo comportamento ou contrato alterado => atualizar a documentação As-Built **no mesmo PR** de implementação. No handoff, listar os documentos atualizados. Documentos legados de fase/handoff são históricos; As-Built é a síntese vigente.


## Desenvolvimento da Fase 4 (não integrado)

Na branch `phase/04-visual-hud-ux`, o HUD observatório e telemetria de missão estendem os contratos [câmera e observatório](camera-and-observer.md), [voo](spaceflight.md) e [missões](missions.md). Render de glifos e setas orbitares está em `src/rendering/{vehicle-glyph,canvas,mission-trajectory}.ts`, com contrato visual em [docs/design](../design/README.md). **Estes itens não são contrato da main até merge validado.**
