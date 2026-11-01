# Matriz de composição, duplicações e lacunas — Fase 6

**Definições:** compartilhado = o mesmo módulo/contrato é chamado; paralelo = resultados semelhantes por caminhos independentes; especializado legítimo = física ou política materialmente distinta; lacuna = ainda sem contrato universal. Gravidade em superfície, órbita local e sistema solar não são intercambiáveis por renomeação.

| Capacidade | Evidência As-Is | Classificação | Ação mínima | Prioridade |
|---|---|---|---|---|
| Estado cinemático | `spaceflight/types.ts:FlightState`; corpos em `world.ts` | parcial | adaptar estado temporal e frame explícito sem alterar serialização | P0 |
| Propagação coast | `spaceflight/coast.ts:propagateCoast` usado por sonda e voo local | compartilhado | preservar, unificar parâmetros do campo central | P0 |
| Transição SOI | `interplanetary-handoff.ts` + `interplanetary-escape.ts` | especialização legítima + contrato ausente | frame graph, transformação conservativa e tests | P0 |
| Solver Lambert x guidance subida | `interplanetary-lambert.ts`, `spaceflight/guidance-v2.ts` | especialização legítima | interface de solver por objetivo; não fundir algoritmos | P1 |
| Execução de plano | `spaceflight/flight-v2.ts` x `interplanetary-mission-manifest.ts` | paralelo | operação comum que despacha coast/burn/handoff com checkpoints | P1 |
| Scheduler | `civilization.ts:advanceCivilization` x `interplanetary-mission-timeline.ts` | paralelo | agenda de eventos tipados e idempotentes, mesmo clock | P1 |
| Missões e status | `civilization.ts:Mission` x `interplanetary-mission-timeline.ts:MissionTimeline` | paralelo | missão objetivo + assets + plano operacional, adaptadores | P1 |
| Conhecimento | `scientific-knowledge.ts` e `interplanetary-science-inbox.ts` | parcial já compartilhável | escopo por civilização e evento de observação recebida | P2 |
| Capacidades de veículo | `spaceflight/vehicle-capability.ts` | parcial | composição de recursos/módulos; manter modelos simplificados enquanto necessários | P2 |
| Observação posição | `world.ts:positionsAt`, `mission-symbols.ts`, `interplanetary-probe-symbols.ts` | paralelo | `StateProvider.sample(entity,time,frame)` somente leitura | P1 |
| Previsão/trajetória | `predicted-orbit.ts`, `mission-trajectory.ts`, `interplanetary-trajectory.ts` | paralelo de apresentação, física diferente | `TrajectoryProvider` com semântica osculating/planned/realized/predicted | P2 |
| Telemetria/inspector | `observatory.ts:bodyTelemetry`, `mission-telemetry.ts`, `interplanetary-mission-view.ts` | paralelo | `TelemetryProvider`, valores opcionais com proveniência/frame/unidade | P2 |
| Seleção e câmera | `observatory.ts`, `mission-camera.ts`, `main.ts` | paralelo na política de alvo | ID único + resolver de localização; manter gestos e presets de zoom | P2 |
| Render e picking | `canvas.ts`, `pick.ts`, `pick-mission.ts` | Canvas compartilhado, pick paralelo | adaptar primitives e hitboxes a registros de entidades | P3 |
| Persistência | `save.ts` + `civilization.ts` + `observatory.ts` | armazenamento segregado legítimo, schema incompleto | versionar fronteiras/validar contratos de snapshot, sem migrar agora | P1 |

## Especialização permitida

- Analítica kepleriana de corpos, transferência de Lambert, ascensão de empuxo finito, coast e correção de curso podem usar algoritmos distintos sob **as mesmas unidades, frames e timestamps**.
- Solvers produzem propostas; guidance executa dentro de capacidade e combustível; resolver eventos é responsabilidade do scheduler; o rendering nunca altera truth.
- A densidade de pontos da trilha, símbolos, nível de zoom e representação de nave/planeta são especialização **visual**, mas a obtenção do estado físico não deve ser separada por classe de missão.

## Lacunas de produto — destino, não escopo da Fase 6

| Funcionalidade | Estado | Pré-requisito |
|---|---|---|
| Mais de uma civilização, propriedade de naves | futuro | identidade universal + escopo do knowledge/autoridade |
| Baterias, geração, integridade, estágios efetivos | futuro | vehicle components + operações com recursos |
| Ciência além da estimativa gravítica | parcial | pipeline observação/entrega/estimativa ampliado |
| Atmosfera/arrasto | futuro, modelo físico especializável | Dynamics interfaces e golden fixtures |
| Tripulação e suporte à vida | futuro | componentes e policy autonomy |
| Trilha planejada vs realizada vs prevista | parcial | trajectory provider com provenance |
| Diretor de eventos e PiP | futuro | event projection e observation unificados |
| Warp com UX suavizada | parcial | scheduler determinístico + apresentação independente |

**Regra de exceção:** qualquer novo serviço paralelo deve ter ADR com prova de incompatibilidade semântica, teste e prazo de reconvergência.
