# Estado operacional — Orbiter

**Atualização:** 2026-10-25
**Fase atual:** 2 — Observatório e Telemetria, integrada à main.
**Fase 1 integrada:** PR #2, merge `81bd3e9425ceea07cb071585220d3f33bfe1bcf3`.
**Fase 2 integrada:** PR #4, squash merge `61651381bfb3763184d05fdd959b979a871a00ba`. Issue #3 encerrada.
**Próxima ação:** retornar à orquestradora para avaliação do produto e autorização explícita da próxima fase; Fase 3 não iniciada.

## Baseline funcional

Física híbrida; observador com intervenções opcionais; um sistema planetário e uma civilização inicial futura; persistência entre sessões; visual 2D top-down.

## Histórico de gates

| Fase | Gate | Evidências / limitações |
|---|---|---|
| 0 — Fundação | Aprovada | documentação inicial |
| 1 — Planetário vivo | **Aprovado para merge** | check GitHub Actions #61 verde, lockfile, npm ci, revisão técnica, ensaio visual 15 min com exceção aceita |
| 2 — Observatório | **Integrada** | Issue #3 encerrada; PR #4 squash `6165138`; CI #99 verde (npm ci, lint, typecheck, tests, build e audit); validação funcional humana de seleção, telemetria, follow, zoom manual e enquadramento uniforme |

## Riscos residuais aceitos da Fase 1

- Ensaio de 15 minutos em lugar dos 30 inicialmente sugeridos, aceito expressamente pelo humano.
- Não foram obtidas métricas instrumentais de FPS/memória para uso de muitas horas.
- Frame clamp limita avanço em FPS baixo/inatividade e precisa de nova política antes de simulação por eventos.
- Física analítica bidimensional com aproximações e cinturão visual agregado.
- Persistência v1 regenerativa; futuras mudanças no gerador precisam de cuidado com saves.

## Regra de execução a partir das próximas fases

AGENTS.md e docs/WORKFLOW.md v2 permitem ao executor, com autorização de início de fase, fazer implementar → testar → PR → CI → **merge autônomo** caso todos os gates passem. Orquestradora não precisa aprovar cada PR, mas autoriza cada **nova fase**. Escalonamento só para mudanças relevantes de escopo, blockers, risco irreversível ou exceções não preaprovadas.

## Feedback e retorno

O humano retorna à orquestradora com PR #4 integrado e feedback. A próxima fase requer nova autorização explícita; não iniciar Fase 3 automaticamente.

## Fase 3 autorizada (2026-10-25)

