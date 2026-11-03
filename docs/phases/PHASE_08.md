# Fase 8 — M2: Estado consultável e observação universal

**Status:** autorizada para execução autônoma até merge com gates. Dependência: Fase 7 M0/M1 integrada (PR #15). **Escopo exclusivo: M2** de `docs/architecture/MIGRATION_PLAN.md`; não iniciar M3–M7.

## Resultado de produto

Um planeta, uma nave local e uma sonda interplanetária passam a ser **entidades consultáveis e observáveis por contratos comuns** de posição, seleção, foco/follow e telemetria existente. As diferenças reais permanecem nos adaptadores específicos; a UI não inventa física ou atributos ausentes. O observador não deve perceber regressão funcional.

## Discovery funcional

Entrevistar o PO apenas sobre diferenças visíveis de seleção, foco, follow, disposição de telemetria e navegação caso seja necessário alterar UX. Não exigir decisões de design de APIs. O objetivo é equivalência comportamental, não redesenhar HUD ou criar novos recursos. Registrar qualquer ajuste de UX autorizado.

## Etapa 1 — Mapear e preparar o contrato

- Ler `AGENTS.md`, `docs/architecture/{TARGET_VISION,TARGET_CONTRACTS,MIGRATION_PLAN,COMPOSABILITY_GAP_MATRIX}.md`, `docs/systems/{README,reference-frames,camera-and-observer,spaceflight,interplanetary-flight}.md`, `docs/design/README.md`, testes M0/M1.
- Inspecionar os caminhos atualmente paralelos: `positionsAt`, amostragem local `flightViewAt`, view interplanetária, `pickBody/pickMission`, `observatory`, `mission-camera`, HUD e `main.ts`. Produzir matriz concreta de call sites e contrato antes de refatorar.
- Estabelecer `EntityId` estável e resolução de `EntityKind`/fonte física, evitando conflitos entre IDs de corpo, missão, nave e sonda; não forçar renomeação dos IDs persistidos.
- Projetar `StateProvider.at(entityId, epochS, frameId)` ou contrato equivalente, somente leitura, apoiado por M1 para transformação de frames; não criar terceiro propagador.

## Etapa 2 — Adaptadores e consumo real

- Adaptar **corpo celeste**, **voo local** e **sonda interplanetária** para o mesmo provider de estado em tempo absoluto, com comportamento definido em preparação, execução, coast, missão finalizada, falha, impacto e checkpoints ausentes.
- Criar uma resolução unificada da entidade para consulta de posição e seleção/foco/follow; migrar call sites concretos, preservando gestos, offset, zoom e preferências de observação.
- Disponibilizar telemetria comum **quando fisicamente aplicável** (posição, velocidade, referencial, época e outras grandezas calculáveis) com semântica, unidade e disponibilidade explícitas. N/D em vez de preencher propelente ou Δv de planetas. Aproveitar os formatadores e as telas existentes.
- Evitar reimplementar toda a UI neste passo. Não é obrigatório migrar overlays completos, todos os tipos de trajetória e instrumentação especializada de M6; deixar adapters e contratos preparados sem duplicar lógica.
- Garantir independência de renderer, DOM e FPS no provider; consultas não podem modificar simulação, scheduler, recursos ou save.

## Etapa 3 — Regressões e documentação

- Testar os mesmos três tipos de entidade atravessando **o mesmo entrypoint**. Cobrir frame local/solar, tempo, IDs, estados não disponíveis, missão ativa/encerrada, seleção, follow/pan, zoom, picking e ausência de recursos para corpos.
- Comparar com fixtures e testes M0/M1: nenhuma alteração física, de resultado, eventos, hashes/save, seed, relógio ou interplanetary SOI. Casos de não convergência do coast permanecem diagnosticados, nunca disfarçados de miss físico.
- Manter rollback simples dos adapters durante integração, sem manter um caminho paralelo permanente sem ADR. Mostrar no PR quais branches por tipo foram eliminadas, quais permanecem legitimamente específicos e por quê.
- Atualizar `docs/systems/` As-Built, `docs/architecture/TRANSITION_CHECKLIST.md`, ADR e design apenas quando necessário; ajustar índice, status, testes e handoff.

## Limites e decisões

- **Não** implementar M3 (scheduler/eventos/operações) nem M4 (executor comum). Não alterar modelos de missão, autonomy, motor de voo, Lambert, guidance, física, economia ou tecnologia.
- **Não** antecipar M6: não prometer overlays completos planned/predicted/realized, camera multi-view ou remodelagem de HUD. M2 resolve consultas de estado e observabilidade básica de forma compartilhada.
- Sem troca de Canvas, PixiJS, Phaser ou Godot.
- Preservar saves V2 sem reset silencioso. Alteração incompatível deve ser escalada antes da execução.
- Não usar `Math.random()` nem dependências de DOM/tempo real no estado consultável.

## Gates objetivos

- **A1:** matriz As-Is com call sites migrados, abstrações justificadas e comparação de antes/depois.
- **A2:** mesmo `StateProvider` retorna estado válido de planeta, nave local e sonda em frames e épocas coerentes, preservando semântica e identidade.
- **A3:** câmera/seleção/follow/picking passam a obter posição de fonte comum nos caminhos essenciais, sem regressão funcional ou novo sistema de câmera paralelo.
- **A4:** telemetria básica compartilha contrato e diferencia disponível/N-D, atual/alvo, corpo de referência, unidade e proveniência. Nenhuma alteração de física ou evento pela observação.
- **A5:** golden fixtures M0/M1, resultados de missão, scheduler, warp e saves permanecem coerentes. Não ocultar falhas numéricas conhecidas.
- **A6:** testes locais `npm ci`, `npm run validate`, `npm audit`, benchmark e smoke humano quando pertinente; registrar limitações e resultados reais.
- **A7:** GitHub Actions somente na validação manual final (`workflow_dispatch`) no HEAD da branch após todas as validações; sucesso antes de squash merge, respeitando branch protection.
- **A8:** PR, documentação As-Built/checklist, issue, status e handoff atualizados. **Não iniciar Fase 9 nem M3/M4.**

## Handoff esperado

Descrever interface adotada, call sites efetivamente migrados, o que continua especializado, resultados de golden fixtures e benchmark, ressalvas de precisão, save, artefatos e diferenças visíveis. Ao concluir, parar para avaliação da orquestradora.
