# Operações, checkpoints e eventos universais — M3 (branch, gates pendentes)

## Escopo e autoridade

`src/simulation/mission-operations.ts` define `MissionOperation`, `OperationParameters` discriminado por `kind`, `PhysicalCheckpoint`, `DomainEvent`, `MissionOperationRecord`, `MissionOutcome` e `validateMissionOperationRecord`. `src/simulation/mission-operation-projection.ts` expõe `localOperationRecord`, `interplanetaryOperationRecord` e `missionOperationRecords(c)`. A projeção é **derivada, síncrona e read-only**; não avança missões e não altera a persistência JSON V2.

`advanceCivilization` continua autoridade dos eventos estratégicos, lançamento, término e recepção de ciência. `resolveAutonomousFlightV2` continua executor físico local; `prepareInterplanetaryMission` conserva o manifesto pré-calculado e `advanceMissionTimeline` continua único consumidor dos milestones via cursor. M3 não instala segunda fila, não dispara eventos nem acrescenta decisões de guidance.

IDs de operação usam namespace `operation/local/<missionId>/...` e `operation/probe/<missionId>/...`; checkpoints usam `checkpoint/...` e eventos preservam proveniência por `source/<SpaceEvent.id>` ou `milestone/probe/<missionId>/<index>`. `ownerId` é `Civilization.id`, `entityId` acompanha as identidades observacionais da M2 (`local/` e `probe/`). O tipo `StateVector` da M1 fixa `frameId`, unidades SI (m, m/s, kg) e `epochS` absoluto. Checkpoints físicos locais usam `body:<origin>`; handoff/correção heliocêntricos usam `solar`.

## Matriz As-Is → M3

| Origem real | Intenção/planejamento | Evidência física | Confirmação de evento | Mantém autoridade |
|---|---|---|---|---|
| `Mission` e `AutonomousFlightResultV2` | `startedAt`, `launchAt`, plano e sequência de checkpoints pré-calculados | `flight.checkpoints` observados até o tempo de civilização, adaptados por `fromLocalFlight` | `SpaceEvent` `preparation`, `launch`, `success` e `failure` | `civilization.ts` e `flight-v2.ts` |
| `MissionTimeline.manifest.milestones` | milestones completos são **intenção pré-computada**, inclusive correção e encontro | `preCorrectionCoastStart` / `correctedCoastStart` somente quando etapa autorizada pelo cursor e época já decorrida | `milestones.slice(0,cursor)` apenas, com tempo, índice e outcome atingido | `interplanetary-mission-timeline.ts` |
| `scienceInbox.pending` | envio em trânsito representável, sem recebimento presumido | não fabrica estado cinemático do sinal | `SpaceEvent research` com ID recebido e presença em `science.receivedIds`; falha de rádio somente quando registrada | `interplanetary-science-inbox.ts`, `scientific-knowledge.ts` e scheduler |

A conversão da etapa `planetaryEscapeStart` é **intencionalmente pendente**: esse estado está no referencial planetocêntrico e não pode ser rotulado `solar` sem conversão física/época explícita. M3 registra o handoff heliocêntrico real do manifesto, sem deduzir um marco confirmado apenas porque existe o estado preparado.

## Ordem de execução As-Is e efeitos colaterais (não migrados)

Em `advanceCivilization`, a próxima época é o mínimo entre `c.nextAt`, recepção mais antiga e milestone não consumido. Depois de `accrue` e atualização de `c.time`, a ordem é: (1) `drainScience` atualiza `scienceInbox` e `science.knowledge`, registrando pesquisa por observação entregue; (2) `advanceMissionTimeline` avança `cursor` e registra milestones; no `closest-approach` de `flyby`, pode gerar observação gravítica e enfileirar transmissão quando há alcance de rádio, ou registrar falha da ligação; (3) a etapa estratégica de `nextAt` resolve preparação, ignição do voo V2, encerramento, pesquisa ou proposta de lançamento. O processamento está limitado por `budget`; dívida temporal não é descartada. `SpaceEvent` tem IDs derivados do relógio, tipo e serial, e histórico aparado em 120 entradas; `Mission` mantém até 60 itens. O cursor de `MissionTimeline` e os IDs recebidos da ciência são as fontes persistidas para não repetir efeitos após reload.

