# Estado consultável e observação — M2 (branch de implementação, não validado)

## Contrato parcial implementado

`src/ui/state-provider.ts` oferece `createStateProvider(world, civilization?)`, `resolve(entityId)`, `at(entityId, epochS, frameId)` e `stateTelemetry(...)`. O provedor não altera world, civilização, clock, save ou scheduler. É uma fachada de consulta sobre a física já existente, com transformação `reference-frames.ts` (M1). Não é um propagador nem executor.

Os IDs observacionais são prefixados por `body/`, `local/` e `probe/`, preservando IDs persistidos e evitando colisões entre missões e corpos. `resolve` retorna espécie e ID legado. Consulta desconhecida, missão local ainda não iniciada, voo físico ausente, impacto ou sonda sem segmento observável retornam `null`. Epoch inválido gera erro. A telemetria básica inclui unidade SI em campos tipados, frame/época e proveniência `physical-state`; massa e propelente ausentes são `null`, não zero.

O adaptador de corpos usa `celestialState`; o local reutiliza `flightViewAt` e `fromLocalFlight`; o interplanetário reutiliza `interplanetaryProbeSymbols` e `fromHeliocentricProbe`. Estes dois samplers residem historicamente sob rendering, embora sejam funções puras: mover o contrato físico para domínio será uma revisão necessária, sem criar terceira dinâmica. Não confundir este estágio com M6.

## Matriz dos call sites (verificada por inspeção)

| Caso | Antes | Depois nesta branch | Restante |
|---|---|---|---|
| Foco/follow de corpo | `positionsAt` em `observatory.ts` | `createStateProvider().at(body/...)` | nenhuma troca de UI |
| Picking de corpo | `positionsAt` em `pick.ts` | provider para posição | geometria de hit permanece específica |
| Base de lançamento | `positionsAt` em `mission-camera.ts` | provider para centro planetário | offset `surface-site` permanece específico |
| Follow de missão | `missionSymbols` e `interplanetaryProbeSymbols` em `main.ts` | provider local/probe e preparação pela base | HUD especial e símbolos visuais mantidos |
| Picking de missão | duas listas de símbolos em `pick-mission.ts` | provider para estado físico; símbolo legado mantém fallback ilustrativo | hit radius próprio da UI |
| Telemetria planetária | `positionsAt` e velocidade orbital em `observatory.ts` | provider para distância; velocidade orbital histórica mantida | normalizar proveniência e apresentação |
| Telemetria local | `missionTelemetry` e `flightViewAt` | API comum `stateTelemetry` disponível | HUD ainda usa `missionTelemetry` para apsides/objetivos |
| Telemetria interplanetária | `interplanetaryMissionView` e símbolo | API comum `stateTelemetry` disponível | HUD especializado ainda tem rota própria |

## Teste e limitações

`tests/phase8-m2-state-provider.test.ts` exercita corpo, voo local e sonda por um mesmo entrypoint, frames e indisponibilidade, com snapshots imutáveis. O teste foi escrito, **mas não executado** neste ambiente. Não há evidência de benchmark, npm audit, browser smoke ou regressão M0/M1 nesta branch; consequentemente, **M2 permanece incompleto e não pode ser integrado**.

A semântica da amostragem interplanetária continua dependente de cursor de eventos; não expor snapshots futuros como observações presentes. A transformação de velocidade da sonda é baseada no estado efetivamente apresentado pelo sampler legado. Valores de `null` são indisponíveis, não uma medida zero.
