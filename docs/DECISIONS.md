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