M3 **não move** essa ordem, não consome eventos, não insere operações em `c.events`, não chama `advanceMissionTimeline`, não transmite nem aplica combustível. A projeção apenas distingue eventos confirmados da intenção do manifesto; para pesquisas simultâneas, seu ID de observação complementa o ID estratégico na projeção, evitando colisões sem alterar o save.

## Semântica e causalidade

- Cada operação tem `id`, `missionId`, `ownerId`, `entityId`, `sequence`, `epochS`, `kind` e `parameters` discriminados; `preconditions` ligam operação anterior dentro do mesmo registro. Os quatro estados são `planned`, `observed`, `confirmed`, `failed`; resultado da operação é união tipada de pendente, checkpoint observado e evento confirmado/falhou. **O desfecho da missão** está separado em `MissionOutcome`: pendente, local (resultado estratégico e físico com `reason`) ou interplanetário (outcome do encontro efetivamente consumido). O desfecho é derivado de `Mission.status`/voo ou cursor do encontro, mesmo quando o log `SpaceEvent` já foi aparado — não se inventa evento ausente.
- Checkpoint significa **estado físico calculado** e só é exposto quando `epochS <= civilization.time` e a respectiva fase foi iniciada. Não é o mesmo que um evento de scheduler. Milestone interplanetário só confirma quando `index < cursor`; tentativa, plano e resultado previsto nunca são por si eventos confirmados.
- `DomainEvent` sempre traz `operationId` causal, `sourceId` persistido ou índice de milestone, `source`, época e desfecho. A ordenação é por tempo absoluto e, em empates, ID. IDs são derivados da fonte persistente, não de ordem de renderização ou número de chamadas.
- Correção projetada ainda não confirmada apresenta `deltaVMs=null` e `fuelSpentKg=null`, evitando expor informação futura; os valores físicos aparecem depois do cursor. Ciência recebida só vira evento se log estratégico e `receivedIds` confirmarem a entrega. Eventos removidos pelo histórico limitado **não são sintetizados**.
- A validação rejeita IDs duplicados, referências causais ausentes, relógio inválido, checkpoints/eventos futuros ou fora de ordem, frame divergente e resultados ligados a evidência inexistente.

## Persistência, invariantes e rollback

A API gera snapshots de consulta a partir de `Civilization`, `Mission` e `MissionTimeline`. Os arrays, cursors, resultados, combustível, recursos, saves, eventos e relógio originais não são modificados. `JSON.stringify(c)` antes/depois deve ser idêntico; reload conserva o registro. O custo da projeção é linear no número de missões, checkpoints e eventos, com ordenação estável; não executá-la em cada frame até haver medição de custo.

Testes M3: `tests/phase9-m3-operations.test.ts` (voo físico local, sonda planejada/confirmada, partition/budget/warp, IDs, ciência e reload). Regressões M0–M2 permanecem na suíte atual. Benchmarks `npm run benchmark:orbits` e `npm run benchmark:phase5` devem confirmar métricas e saveBytes sem mudança. O novo `npm run benchmark:m3` simula os mesmos três seeds e 1.400 dias, consulta a projeção uma vez no estado final e compara serialização, reload, repetição idempotente, contagens de operações/checkpoints/eventos, tempo de projeção e heap. Não altera o scheduler nem mede FPS.

## Interface para M4 (não implementada)

M4 poderá aceitar um `MissionOperation` como intenção, consultar `StateProvider.at` da M2 (somente observação), processar as `preconditions` e produzir `PhysicalCheckpoint` e `DomainEvent` com IDs de causa. **Isso não autoriza M4 a reexecutar os dados históricos do manifesto** nem a criar scheduler concorrente; a fonte de verdade deverá migrar com uma ADR e provas numéricas separadas.

**Estado:** implementação sob teste na PR da Fase 9; sem evidência local/CI neste ambiente no momento da escrita. Não integrar antes de `npm ci`, `npm run validate`, audit, benchmarks, smoke se necessário, CI manual no HEAD e squash merge.
