# Fase 9 — M3: Operações, eventos e checkpoints universais

**Status:** AUTORIZADA; execução autônoma com gates. **Único incremento autorizado: M3.** M4–M7 e Fase 10 continuam pendentes. Depende da Fase 8 M2 integrada (PR #17, handoff PR #18).

## Intenção

Hoje o voo local (`Mission.flight`) e o interplanetário (`MissionTimeline` / manifest / comunicação) possuem registros, checkpoints e cronologia distintos. Criar contratos e projeções de domínio compartilhados que permitam representar **operações planejadas, execução observada, eventos confirmados e desfechos** para ambas as categorias, preservando a física e o scheduler atual. M3 é a base para um futuro executor comum M4, **não sua implementação**.

## Entrada e alinhamento

Atualizar `main`; ler `AGENTS.md`, `docs/WORKFLOW.md`, `docs/architecture/{TARGET_VISION,TARGET_CONTRACTS,MIGRATION_PLAN,COMPOSABILITY_GAP_MATRIX,TRANSITION_CHECKLIST}.md`, `docs/systems/README.md`, As-Built de M1/M2/voos locais/interplanetários, `docs/phases/PHASE_07_M0_BASELINE.md` e design. Aproveitar contexto e artefatos do agente de M2, mas confirmar HEAD e contratos reais. Discovery apenas quando houver mudança de experiência visível ou decisão de produto; de resto, autonomia técnica.

## A — Mapa de execução As-Is

- Inventariar fluxos reais de `civilization.ts:advanceCivilization`, `Mission`, `flight-v2.ts`, `interplanetary-mission-manifest.ts`, `interplanetary-mission-timeline.ts`, eventos de ciência/comunicação e persistência. Mapear ordem, ownership, tempo, IDs, pré-condições e efeitos colaterais.
- Identificar eventos planejados versus executados/confirmados; distinguir resultados físicos, estratégicos e dados científicos recebidos. Não classificar planejamento como fato físico.
- Documentar matriz de adaptação: quais campos/call sites passam ao contrato comum e quais diferenças legítimas permanecem.

## B — Contratos de domínio comuns (sem criar nova física)

- Introduzir modelos tipados para `MissionOperation`, estado/resultado da operação, `PhysicalCheckpoint`, `DomainEvent`, e relacionamento causal/temporal. Definir IDs estáveis, época absoluta em segundos, entidades/frames e proveniência.
- Operações devem ter pré-condições, parâmetros e resultado sem impor um executor único; representar ao menos launch, burn, coast, handoff, correction, observation/transmit ou equivalentes quando existirem dados reais. Evitar `Record<string, unknown>` sem validação em caminhos persistidos. Contrato extensível, com discriminação de tipos para impedir estados impossíveis.
- Separar claramente **intenção/proposta**, **início/executado**, **sucesso/falha** e **evento confirmado**. Atribuir ownership, correlação, ordem determinística e idempotência; não inventar eventos físicos históricos não produzidos.
- Usar M1 `StateVector`/frames e M2 estado read-only onde apropriado, sem dependência física do renderer/DOM.

## C — Adaptadores e projeção semântico-temporal

- Adaptação de voo local e timeline interplanetária para um registro/projeção comum consultável, usando checkpoints e eventos reais; não recalcular resultados, não rodar física nova, não alterar outcomes.
- Manter o scheduler estratégico e a timeline atuais como autoridades de execução; expor um caminho comum de leitura/projeção e, apenas se seguro, de ordenação/aplicação idempotente de eventos. Não criar scheduler concorrente que processe novamente os mesmos acontecimentos.
- Se for necessário um núcleo de agenda/normalização tipado, fazê-lo puro, sem tomar controle de execução. A migração total do scheduler e o executor operacional pertencem a M4 ou fases expressamente posteriores conforme dependências.
- A prova mínima deve demonstrar uma missão local e uma interplanetária com **o mesmo contrato de operações, checkpoints e eventos**, incluindo causalidade e tempos, sem apagar os dados específicos úteis.

## D — Compatibilidade e testes

- Invariantes de tempo monotônico, IDs/causeId consistentes, evento único por ID, ordenação determinística sob avanço único/particionado e budgets diferentes, eventos de ciência somente após recepção, impactos/encerramentos verdadeiros e ausência de duplicação em reload.
- Todos os golden M0, frames M1 e providers M2 devem continuar funcionando. Medir comparativamente eventos, missões, projeções, outcomes, bytes de save e benchmark de 1.400 dias; registrar diferenças justificadas.
- Preferir adicionar projeções derivadas, sem mudar schema do save V2. Se alteração incompatível de persistência for inevitável, escalar previamente; jamais limpar storage automaticamente.
- Nenhum novo UI/feature/efeito, novo tipo de missão, nova tecnologia, alteração de solvers, guidance, física ou renderer. Telemetria e HUD existentes não podem regredir.
- Risco herdado: cinco janelas de não convergência de coast; manter diagnóstico explícito, sem mascarar como miss.

## Gates

- **A1:** matriz As-Is evidenciada em código, e escopo de migração de cada call site.
- **A2:** contratos comuns sólidos e tipados, com semântica e unidades definidas; não replicar `Mission`/timeline como duas APIs novas.
- **A3:** adaptadores reais de missão local e interplanetária produzem o mesmo tipo de projeção operacional com eventos e checkpoints causais, sem dados fictícios.
- **A4:** ordem, idempotência, tempo particionado, budget, save/reload e ciência/comm preservados; golden M0–M2 passam.
- **A5:** nenhuma mudança física, resultado, consumo ou política estratégica; sem segunda engine/scheduler ativo.
- **A6:** `npm ci`, `npm run validate`, `npm audit`, benchmarks locais e smoke humano quando pertinente; evidências ligadas ao HEAD e limitações relatadas.
- **A7:** atualizar As-Built, índice, ADR, checklist, status, issue/PR e handoff; diferenciar **contratos M3 implementados** de **executor M4 futuro**.
- **A8:** CI final `workflow_dispatch` apenas no HEAD final após demais gates; sucesso antes do squash merge; fechar issue. **Não iniciar M4/Fase 10**.

## Entrega

O agente conduz autonomamente análise → implementação → testes → revisão → PR → CI final → squash merge. Escalar bloqueios de regra, risco irreversível, mudança de física/outcomes, schema de saves ou expansão de escopo. Sem reescrita big-bang; manter adaptadores e rollback claro. Um M3 aprovado deve permitir que M4 conecte o executor comum a contratos reais, não apenas a tipos isolados.
