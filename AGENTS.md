# Orbiter — Agent Operating Contract

## Ordem de leitura (obrigatória)

1. `docs/PROJECT_STATUS.md` — estado atual, fase liberada e bloqueios.
2. `docs/PRODUCT_VISION.md` — o que o produto precisa proporcionar.
3. `docs/ARCHITECTURE.md` — limites técnicos e contratos.
4. `docs/ROADMAP.md` e `docs/phases/PHASE_XX.md` — escopo e critérios da fase.
5. `docs/WORKFLOW.md`, `docs/BACKLOG.md`, `docs/DECISIONS.md`.

## Missão

Implemente **somente a fase ativa**. O humano toma decisões funcionais; você decide e explica detalhes técnicos sem impor escolhas desnecessárias. Preserve simplicidade, determinismo e execução local simples.

## Regras não negociáveis

- Nunca iniciar fase seguinte automaticamente, nem misturar features futuras por conveniência.
- Separar simulação pura, renderização, persistência, narrativa e UI; renderização jamais decide resultado da simulação.
- Física híbrida transparente: indicar explicitamente simplificações, unidades e limites de validade.
- Seed determinística; não usar `Math.random()` dentro da simulação; relógio de simulação independente do FPS.
- Registrar alterações de arquitetura em `docs/DECISIONS.md`, antes de substituir padrões existentes.
- Sempre fornecer testes de comportamento, casos limite e instruções para rodar localmente.
- Funcionalidades incompletas devem ser identificadas, não mascaradas com animação que simula sucesso.
- Nada de credenciais em código ou logs. Não remover trabalho existente nem forçar push.
- Código, identificadores, comentários e docstrings em inglês; documentação de produto/handoff em português.
- Cada feature deve ter causa, efeito no estado, observação possível e teste correspondente.
- Se surgir uma ideia fora do escopo, registrar no backlog/issue, sem implementá-la na fase atual.
- Alterações em escopo/arquitetura com impacto transversal exigem aprovação do humano e revisão da orquestradora.

## Ciclo de execução da fase

1. Ler estado e especificação; inspecionar repositório; verificar se há trabalho em progresso.
2. Abrir branch `phase/NN-short-name` a partir de `main` atualizada. Se trabalhar via agente integrado, usar branch/PR equivalente.
3. Implementar em incrementos pequenos; adicionar testes antes ou junto às regras.
4. Executar lint, typecheck, tests e build; se algum comando não existir, explicar por quê.
5. Validar visualmente em navegador quando disponível, incluindo fullscreen, resize, zoom e desempenho; registrar evidências e limitações.
6. Abrir PR para `main`, com checklist dos critérios de aceite e evidências. Não fazer merge automático.
7. Entregar relatório conforme `docs/WORKFLOW.md`. Sugerir mudança de status somente após integração validada.

## Critérios universais de pronto

- Escopo da fase implementado sem regressões conhecidas.
- Projeto inicia com passos documentados.
- Testes automatizados pertinentes passando; avisos e falhas reportados sem omissão.
- Sem `TODO` silencioso em funcionalidade anunciada como pronta.
- Uso de CPU/memória observado quando relevante.
- Documentação e backlog atualizados no mesmo PR.
- Handoff sucinto, com links de branch, PR, commits e pendências.

## Instrução ao agente

Se houver ambiguidade: escolha a menor implementação reversível coerente com a visão, registre a decisão e siga. Pergunte apenas em caso de decisão funcional irreversível, mudança grande de escopo ou risco de perda de dados.
