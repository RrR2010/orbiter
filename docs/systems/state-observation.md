# Estado consultável e observação — M2 (implementado na branch, CI final pendente)

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
| Telemetria local | `missionTelemetry` e `flightViewAt` | HUD consulta provider para altitude, velocidade e massa | `missionTelemetry` permanece para fases, AP/PE, razão de combustível, ISP e ΔV (específicos) |
| Telemetria interplanetária | `interplanetaryMissionView` e símbolo | HUD consulta provider para velocidade, propelente e distância física ao alvo | `interplanetaryMissionView` permanece para cronologia/outcome; formatador especializado permanece |

## Teste e limitações

`tests/phase8-m2-state-provider.test.ts` exercita corpo, voo local e sonda por um mesmo entrypoint, frames e indisponibilidade, com snapshots imutáveis. O Product Owner executou `npm run validate` após o refino do HUD, relatando **4/4 gates e 234/234 testes**, e aprovou os sete cenários de smoke funcional (seleção, follow/pan/zoom, lançamento, sonda, warp e reload). Também relatou `npm audit` sem vulnerabilidades, `benchmark:orbits` (10.000 objetos em 6,23 ms) e `benchmark:phase5` (1400 dias em 95,23/86,20/72,61 ms). O relatório textual não contém SHA; conferir HEAD no gate de CI. Benchmarks são sintéticos/estratégicos e não medem Canvas/FPS. **CI final manual ainda pendente; não integrar até o check do HEAD aprovado**.

A integração conserva um fallback ilustrativo legado apenas para missões sem estado físico, fora do provider. Picking ainda usa listas específicas de símbolos para geometria de hit; o provider fornece coordenadas reais, não desenha entidades. O vínculo transitório de samplers ao rendering e custo de consultas repetidas são riscos documentados na ADR-0022.

A semântica da amostragem interplanetária continua dependente de cursor de eventos; não expor snapshots futuros como observações presentes. A transformação de velocidade da sonda é baseada no estado efetivamente apresentado pelo sampler legado. Valores de `null` são indisponíveis, não uma medida zero.
