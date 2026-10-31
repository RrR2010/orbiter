# Registro de decisões arquiteturais e de produto

Registrar decisões não triviais com motivo, alternativas e consequências. Não reescrever decisões antigas: acrescentar substituições com referência.

## ADR-0001 — Baseline de produto (2026-10-24)

**Estado:** aceita. **Decisão:** física híbrida (realista com aproximações); observador com intervenções opcionais; um sistema planetário e uma civilização inicial; persistência entre sessões; 2D top-down. **Motivo:** equilíbrio entre visual atraente, profundidade emergente e implementação incremental. **Consequência:** 3D, múltiplos sistemas e simulação física irrestrita não bloqueiam MVP.

## ADR-0002 — Simulação separada do desenho (2026-10-24)

**Estado:** aceita. **Decisão:** engine determinística isolada de Canvas/DOM e FPS; tempo e seed explícitos. **Motivo:** testabilidade, persistência, warp e evolução de longa duração. **Consequência:** UI opera via comandos e snapshots.

## ADR-0003 — Mecânica celeste inicial (2026-10-24)

**Estado:** aceita para Fase 1. **Decisão:** elementos orbitais keplerianos para planetas/luas em 2D, sem interação N-body contínua. **Motivo:** render estável e avanço temporal barato. **Consequência:** perturbações e colisões ficam para fases posteriores, com modelos próprios claramente explicados.

## ADR-0004 — Entregas faseadas e backlog protegido (2026-10-24)

**Estado:** aceita. **Decisão:** um agente executor por fase; PR com evidência; revisão de gate antes de avançar; ideias novas capturadas sem scope creep. **Motivo:** continuidade de um projeto vibecoded entre contextos independentes. **Consequência:** documentos versionados são autoridade operacional, não chats.

## ADR-0005 — Persistência mínima regenerativa (2026-10-24)

**Estado:** aceita para Fase 1. **Contexto:** salvar snapshots completos adicionaria acoplamento e migrações desnecessárias. **Opções:** IndexedDB/snapshot integral ou localStorage com metadados determinísticos. **Decisão:** armazenar seed, versão, tempo e câmera no localStorage; regenerar corpos por seed. **Motivo:** simplicidade e teste de identidade. **Consequências:** alterações no algoritmo gerador exigirão versionamento/migração; não há evolução offline.

## ADR-0006 — Câmera local de alta ampliação (2026-10-25)

**Estado:** aceita para Fase 2. **Contexto:** luas pequenas exigem mais de 400× de zoom para que órbitas reais ocupem pixels suficientes. **Opções:** ampliar apenas o desenho (geometria enganosa), criar coordenadas relativas artificiais ou ampliar o domínio de zoom da câmera. **Decisão:** aumentar limite de zoom para 20.000× e ampliar apenas a faixa válida do campo `camera.zoom` no save v1, mantendo mesma chave, formato, unidades e gerador. **Motivo:** zoom altera apenas projeção, sem alterar elementos orbitais. **Consequências:** saves anteriores são compatíveis e não migram destrutivamente; versões antigas do cliente (Fase 1) podem rejeitar uma câmera salva com zoom acima de 400×, embora dados de seed/tempo continuem presentes. O controle de câmera será versionado separadamente numa futura evolução se necessário.

## ADR-0007 — Configurações visuais independentes (2026-10-25)

**Estado:** aceita. **Decisão:** seleção, follow, visibilidade de camadas e modo ambiente usam `orbiter.observatory.v1`, separado do save físico da Fase 1. **Motivo:** preservar seed, tempo e identidade orbital mesmo com configurações de observação malformadas. **Consequências:** preferências podem ser descartadas com defaults seguros sem afetar universo; telemetria permanece função pura do estado físico.

## ADR-0008 — Transições de câmera com velocidade persistida (2026-10-25)

