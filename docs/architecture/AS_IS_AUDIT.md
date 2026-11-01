# Fase 6 — Auditoria As-Is (baseline main, 2026-10-31)

**Natureza:** inventário do código, não promessa de capacidade futura. Base: main após PR #11 (Fase 5). [Issue #12](https://github.com/RrR2010/orbiter/issues/12). Métodos: inspeção estática de código, exports, documentos e catálogo de testes; não houve execução de runtime/CI/benchmark. Achados que dependem de medição são hipóteses.

## Fluxos reais, autoridade e fronteiras

| Domínio | Implementação verificada | Contrato/limite |
|---|---|---|
| Geração e efemérides | `src/simulation/world.ts`, `orbits.ts`, `positionsAt` | Corpos keplerianos por tempo; velocidade de planeta calculada também em `interplanetary-handoff.ts:planetaryVelocityAt`; referencial implícito |
| Voo local | `spaceflight/types.ts:FlightState`, `flight-v2.ts:createAutonomousFlightV2/resolveAutonomousFlightV2/sampleAutonomousFlightWithPlanet`, `executor-v2.ts`, `guidance-v2.ts`, `coast.ts`, `integrator.ts` | estado em SI, posição relativa ao planeta; resultados e checkpoints calculados; `Mission.flight` |
| Interplanetário | `interplanetary-planner.ts`, `interplanetary-lambert*.ts`, `interplanetary-escape.ts`, `interplanetary-handoff.ts:handoffToHeliocentric`, `interplanetary-midcourse-correction.ts`, `interplanetary-mission-manifest.ts:prepareInterplanetaryMission` | usa `FlightState` e `propagateCoast`, mas compõe pipeline pré-calculado em `InterplanetaryMissionManifest`, não a mesma execução de operação local |
| Autonomia | `civilization.ts:advanceCivilization` chama `createAutonomousFlightV2/resolveAutonomousFlightV2`; `interplanetary-autonomy.ts:authorizeInterplanetaryLaunch` monta timeline | lógica por categoria; a primeira usa `Mission`, a segunda `MissionTimeline`; ambas condicionadas à economia/tecnologia |
| Eventos | `civilization.ts:SpaceEvent/advanceCivilization`; `interplanetary-mission-timeline.ts:createMissionTimeline/advanceMissionTimeline`; `interplanetary-communications.ts`, `interplanetary-science-inbox.ts` | clock estratégico e marcos de sonda convivem; não há tipo único de evento/operação universal |
| Conhecimento | `scientific-knowledge.ts:ScientificEstimate/PlanetKnowledge/ScientificRecord/receiveGravityObservation`; `interplanetary-observation.ts`, `interplanetary-science-delivery.ts` | incerteza gravítica e recepção de observação já distintas da verdade, mas civilização única em `main.ts` e propriedades científicas limitadas |
| Seleção/câmera | `ui/observatory.ts:ObservatoryState/selectBody/trackBody/updateFollow`, `ui/mission-camera.ts`; seleção de sonda em `main.ts` | seleção de corpo e missão por caminhos condicionais; não há `EntityId` e `StateProvider` comuns |
| Telemetria e trajetórias | `ui/observatory.ts:bodyTelemetry`, `ui/mission-telemetry.ts:missionTelemetry`, `simulation/interplanetary-mission-view.ts`, `rendering/predicted-orbit.ts`, `rendering/mission-trajectory.ts`, `rendering/interplanetary-probe-symbols.ts` | view models por tipo; local tem análise de AP/PE, interplanetário mostra marcos/posição de probe; amostras e semânticas distintas |
| Render/picking | `rendering/canvas.ts:PlanetariumRenderer`, `mission-symbols.ts`, `interplanetary-probe-symbols.ts`, `pick.ts`, `pick-mission.ts` | Canvas único já compartilhado; construção de símbolos e hit testing são especializados |
| Saves | `persistence/save.ts:Save` (v2 seed/time/warp/camera), `civilization.ts:serializeCivilization/parseCivilization` (v2 missions, science, timelines), `ui/observatory.ts:parseObservatory` | três fronteiras de serialização, dados opcionais legados e timelines pré-computadas; sem snapshot físico universal |

## Provas de compartilhamento efetivo

1. `spaceflight/types.ts:FlightState` é importado tanto pelo voo local quanto pelos módulos interplanetários; `spaceflight/coast.ts:propagateCoast` é usado em `interplanetary-mission-manifest.ts` e `rendering/interplanetary-probe-symbols.ts`. **Não** criar outro integrador/coast por classe de nave.
2. `interplanetary-handoff.ts:handoffToHeliocentric` já explicita transformação local→solar; conservar algoritmo e cercá-lo de testes de posição **e velocidade** antes de torná-lo interface universal.
3. `rendering/canvas.ts` desenha mundo e missões no mesmo Canvas; o problema é a preparação de entidades/trajetórias, não necessariamente o backend gráfico.
4. `scientific-knowledge.ts` preserva estimativa e incerteza e `interplanetary-probe.ts:queueProbeScience` exige recepção pelo scheduler; não confundir intenção de missão com conhecimento observado.

## Divergências As-Built/documentação

- `docs/systems/README.md` ainda rotula Fases 4 e 5 como branches não integradas, apesar do status vigente da Fase 5 em `docs/PROJECT_STATUS.md` e do código na main. Retificar o índice sem alterar semântica dos documentos históricos.
- `docs/ARCHITECTURE.md` exige migração de schema como regra genérica; ADR-0017 e `AGENTS.md` permitem descartar **saves de desenvolvimento pré-release**, preservando validação/reload e sem exclusão automática.
- `docs/DECISIONS.md` contém estados históricos provisórios de ADRs; a auditoria não os reescreve retroativamente.

## Evidências de testes existentes (presença, não execução)

- Voo: `tests/{flight-v2,executor-v2,guidance-v2,spaceflight,maneuvers,ascent-v2,failed-insertion-descent}.test.ts`.
- Interplanetário: `tests/interplanetary-{handoff,lambert,lambert-physical-transfer,midcourse-correction,autonomy,mission-timeline,probe,radio-link,science-persistence,strategic-events}.test.ts`.
- Observação: `tests/{mission-camera,mission-telemetry,mission-trajectory,predicted-orbit,interplanetary-probe-picking,observatory}.test.ts`.
- Estado: `tests/{simulation,civilization,scientific-knowledge,v2-reset}.test.ts`; benchmark `scripts/benchmark-phase5.mjs`.
- **Lacuna:** não foi evidenciada suíte de equivalência diferencial dos dois pipelines, invariantes gerais de troca de referencial nem fixture golden universal após reload/warp. Construir tais gates antes de refatorar. Não foram medidas métricas FPS/memória nesta auditoria.

## Diagnóstico

A dívida principal é **semântica e de orquestração**, não ausência total de engine: `Mission.flight` e `interplanetaryTimelines` são representações diferentes de nave/missão, enquanto análise, seleção e telemetry seguem essas categorias. Preservar solvers, propagadores e regras que já funcionam; introduzir contratos-adaptadores e equivalência antes de substituir execuções. Ver [matriz](COMPOSABILITY_GAP_MATRIX.md), [contratos](TARGET_CONTRACTS.md) e [plano](MIGRATION_PLAN.md).
