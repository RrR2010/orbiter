# Plano de migração incremental — handoff após Fase 6

**Estado:** recomendado; **nenhuma etapa autorizada para implementação**. Fase 7 e posteriores exigem orquestradora. Preservar serviços atuais e instalar adaptadores antes de trocar call sites.

| Ordem | Incremento e dependência | Gate reproduzível | Esforço/risco relativos | Rollback |
|---|---|---|---|---|
| M0 | Congelar fixtures atuais, seeds, hashes de resultados e inventário de saves, antes de qualquer alteração | golden tests local ascent/orbit/impact + Lambert/escape/flyby/correction + science reception + reload; benchmark Fase 5 | S / baixo | apenas fixtures/documentação |
| M1 | EntityId, StateVector, frame graph e efemérides em adapters, depende M0 | continuidade r/v em handoff dentro de tolerâncias; sem mudanças físicas em resultado legado; determinismo FPS/warp | M / alto | feature flag/adapter antigo |
| M2 | Provider universal de estado e observação read-only, depende M1 | corpo, missão local e sonda em mesmo selection/follow/telemetry entrypoint; nenhuma posição inventada | M / médio | escolher view model anterior |
| M3 | Evento/checkpoint/operação genérica com adapter timeline + flight, depende M1/M0 | ordem idempotente sob intervalos de tempo particionados, reload e budgets distintos; domínio sem DOM | L / alto | roteamento legado por missão |
| M4 | Executor de operações e guidance, reutiliza `coast`/`integrator`, depende M3 | mesma engine executa duas operações locais/interplanetárias; conservação de massa/propelente; zero teleporte | XL / alto | execution strategy antiga |
| M5 | Solvers registrados por objetivo, knowledge/autonomy por civ, depende M4 | substituição solver sem alteração de UI/scheduler, múltiplas civs isoladas em fixture | L / alto | selecionar solver antigo |
| M6 | Trajectory/Telemetry/Camera providers únicos, depende M2/M4 | overlays planned/predicted/realized distintos, N/D honesto, picking/follow coerentes | M / médio | projections legadas |
| M7 | Expurgar caminhos obsoletos, só após M0–M6 | cobertura regressiva e validação visual/performance comparada no mesmo seed | M / médio | revert do PR antes de remoção |

**Primeiro passo recomendado:** M0 → M1, não reescrever Lambert nem Canvas. É o menor ponto de alavanca com alto impacto nos acoplamentos.

## Política de persistência e rollback

O ADR-0017 autoriza descartar saves **de desenvolvimento** incompatíveis, não apagar armazenamento automaticamente. Antes de cada alteração, definir schema/version e testar parse malformado, round-trip, seed/clock, integridade de IDs e replay dentro da versão atual. Durante adaptação sem mudança de schema, saves existentes devem continuar válidos. Se mudança incompatível for necessária, declarar explicitamente reset manual e oferecer export/cópia quando aplicável. Não declarar migração retrocompatível por intenção. **Proibir** alterações destrutivas de qualquer dado não descartável.

Golden matrix: voo circularizado, suborbital/impacto, escape SOI, Lambert com encontro e miss, correção usando fuel, evento de recepção de ciência, alcance e latência de comunicação, save/load em checkpoints, warp 1×/100×/1.000.000× e avanço em janelas fracionadas. Testes de invariantes verificam finitude, energia/momento em coast dentro de tolerância da propagação, continuidade de r/v em frame transform, consumos não negativos, timestamps monotônicos, um só evento por id, nenhuma mudança ao ligar HUD/câmera.

**Critérios quantitativos candidatos (requerem calibração com fixtures existentes):** diferença de posição após handoff <= max(1 m, 1e-9·escala de distância) e velocidade <= max(1e-6 m/s, 1e-9·escala de velocidade); usar conservação relativa em coast com tolerância derivada do integrador/solver, nunca travar números antes da medição. Benchmarks: mediana/p95 por 1.400 dias, heap, tamanho de save, 60 missões e 120 eventos; medir FPS/p95 da apresentação separadamente no navegador. Rejeitar regressão >10% de orçamento de tempo/memória sem análise e exceção. **Metas sugeridas, não benchmarks executados.**

## Sequência e gates de decisão

1. Após M0/M1, a orquestradora avalia se normalização dos frames preserva dois casos de verdade. Sem continuidade numérica, corrigir antes de abstrair operações.
2. Após M3/M4, provar duas missões compostas pelo mesmo executor e checar se a abstração fica mais simples, não apenas renomeada.
3. Após M2/M6, comparar Canvas existente versus eventual prova isolada Pixi; trocar backend visual **apenas** se gargalo medido persistir com otimização.
4. Se performance de matemática for gargalo após profiling, testar WASM em solver isolado; não misturar essa decisão com renderização.

## Handoff da Fase 6

Gates de implementação futuros são **pendentes**. Nenhum código, benchmark ou teste de runtime alterado/executado nesta fase. Review documental valida vínculos, coherência de ADR, escopo, e ausência de mudanças em `src/`, `tests/`, `package*` e workflows. Fase 7 não iniciada.