**Estado:** aceita. **Decisão:** suavizar pan/focus/follow e zoom por interpolação exponencial independente do FPS; zoom interpolado em espaço logarítmico. **Motivo:** reduzir saltos visuais durante mudanças de escala, inclusive lua → planeta, sem afetar a simulação. **Consequências:** quatro opções de rapidez persistidas com default retrocompatível no estado do observatório; a posição renderizada da câmera pode atrasar em relação ao corpo selecionado durante aproximação. Drag interrompe follow; selecionar outro corpo durante follow muda o alvo suavemente. Atalhos de tempo têm precedência sobre controles não editáveis.

## Novo ADR (template)

```markdown
## ADR-XXXX — Título (AAAA-MM-DD)
**Estado:** proposta | aceita | substituída.
**Contexto:** problema concreto.
**Opções:** alternativas consideradas.
**Decisão:** escolha e alcance.
**Motivo:** razões.
**Consequências:** vantagens, custos, migração, compatibilidade.
**Substitui:** ADR anterior, se aplicável.
```

## ADR-0009 — Follow sem atraso e zoom manual independente (2026-10-25)

**Estado:** aceita, complementa ADR-0008. **Decisão:** acompanhar o alvo em sua posição analítica atual mais um deslocamento transitório suavizado; não usar interpolação permanente entre posição absoluta antiga e nova. Aplicar zoom automático apenas na transição inicial de foco, cancelando-o no primeiro comando manual de zoom, sem cancelar follow. **Motivo:** em alto warp o alvo percorre grandes distâncias por frame e a interpolação absoluta causava atraso visível; zoom contínuo impedia zoom out. **Consequência:** câmera não cria fatos simulados e permanece centralizada no corpo após a transição.

## ADR-0010 — Strategic event scheduler and isolated save (2026-10-25)

**Estado:** provisória, aguardando validação da Fase 3. **Decisão:** processar eventos da civilização segundo `nextAt`, sem resultados aleatórios por frame; transportar o débito de tempo simulado entre frames; manter estado estratégico numa chave isolada (`orbiter.civilization.v1`) para preservar saves astronômicos v1. **Motivo:** determinismo sob warp e migração aditiva. **Consequências:** log e missões individuais têm limites fixos, sucesso/falha decorrem de seed e ID; avanço offline permanece desabilitado. Animações de satélite são representacionais, não integração orbital de uma nave.

## ADR-0011 — Voo local com física híbrida e atlas visual (2026-10-25)

**Estado:** proposta de implementação autorizada pelo feedback do produto. **Contexto:** a Fase 3 precisa revelar a evolução observável do programa espacial, não apenas logs e símbolos orbitais fictícios. **Decisão:** manter planetas keplerianos existentes e integrar veículos de forma determinística em coordenadas locais 2D com empuxo/gravity turn e coast analítico de dois corpos; calcular trajetórias a partir de estado físico, incluir pontos de superfície ancorados ao planeta e assets independentes de física em sprite atlas com manifesto versionado. **Motivo:** coerência causal e LOD eficiente entre macro e micro. **Consequências:** migração explícita do save estratégico do protótipo da Fase 3, testes mais complexos, orçamento simulado de integração, fallback vetorial e formatos editáveis de assets. Detalhamento em `docs/phases/PHASE_03_VISUAL_FLIGHT_PLAN.md`. Esta decisão não autoriza transferências interplanetárias, estações operacionais ou economia de bases.

## ADR-0012 — Clean V2 reset and deterministic fidelity, not camera-dependent outcomes (2026-10-25)

**Estado:** aprovado para a próxima implementação da Fase 3. O produto autoriza descartar todos os saves e planos legados experimentais, sem migração. Criar namespace de persistência v2 e remover o controlador V1, não conservar suas regressões como requisitos de compatibilidade. **Fidelidade híbrida:** coast analítico, execução de manobras por eventos e visualização física com amostras mais densas no LOD observado. Warp, câmera e seleção **não podem alterar resultado causal**; órbitas não observadas podem saltar entre checkpoints calculados com o mesmo motor, mas não podem receber sucesso arbitrário. Garantir determinismo em 1.000.000× e capacidade escalável através de eventos, analítica e orçamentos de processamento, não FPS. Referência vinculante: `docs/phases/PHASE_03_V2_AUTONOMOUS_FLIGHT.md`. Substitui a obrigação de migração indicada no ADR-0011 para saves protótipos.