**Próxima execução:** Fase 3 — Primeira Era Espacial, conforme `docs/phases/PHASE_03.md` e [Issue #6](https://github.com/RrR2010/orbiter/issues/6). Um novo agente pode implementar até merge autônomo dentro dos gates. A Fase 4 não está autorizada. **Política CI v3:** não executar Actions por commit; apenas `workflow_dispatch` final após testes e smoke tests locais. Riscos principais: scheduler determinístico sob warp alto, evolução persistente sem quebrar saves, controle de número de eventos.

## Fase 3 — Trabalho em progresso (2026-10-25)

**Branch:** `phase/03-first-space-age`. **PR:** [#7](https://github.com/RrR2010/orbiter/pull/7) (draft). **Issue:** #6 (aberta). **Main:** permanece com a Fase 2 integrada.

O módulo da civilização, o scheduler orientado a eventos, o feed, os símbolos de missões e seus seletores já foram implementados na branch. **Os gates A1–A9 ainda não foram aprovados.** A integração está bloqueada por indisponibilidade de clone do repositório no terminal do executor; não há evidência de `npm ci`, `npm run validate`, `npm audit` ou smoke test visual. GitHub Actions não foi disparado, conforme política CI v3. Não iniciar Fase 4.

## Fase 3 — Bloco A iniciado (2026-10-25)

Na branch do PR #7 foram adicionados os módulos `simulation/spaceflight/{types,gravity,conics,integrator}.ts` e `tests/spaceflight.test.ts`. Modelo de gravidade local por densidade constante versionável, análise de trajetórias cônicas, propulsão simplificada e testes de referência. **Ainda não conectado às missões**, não substitui resultados estratégicos persistidos. Não há testes locais executados nesta sessão; gates permanecem pendentes. Próximos passos: garantir consistência sob partições arbitrárias, eventos de impacto, coast analítico, modelagem de queimas e migração dos saves Fase 3 antes de alterar o fluxo de missão. Sem GitHub Actions nesta etapa.

## Continuação Bloco A — coast analítico (2026-10-25)

Adicionado `src/simulation/spaceflight/coast.ts` com propagador universal de dois corpos e estimativa de primeiro cruzamento da superfície por amostragem limitada + bisseção, bem como testes correspondentes. **Limitação importante:** a busca por impacto ainda não deve ser usada em janelas arbitrariamente extensas sem subdivisão ou evento analítico; a discretização pode ignorar interseções entre amostras. O integrador de queima também demanda estado de passo/remainder para garantir equivalência sob partições temporais arbitrárias. Ambos são pendências do gate A1 antes da integração de missões. Testes escritos, mas não executados no ambiente atual; nenhum CI disparado.

## Bloco A — Correções complementares (2026-10-25)

`sampleBurnAt` consulta queimas desde checkpoint de ignição imutável, evitando dependência de partição do render, ao custo de reintegração por consulta. `coast.ts` reduz o tempo de propagação de trajetórias ligadas módulo período e ajusta a busca de impacto à duração orbital, com limite de 32.768 amostras. **Pendente:** garantir discretização exata para targets fracionários sem recomputação, e detecção rigorosa de impactos rasantes por raiz analítica. Testes escritos e commitados, ainda não executados; sem Actions e sem merge.

## Bloco B — Primeira integração física de lançamentos (2026-10-25)

Foi introduzido `spaceflight/flight.ts` (plano de ignição determinístico, queimas de subida/inserção, estado gravitacional local, telemetria orbital e classificação física). Novas missões passam a armazenar `mission.flight` e a resolver seu resultado pela trajetória calculada; missões persistidas sem o campo permanecem como legado e não têm seus desfechos reescritos. Novo teste compara resultado persistido com plano de voo.

**Gate ainda aberto:** a arquitetura das queimas está em protótipo e não tem ainda guidance contínuo, atmosfera ou inserção automatizada calibrada para a enorme faixa de raios planetários do gerador. O teste legado que exige primeiro satélite bem-sucedido pode falhar até calibrarmos o perfil físico; não afirmar A2/A3. O processo de simulação física ainda não foi instrumentado para custo de longo prazo. A UI/renderer ainda apresentam os símbolos legados, sem trajetória real. `npm ci`, `npm run validate`, `npm audit` e smoke devem ser executados localmente pelo humano antes do CI final. Não fazer merge.

## Bloco D — Primeiro desenho baseado em posições físicas (2026-10-25)

`rendering/mission-symbols.ts` agora deriva posição de planos de voo reais quando disponíveis, preservando fallback legado para saves antigos. Satélites bem-sucedidos usam propagação de dois corpos a partir de checkpoint de fim de queima em cache visual; `pick-mission.ts` usa as mesmas posições do Canvas. Planetas ganham representação do raio físico no zoom e um marcador de base inicial (ainda não georreferenciado ao ponto real de ignição). Teste `tests/mission-view.test.ts` introduzido. **Não concluído:** perfil de foguete precisa calibração, trajetória prevista/efeitos e sprites atlas ainda não existem, e seleção/follow de veículo ainda não acompanha a entidade. Não há evidência de testes locais ou smoke. PR draft, sem CI ou merge.

## Visual local — trajetória física (2026-10-25)

Corrigido erro de TypeScript na renderização (`symbol.angle` inexistente no novo `MissionSymbol`). A marca da base usa agora o ângulo de ignição do primeiro voo físico registrado. Introduzido `rendering/mission-trajectory.ts` para calcular e cachear amostras da trajetória física de subida; o Canvas mostra esse arco em zoom local. O perfil de guiagem ainda precisa ser calibrado e testado para a diversidade de raios planetários; a curva exibida é **trajetória integrada da missão**, não uma cônica futura preditiva. Atlas/sprites, câmera seguindo veículo e UI compacta continuam pendentes. Falha de DNS para github.com no terminal do executor foi confirmada novamente; nenhuma validação local completa, CI ou merge realizados.

## Previsão orbital local (2026-10-25)

Adicionado `rendering/predicted-orbit.ts`: cônica osculadora derivada de posição/velocidade atuais em SI, recorte das seções abaixo da superfície e distinção visual entre órbita sem interseção e trajetória suborbital. A renderização usa `flightState` somente-leitura do símbolo físico, limitando a duas previsões locais simultâneas; órbitas de escape não recebem elipse falsa. Testes em `tests/predicted-orbit.test.ts`, ainda não executados. **Pendente:** prever trajetórias abertas/hiperbólicas, acompanhar nave, LOD/sprites, calibrar lançamentos para obter sucesso físico, smoke e performance. O overlay prevê coast sem empuxo futuro (não é a trajetória final de uma nave durante queima). PR draft, nenhum CI e nenhum merge.

## Checkpoint maior — primeiro atlas, follow de nave e painel resumido (2026-10-25)

Criados `public/assets/orbiter-starter-atlas.svg`, seu manifesto JSON e `rendering/atlas.ts`. Primeiras quatro células: planeta, foguete, satélite e plataforma de lançamento; o Canvas usa `drawImage` com recorte e fallback vetorial. Essa arte é **provisória** e não corresponde ainda ao pipeline PNG industrial nem a famílias de sprites. A projeção de voo ganhou módulo de leitura compartilhado `rendering/flight-view.ts`, reduzindo reintegrações do checkpoint pós-queima; há teste de pureza correspondente. Em `main.ts` o programa espacial passou a listar somente as últimas três missões e o último evento com idade legível; clique na missão ou nave ativa habilita acompanhamento da câmera, com cancelamento por arrastar/parar follow. Nenhum teletransporte de sucesso foi implementado. 

**Bloqueios explícitos para considerar a experiência concluída:** calibrar geração física de missões com sucessos/falhas de fato e confiabilidade; testar performance do Canvas e CSP do SVG externo; revisar follow e interação de zoom em altas velocidades; evolução da base fixa por siteId/longitude; teste em navegador pelo humano. Ainda não executados `npm ci`, `npm run validate` e `npm audit`. Nenhum Actions ou merge.

## Correções após relatório local — 2026-10-25

Relatório do humano: lint falhou por três imports não utilizados e typecheck/build por referência ausente a `flightViewAt` em `rendering/mission-symbols.ts`; suíte falhou por não encontrar simultaneamente resultados de sucesso e falha em missões físicas. Corrigidos os imports. O plano de voo de novos lançamentos passou a dimensionar empuxo e impulso específico por gravidade local e velocidade orbital, usando consumo de propelente distribuído em 300 segundos e duas fases (90s radial + 210s tangencial). Mudança voltada a ampliar variedade de resultados físicos sem trocar fatos históricos; planos de voo já persistidos preservam parâmetros originais. **A correção de calibração ainda exige reexecução de `npm run validate` pelo humano; não declarar teste verde nem merge.** CI permanece proibido até gates finais.

## Feedback de smoke visual — LOD e seleção (2026-10-25)

O humano apresentou capturas com perda de detalhes do planeta em zoom máximo, seleção de corpos limitada ao LOD distante, nave perdida mostrando previsão âmbar curta, órbitas sobrepostas e ausência de atividade em planetas não colonizados. Confirmado: apenas o mundo natal deve ter uma civilização nesta fase, portanto atividade espacial restrita a Astra A é esperada. Corrigido `pickBody` para testar disco projetado pelo raio físico e alterado Canvas para preservar LOD além do antigo corte de 320px e evitar descarte de corpos ampliados cujo centro fica fora da tela. Adicionado `tests/planet-picking.test.ts`. Atlas SVG já aparecia no zoom intermediário (captura mostra continente geométrico), mas a condição `radius<=320` o suprimia em close; para raios extremos há fallback procedural estilizado. Os glifos de satélites sem arco correspondem a histórico legado e/ou previsão limitada às últimas duas naves; UX orbital ainda necessita refinamento. **Validar no browser após atualizar branch**; não marcar gate visual como verde. Nenhum Actions disparado.

## Revisão do ecossistema local a partir do smoke do humano (2026-10-25)

Novas observações: LOD/click em zoom aprovado visualmente; alta frequência de missões, base mudando posição conforme arquivo histórico, fogo de foguetes com perfil repetitivo, periapsis rasteiro, programa espacial aparecendo na inspeção de planetas sem civilização. Nesta rodada foi criado `spaceflight/surface-site.ts` com sítio determinístico por seed+planeta, usado tanto no planejamento de ignição quanto no desenho da base. **Planos de voo já salvos conservam seu local de lançamento original:** essas missões legadas podem decolar de outro lugar; não adulterar dados históricos. `main.ts` oculta o programa espacial na inspeção de corpos diferentes do planeta natal (na visão sem seleção permanece disponível). A espera entre missões aumenta de 3.000s para 172.800s simulados em novos ciclos, para separar eventos e tornar o programa mais crível. A contagem de lançamentos em 24h reais depende do warp e não deve ser interpretada como 24h simuladas.

Criado `spaceflight/objectives.ts`: missões novas recebem objetivo pré-definido determinístico de levantamento suborbital, órbita baixa, levantamento elíptico, grande apoapsis ou órbita com retorno. `FlightPlan.objective` preserva metadados de periapsis, apoapsis e janela de decolagem, com leve variação de perfil energético por missão. **Limitação intencional desta rodada:** objetivos de circularização no apoapsis, deorbit controlado, interceptação, múltiplos estágios e scheduling de nós ainda NÃO estão implementados; guardar um objetivo não significa que a nave o execute. Não declarar esses recursos entregues. Compatibilidade mantida por campo opcional no flight plan e site derivado sem alteração do save v1. Novos testes de persistência espacial e diversidade de objetivos adicionados, não executados; CI continua reservado para o gate final.

## Bloco de manobras — 2026-10-25

Introduzido `simulation/spaceflight/maneuvers.ts`: cálculo determinístico do próximo apoapsis a partir da anomalia orbital e manobra impulsiva prógrada limitada por propelente/Isp, visando elevar o periapsis até a altitude do objetivo. Novos `FlightPlan` incluem flag `useApoapsisBurn` (opcional, para preservar saves legados). `flightAt` aplica a manobra somente após navegar até o apoapsis; `flightResolutionTime` permite que o scheduler espere a manobra antes de classificar o resultado, em vez de encerrar sempre aos 300 s. `rendering/flight-view.ts` foi ajustado para consultar a trajetória pós-manobra e cachear o instante de resolução. Testes de mecânica da manobra adicionados em `tests/maneuvers.test.ts`.

**Limitações:** queima impulsiva é aproximação de curta duração, não um segundo motor numericamente integrado; ainda não existe reserva de combustível por estágio no planner, nem garantia de que o perfil inicial produza apoapsis fora da superfície para todas as seeds. Missões de retorno/interceptação continuam metas planejadas sem execução, não recursos concluídos. Precisa de `npm run validate` e smoke humano antes de marcar gate verde; não disparar Actions.

## Guidance variável — 2026-10-25

Novo campo opcional `Burn.endProgradeFraction` permite interpolar direção de empuxo do radial ao tangencial ao longo de cada queima, mantendo compatibilidade de saves anteriores (campo ausente equivale a direção constante). `planFlight` seleciona deterministicamente perfis vertical, gradual e tangencial conforme seed/missão/objetivo; exploração suborbital favorece vertical. O painel de missões informa o tipo de subida e testes em `tests/launch-guidance.test.ts` cobrem diversidade e determinismo. Os perfis influenciam realmente posição, velocidade, apoapsis e risco de impacto, sem fake de animação. **Validação local pendente desta revisão**; os 4/4 reportados pelo humano aplicam-se ao commit anterior. Continua faltando apresentação temporal de ignição/manobra em warp extremo e acerto do guidance pela altitude-alvo; PR draft, sem Actions.

## Checkpoint UX — evento persistente e telemetria de metas (2026-10-25)

Painel local mostra, quando uma missão está selecionada ou ativa, objetivo pré-planejado e valores atuais de periapsis/apoapsis derivados de `flightViewAt` e `analyzeTrajectory`. Adicionado `flight-spotlight` com indicação textual de evento estratégico e exposição de 3,5 segundos reais para lidar com warp alto; overlay é somente observacional, não pausa nem altera estado determinístico. Visibilidade de eventos múltiplos entre frames continua limitada ao último evento armazenado, não é replay audiovisual completo; manobra no apoapsis ainda não gera evento de feed próprio. Os perfis guidance aprovados 4/4 pelo humano permanecem inalterados nesta rodada. **Novas alterações exigem `npm run validate` local e revisão visual antes de aprovação final.** PR #7 continua draft, sem CI disparado.

## Correções após smoke: combustível orbital e recursos (2026-10-25)

O humano reportou validação local 4/4, mas inspeção visual mostrou periapsis próximo à superfície e nenhuma elevação perceptível. **Causa identificada:** a primeira versão dimensionava o empuxo para queimar os 720 kg inteiros nos 300 s de subida; a manobra no apoapsis não tinha propelente. Em novos planos de voo, `orbitalReserveKg` separa 125–200 kg para a circularização; empuxo/Isp da subida agora são dimensionados com a massa disponível para o primeiro trecho, e planos antigos seguem intactos. O gate de aumento real de periapsis em missões representativas ainda NÃO foi validado e pode exigir novo guidance.

Outro feedback: orçamento parece constante em 300. Causa: produção anterior `0.65/min` repunha custo de 45 em ~69 min, muito antes do próximo ciclo de 2 dias. Ajustado para **+18 recursos/dia simulado, custo 70 por lançamento e capacidade 300**, com valores explicados no painel. A construção deste protótipo usa economia agregada; ainda não há infraestrutura/indústria persistente. Saves anteriores preservam saldo existente e continuam acumulando na nova taxa, sem reinicializar missões. Testes de recursos e reserva de combustível foram acrescentados, **ainda não executados**. PR draft; nada de Actions até os gates finais.

## Revisão da circularização — 2026-10-25

Novo feedback com screenshots de `orbiter-003`: aumento de periapsis pequeno e salto instantâneo da curva no apoapsis; apenas duas órbitas desenhadas por limite visual. Não é aleatoriedade apenas: o código anterior tratava manobra como impulso instantâneo e classificava sucesso por órbita estável, independentemente do erro perante Pe/Ap alvo. **Correção parcial aplicada:** novos planos definem `apoapsisBurnDurationS:60` e aplicam queima prógrada fisicamente integrada em passos de 1 s, limitada pelo combustível calculado; a órbita osculadora agora evolui durante o intervalo. O cronograma estratégico de resolução considera os 60s adicionais, e a UI indica `Circularizando`. Planos já salvos sem campo preservam manobra impulsiva original. Elevado de 2 para 8 o número máximo de órbitas físicas desenhadas para histórico recente. Adicionado teste de duração e consumo de propelente. **Ainda pendente:** calibração para atingir Pe/Ap alvo em diferentes massas/gravidades; métricas de erro e resultados de missão específicos (alvo alcançado vs somente órbita operacional); ao passar de 100×, 60s simulados duram 0,6s reais. Sem teste local desta revisão, sem Actions ou merge.

## V2 — First engine implementation checkpoint (2026-10-25)

Introduced `spaceflight/guidance-v2.ts` with goal-based decisions (apoapsis/periapsis correction, coast, partial/abort), rocket-equation delta-v availability and duration based on thrust rather than preset timings. Introduced `spaceflight/executor-v2.ts` with deterministic simulated-time finite burn integration, analytic coast and physical causal checkpoints. Added dedicated tests `guidance-v2.test.ts` and `executor-v2.test.ts`. These are **new isolated V2 modules, not yet connected to civilization scheduler, renderer or V2 persistence**. Do not claim that gameplay has switched to V2. Immediate next integration: replace `flight.ts` legacy flow and strategic save namespace together; avoid mixed V1/V2 state. Local `npm run validate`, audit and smoke are still pending for this checkpoint. No GitHub Actions, no merge.

## V2 checkpoint — standalone mission plan and immutable timeline (2026-10-25)

Added `spaceflight/flight-v2.ts` with V2-shaped autonomous goal plans, seeded technology-dependent vehicle parameters, generated result/checkpoint timeline and immutable sampler. Added `tests/flight-v2.test.ts` (not locally executed). **Important: exploratory engine not yet fit for active gameplay.** Its initial ascent is still an approximate impulsive delta-v at the launch site rather than a gravity-turn ascent; intermediate visualization interpolates checkpoints and is not authoritative physical integration. The V2 planner/executor still needs to drive staged continuous ascent with apoapsis feedback, robust surface collision handling and physically faithful samples. Do not call this MechJeb parity or treat it as passing gate A2. **No active scheduler or persistence switch has occurred; existing V1 mission gameplay remains active.** The user explicitly authorized abandoning V1 saves once the replacement is complete, so do not migrate them at cutover. CI only on final HEAD after local validate, audit and browser smoke.

## V2 ascent checkpoint — 2026-10-25

Implemented `spaceflight/ascent-v2.ts`: integrates gravity, finite thrust and changing pitch with fixed simulated-time steps; feedback stops on apoapsis target, surface impact, fuel reserve or bounded timeout, capturing telemetry checkpoints. `flight-v2.ts` now uses this ascent instead of its instant launch impulse, then hands the resulting state to the separate V2 maneuver executor. Added `tests/ascent-v2.test.ts` to verify dry mass, repeatability and profile diversity. **Not yet activated:** existing V1 civilization scheduler and renderer remain active, and old persistence keys are still used until a coordinated cutover. **Known limitations:** launch controller still needs benchmark/tuning across generated world radii, safe intercept handling, telemetry interpolation between burn checkpoints and verified orbital targeting. No local tests run or Actions dispatched.

## V2 scheduler / renderer / persistence cutover (2026-10-25)

**Code switched in draft PR #7:** strategic `Civilization.version=2` schedules `createAutonomousFlightV2` and stores `resolveAutonomousFlightV2` checkpoints/result per mission, with event resolution at computed terminal time. Rendering mission symbols, flight read model and ascent track now consume V2 result data and coast analytically; V1 illustrative legacy orbital glyph was removed from the active view. UI reads V2 mission targets/profile. Save namespaces changed to `orbiter.world.v2`, `orbiter.civilization.v2`, and `orbiter.observatory.v2`. Prior worlds intentionally do not load; no migration is attempted. Updated V2-facing tests and added `tests/v2-reset.test.ts`.

**Important validation warning:** This was a broad cutover and **has not been locally compiled, run or browser smoke-tested**. The previous 4/4 report predates it. V2 planning and ascent guidance remain experimental, and exact orbit targeting is not verified across seeds; V1 flight modules and some V1 unit tests still exist in the branch but are disconnected from production, pending cleanup once the V2 gates pass. Check high warp, save/reload, success/failure variety, physical launch-site alignment and checkpoint rendering. Do not run GitHub Actions or merge until local validate + audit + smoke gates have been met.

## Launch watch — observability gate (2026-10-25)

Optional checkbox within the home planet's space program: auto-reduce warp to 1× when the **next mission enters preparation**, focus/follow the home planet, and display the mission ID. The scheduler receives optional `stopOnPreparation` and halts at the exact deterministic strategic event; the frame discards the excess requested time debt and updates its clock to that boundary before switching warp. Other event processing and results are unchanged; reload preference stored under `orbiter.watch-launch.v2`. The feature does not automatically re-arm a stopped mission: checkbox remains enabled for subsequent launches, and a manual warp change is respected until the next preparation event. Regression test `tests/launch-watch.test.ts` checks gate and continuation equivalence. Requires local npm validation and browser smoke; no GitHub Actions or merge.

## Technological vehicle progression — 2026-10-25

Human validation: 4/4, 3 operational partial orbits out of 24 completed launches. Logs show strong asymmetry: some horizontal gravity turns collide during ascent, while mission 23 coasts from 2124 km Ap, then executes a prolonged apoapsis burn for ~380 s until it intersects the surface. Vehicle manufacturing now derives dry mass, tank capacity, Isp, local-gravity-normalized thrust, total delta-v envelope, navigation error and orbital reserve fraction from the technology stage and accumulated research knowledge (bounded logarithmic experience). Plans persist their generation-specific specs; history is unchanged. Debug table now shows tech stage, experience, tank, Isp and theoretical delta-v. Added vehicle progression tests. **Known blocker:** apoapsis burn executor is still open-loop for the whole precomputed burn and can descend into impact before reaching desired Pe. Needs feedback burn cutoff/goal sampling and suitable safety constraints; this change alone does not claim reliable insertion. GitHub Actions remain unused; local validate and browser smoke pending.

## Screenshot analysis — checkpoint path and periapsis feedback (2026-10-25)

Human 4/4 validation, orbiter-001: mission 20 reached its objective; mission 25 achieved a stable partial ellipse after apoapsis burn (Pe -348 km -> +85 km) and mission 26 descended into impact despite a high apoapsis (Pe -2898 km). The solid orange V2 launch polyline connected ascent, instantaneous analytic coast and burn/end checkpoints with straight lines, producing artificial corners and segments crossing planetary disc. **Fixed:** solid ascent trail now only draws elapsed physical ascent checkpoints; analytical coast and maneuvers are separate from this polyline. **Added:** periapsis feedback cutoff to finite-burn executor, evaluated each integration step; further work still needed for controlled orientation and unsafe descents. Regression updated for temporal track filtering. Local validate and browser smoke pending. No GitHub Actions or merge.
