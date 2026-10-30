# Missões autônomas — As-Built (Fase 3)

## Identidade e ciclo
`Mission` em `src/simulation/civilization.ts`: `id`, `originId`, `targetId`, `startedAt`, `launchAt`, `resolvedAt`, `status`, `success`, `vehicleId`, `flight?`. Estados estratégicos: `preparing → ascending → success | failure`. Uma missão ativa por vez; IDs `mission-N` e veículo `vehicle-N`, com serial monotônico. O alvo inicial é o próprio planeta natal. A preparação leva 1200 segundos simulados.

## Objetivos e resultado físico
`planMissionObjective(seed,id,radius,ignition,tier)` em `src/simulation/spaceflight/objectives.ts` amostra uma das opções `suborbitalSurvey`, `lowOrbit`, `ellipticalSurvey`, `highApoapsis` e `orbitAndReturn`; o conjunto tem duas entradas `lowOrbit`. Determina AP/PE desejados em metros, janela e `plannedEndS` apenas para `orbitAndReturn`. Isso é intenção, não garantia. `createAutonomousFlightV2` monta o plano físico e `resolveAutonomousFlightV2` produz checkpoints e flags `orbital` / `goalAchieved`.

No lançamento, calcula-se toda a trajetória determinística; a conclusão estratégica ocorre em `flight.terminal.timeS`. `success = Boolean(flight.goalAchieved || flight.orbital)`; por isso uma órbita operacional fora de alvo e uma pesquisa suborbital com veículo perdido podem ser sucesso estratégico. `outcome` físico distingue `achieved`, `partial`, `failed`. Uma falha de inserção com trajetória de impacto continua em queda até o checkpoint de contato; nave e rastro não persistem depois de impacto. `plannedEndS` de retorno não implica pouso guiado implementado.

## API, consumidores, testes
`src/simulation/civilization.ts`, `spaceflight/objectives.ts`, `spaceflight/flight-v2.ts`; `src/rendering/{flight-view,mission-symbols,mission-trajectory,pick-mission,predicted-orbit}.ts` e `src/main.ts` exibem missão/seleção sem alterar destino. `tests/{flight-v2,mission-view,flight-view,suborbital-impact,failed-insertion-descent,mission-trajectory,launch-phase}.test.ts` exercitam diferentes fases e impacto. Histórico limitado a 60 missões por civilização; os resultados anteriores não são recalculados na renderização. Sem ordens manuais, destinos interplanetários ou regresso controlado.

## Agenda observatória — Fase 4 (branch de desenvolvimento)

O novo HUD e a agenda são consumidores somente-leitura de missões. Agenda mostra até cinco missões `status='preparing'` com `launchAt >= clock.time`; intenção de acompanhar é guardada por ID fora do estado estratégico em `orbiter.mission-watch.v1`. A detecção por IDs de eventos processados (não só último evento) evita perder lançamentos intermediários do lote do scheduler; não altera evento/clock nem decide resultado. Seleção permanece contextual. Sem civilizações paralelas implementadas; uma agenda global agregada exigirá extensão futura.