## ADR-0013 — Observabilidade orbital e ciclo de vida de veículos (2026-10-25)

**Estado:** aceita para Fase 3. **Decisão:** planos e resultados V2 são autoridade física; render utiliza snapshots imutáveis e não preserva navio, órbita ou trilha após impacto. Missão científica suborbital pode ser bem-sucedida com veículo perdido. Câmera distingue **Focar** (ação única) e **Acompanhar** (follow contínuo); drag modifica offset do corpo ou missão seguida em vez de desfocar, preservando zoom e seleção. A conic de missão selecionada é destacada e mostra AP/PE quando calculáveis; PE abaixo da superfície é ocultado. **Motivo:** coerência entre história, trajetória e observação, especialmente durante debug em 1×/warp alto. **Consequências:** novas preferências do observatório no namespace V2, checkpoints de manobra e impacto, limites visuais por LOD. **Substitui:** regra do ADR-0008 de cancelar follow durante drag; regras V1 de migração foram substituídas pelo ADR-0012.

## ADR-0014 — CI final econômico e evidência de merge (2026-10-25)

**Estado:** aceita. **Decisão:** o relatório humano de lint, typecheck, tests, build 4/4 e smoke não substitui `npm audit`, benchmarks requeridos, revisão da branch final e um workflow manual `Orbiter Final CI` executado no último HEAD antes do merge. Nenhuma execução Actions por commit. **Motivo:** evitar gasto do limite do GitHub mantendo rastreabilidade de segurança e critérios. **Consequências:** resultado de auditoria pode ser `PENDENTE` sem afirmar integração; squash merge apenas após comprovação dos gates, observando branch protection. **Complementa:** ADR-0012 e `docs/WORKFLOW.md`.

## ADR-0015 — Fase de experiência visual antes da exploração (2026-10-25)

**Estado:** aceita. **Decisão:** antecipar uma fase dedicada a linguagem visual, HUD, iconografia, telemetria observável e lifecycle de rastros como Fase 4. Reindexar a exploração interplanetária para Fase 5, narrativa para 6, economia para 7 e estabilidade longa para 8. **Motivo:** a simulação de voo V2 já existe, mas sua leitura pelo observador é insuficiente para sustentar a complexidade de exploração. **Condições:** discovery funcional antes de mudanças UX, sem telemetria fabricada e sem reescrita gratuita da física; documentação de design vira contrato obrigatório das features futuras. **Referência:** `docs/phases/PHASE_04.md` e Issue #8.


## ADR-0016 — Mission Control contextual e observação opt-in (2026-10-25)

**Estado:** implementação candidata na Fase 4, sujeita a validação local e smoke humano. **Contexto:** PO escolheu a terceira direção visual, operação espacial cinematográfica contida, após duas rodadas de Discovery. **Decisão:** preservar panorama Canvas dominante; painel contextual somente para seleção, telemetria derivada em view model read-only, agenda de lançamentos conhecidos pelo scheduler com marcação de acompanhamento em chave observatória independente, setas tangenciais estáticas e glifos Canvas originais. **Alternativas:** painel permanente intrusivo ou instrumentos fictícios, rejeitados. **Consequências:** não altera física/saves V2; dados indisponíveis são N/D; não promete atitude 3D, manobras novas ou multi-civilização. Consulte `docs/design/DISCOVERY_PHASE_04.md`. **Pendente:** smoke, verificações locais e gate CI final.

## ADR-0017 — Saves descartáveis durante desenvolvimento pré-release (2026-10-30)

**Estado:** autorizado expressamente pelo Product Owner. **Decisão:** enquanto o Orbiter não tem saves de produção ou progresso que precise ser conservado, não exigir compatibilidade retroativa nem migração entre revisões de saves. O usuário pode apagar manualmente seu save e começar um universo novo. **Motivo:** reduzir código legado, branches de parsing e testes de migração que não agregam valor neste estágio de desenvolvimento. **Limites:** manter robustez de leitura de dados corrompidos, validação do esquema atual, determinismo, persistência e recarga equivalentes e testes do formato vigente; não apagar automaticamente dados do navegador nem outros arquivos. Em alteração incompatível, documentar explicitamente que saves anteriores deverão ser descartados. **Substitui:** obrigações genéricas de migração em `AGENTS.md` e `docs/WORKFLOW.md` para saves pré-release, sem alterar gates de segurança ou comportamento físico.

