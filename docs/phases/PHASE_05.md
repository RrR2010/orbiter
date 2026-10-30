# Fase 5 — Primeira exploração interplanetária

**Autorizada para discovery funcional, implementação e merge autônomo dentro dos gates.** Issue #10. Fase 4 integrada: PR #9 / squash 8206d8533cd2c0437e0f5ce14b9886897041409f.

## Objetivo

A civilização existente deve lançar uma **sonda não tripulada para outro planeta do mesmo sistema**, planejar e executar uma transferência orbital, registrar trajetória e desfecho real (encontro científico, falha ou passagem sem sucesso). O observador consegue acompanhar essa história em visão geral e visão de missão.

## Etapa A — Discovery obrigatório com o PO

Antes de decidir UX, entrevistar o humano sobre: ritmo do progresso, distância/dificuldade do primeiro alvo, missão flyby versus orbitador, intensidade de destaque de lançamento/chegada, como acompanhar viagem longa, falhas e grau de realismo. Propor alternativas compreensíveis e recomendar um MVP. Registrar decisões e limites em `docs/phases/PHASE_05_DISCOVERY.md`, submetendo o acordo funcional ao PO. Não exigir decisão de algoritmo/biblioteca. Mudança grande de escopo exige escalonamento.

## Entregas obrigatórias

1. **Progressão e objetivo:** adicionar marcos tecnológicos e custos mínimos para acesso interplanetário. Missões locais continuam existindo; a estratégia escolhe destino válido e janela dentro de regras rastreáveis. Não produzir fluxo ilimitado de sondas, nem reescrever a civilização.
2. **Modelo de transferência:** implementar propagação/coasting 2D com corpo central solar e transições de referência justificadas; patched conics, Lambert/Hohmann aproximado ou solução tecnicamente adequada, com contratos explícitos sobre hipóteses, velocidade, delta-v, SOI/limiar de encontro. Sem animação decorativa que finge interceptação. Derivar posições, velocidades e encontros do estado físico; trajetórias e marcos reproduzíveis por seed/tempo.
3. **Estado de missão e recursos:** missão possui origem, destino, perfil e época de lançamento/chegada prevista, massa/combustível/propulsão relevantes, posição/velocidade e outcome. Planejamento inclui fracassos possíveis com causas determinísticas e consequências estratégicas; manter resultados persistidos.
4. **Warp e eventos:** scheduler deve preservar ordem e não perder aproximação/chegada sob warp alto ou delta particionado. Política de spotlight/warp próximo à chegada para tornar observável sem adulterar física. Evitar loops, sobrecarga ou salto de eventos.
5. **Visualização integrada:** usar design system `docs/design/`. Seleção, foco e follow da sonda; rota planejada distinta de trajetória percorrida; telemetria atual versus prevista/alvo com referenciais explícitos; histórico e notificações discretas. Não sobrecarregar modo ambiente.
6. **Persistência e compatibilidade:** saves V2, civilização, missões existentes, câmera e preferências devem permanecer íntegros; schema/versionamento e testes de migração/continuação se necessários. Sem perda silenciosa nem repetição de desfechos.
7. **Testes e observabilidade:** cenários determinísticos de partida e chegada, sucesso/falha, miss, condições limite, equivalência de partição de tempo, integridade de saves e regressão da Fase 4. Bench/ensaio de simulação acelerada, smoke humano em browser e comandos de reprodução.
8. **As-Built:** atualizar docs/systems relevantes e criar contrato `interplanetary-flight.md`; atualizar catálogo, ADR, backlog, design specs pertinentes, issue/status/handoff.

## Limites de escopo

- Um sistema estelar e uma civilização. Priorizar uma sonda robótica em flyby ou reconhecimento; órbita de captura ou pouso somente se o Discovery e o modelo comprovarem viabilidade sem ampliar desproporcionalmente a fase.
- Sem colônias, estações, comércio, mineração, multiplayer, n-corpos global ou navegação 3D.
- A separação simulação física versus render permanece obrigatória; cálculos de trajetória não dependem do FPS.
- Sem adicionar novos sistemas econômicos além do necessário para missão.

## Gates de aceite

- A1: Discovery aprovado pelo PO e decisões registradas antes da implementação principal.
- A2: ao menos um cenário determinístico alcança flyby/encontro de outro planeta com geometria física consistente; outro cenário demonstra falha/miss rastreável.
- A3: sonda, origem, destino, progresso e desfecho observáveis, com telemetria verdadeira e seleção/follow.
- A4: warp alto, pausa, scheduler e simulação particionada não duplicam nem perdem eventos.
- A5: saves e UX de Fases 1–4 preservados conforme contratos atuais (especial atenção ao reset V2 deliberado); migrar qualquer novo schema com segurança.
- A6: desempenho estável em ensaio reproduzível, sem explosão de entidades ou eventos.
- A7: testes locais (`npm ci`, `npm run validate`, `npm audit`) e smoke humano concluídos, docs As-Built/design atualizados.
- A8: somente após gates locais, executar **uma validação manual GitHub Actions** no HEAD final da branch (`workflow_dispatch`), verificar `success`, fazer squash merge autônomo, fechar issue e registrar handoff.
- A9: não iniciar Fase 6 automaticamente.

## Orientação ao agente

Leia AGENTS.md, docs/WORKFLOW.md, docs/ARCHITECTURE.md, docs/systems/README.md, docs/design/README.md, docs/ROADMAP.md e o estado real. Como este brief envolve mecânica nova, apresentar ao PO a experiência e riscos em linguagem funcional na entrevista. Após aprovação do Discovery, seguir autonomamente; escalar apenas decisões fora do escopo, incompatibilidades sem migração segura ou blockers.