## ADR-0018 — Interceptação física por Lambert antes de busca heurística (2026-10-31)

**Estado:** aprovado pelo PO na Fase 5. **Contexto:** a grade de época e ângulo da injeção hiperbólica produziu passagem distante a 500,704 raios do alvo, mesmo com erro de fase Hohmann praticamente nulo; o PO solicitou revisão com métodos de KSP/MechJeb e astrodinâmica. **Decisão:** usar o problema de Lambert 2D como base para determinar os vetores solares de partida e chegada; derivar o vetor planetocêntrico excedente v∞, orçamento de Δv e orientação física do escape; confirmar cada candidato por propagação independente antes de classificar flyby. Hohmann poderá continuar como referência inicial, não como garantia de interceptação. **Escopo:** manter o mundo 2D e patched conics, sem física N-corpos global nem adotar código do MechJeb por cópia. **Gates:** solver determinístico com testes de contorno, handoff físico, flyby e miss integrados, e validação do PO antes de habilitar scheduler automático. Consulte `docs/systems/interplanetary-flight.md`.


## ADR-0019 — Navegação por checkpoints e correções condicionadas à capacidade (2026-10-31)

**Estado:** direção funcional aprovada pelo PO; implementação progressiva dentro das fronteiras de cada fase. **Motivação:** uma injeção executada com erro de atitude, duração ou conhecimento deixa a trajetória realizada diferente do plano inicial. Uma nave real pode atualizar o estado estimado e efetuar pequenas correções (trajectory correction maneuvers) em checkpoints, em vez de exigir uma previsão perfeita desde o lançamento.

**Decisão:** separar (1) trajetória e manobras planejadas, (2) estado físico verdadeiro propagado, (3) estado estimado disponível ao controlador e (4) sequência de comandos efetivamente executados. Uma correção exige gatilho verificável, estado conhecido, cálculo determinístico de manobra, propelente suficiente e aplicação de impulso real; jamais ajustar a posição diretamente. Recalcular previsões após cada manobra e registrar plano anterior, erro estimado, Δv pedido/executado, propelente consumido e resultado. Aplicar erro de navegação e de execução como funções determinísticas de seed, missão, checkpoint e tecnologia; **não** arredondar coordenadas físicas de `number` para simular precisão tecnológica. Nenhuma correção sem motor operacional ou sem recursos.

**Comunicação:** separar alcance do enlace, disponibilidade da janela, latência de ida/volta, integridade e capacidade de transmissão. Com enlace indisponível, a nave apenas executa o programa previamente armazenado e as rotinas autônomas que seu nível tecnológico permita; com enlace disponível, correções enviadas do solo só podem usar informações recebidas e comandos aplicados após o atraso físico de propagação. Uma nave não tripulada não pode receber ordens instantâneas fora de alcance. Naves tripuladas são evolução futura: autonomia local pode dispensar o enlace, mas ainda fica limitada por sensores, computação e propulsão.

**Fase 5 (MVP):** incluir no máximo uma correção de trajetória intermediária para sonda não tripulada, se necessária para viabilizar encontro demonstrável; preparar contratos extensíveis e eventos persistentes sem criar sistema integral de pilotagem tripulada, captura/circularização ou controle manual. Primeiro concluir os gates de Lambert, escape vetorial e flyby físico; depois integrar checkpoint de correção e capacidade tecnológica mínima. Recursos tecnológicos avançados, múltiplas correções, rendezvous, circularização e pilotagem tripulada pertencem ao backlog de fases futuras, não são entregas implícitas da Fase 5.

**Gates:** comparação da trajetória programada/realizada; sucesso e falha física sem teleporte; Δv/propelente conservados; comandos indisponíveis fora de alcance ou antes da latência; ordem determinística com warp/partição; continuidade após save/load.
