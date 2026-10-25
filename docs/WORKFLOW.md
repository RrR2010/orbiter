# Fluxo humano ↔ agente executor ↔ orquestradora

## Papéis

- **Humano / product owner:** descreve comportamentos, observa demonstração, decide prioridades funcionais; não precisa escolher bibliotecas ou desenhar API.
- **Agente executor:** implementa, testa, documenta, roda localmente e entrega PR + evidências.
- **Orquestradora:** mantém arquitetura/roadmap, avalia gates, protege escopo e prepara brief da fase seguinte.

## Procedimento de cada fase

1. Humano inicia novo agente e fornece o **prompt de kickoff** abaixo e o link da issue da fase.
2. Agente lê documentação, executa fase em branch, registra novas ideias sem implementá-las automaticamente.
3. Agente abre PR (não faz merge) com checklist e relatório.
4. Humano testa execução guiado pelo agente e descreve o que gostou/não gostou.
5. Humano volta à orquestradora com link do PR e feedback.
6. Orquestradora julga gate, solicita correções se necessário, ou integra/autoriza próximo passo de maneira explícita.
7. Após merge aprovado, status e backlog ficam sincronizados; próxima issue é preparada.

## Prompt de kickoff para copiar

> Você é o agente executor do projeto Orbiter. Leia integralmente AGENTS.md, docs/PROJECT_STATUS.md, docs/PRODUCT_VISION.md, docs/ARCHITECTURE.md, docs/ROADMAP.md, docs/WORKFLOW.md e o brief da fase ativa. Implemente **somente** a fase ativa; evite perguntas técnicas ao humano salvo bloqueio real. Faça código e testes, rode build/lint/typecheck, valide a experiência no navegador, documente como executar, abra PR sem merge e entregue um handoff pelo modelo abaixo. Registre ideias fora do escopo em docs/BACKLOG.md. Não declare critérios aceitos sem evidência.

## Modelo de handoff do executor

```markdown
# Handoff — Fase N
- Branch / PR / commit:
- O que funciona para o usuário:
- Como executar (comandos + URL local):
- Demonstração guiada (3–5 ações simples):
- Critérios de aceite (cada um: PASSOU / PARCIAL / FALHOU + evidência):
- Testes executados (comandos e resultados):
- Desempenho/limites medidos:
- Decisões técnicas e simplificações:
- Bugs, riscos e regressões:
- Ideias novas registradas (links/IDs):
- Recomendações para próxima fase (não implementadas):
```

## Modelo de parecer da orquestradora

```markdown
# Gate — Fase N
Decisão: APROVADO | AJUSTES NECESSÁRIOS | REPLANEJAR
Evidências conferidas:
Pendências obrigatórias:
Escopo alterado:
Backlog triado:
Próximo passo único:
```

## Backlog vivo

Novas ideias **não** interrompem automaticamente uma fase:
1. Capturar em `docs/BACKLOG.md` com ID incremental, motivação e benefício funcional.
2. Classificar: `now` (bug/risco que bloqueia gate), `next` (candidato à fase seguinte), `later` (futuro) ou `parking-lot` (exploração).
3. Vincular a issue GitHub quando a ideia virar trabalho executável.
4. Orquestradora avalia na transição: aceitar, recortar, adiar ou rejeitar, anotando motivo.
5. Uma ideia não vira requisito de fase ativa sem atualização explícita do brief e do gate.
6. Se houver desvio crítico, registrar ADR e autorização do humano.

## Regras para Issues e PRs

- Issue por fase com checklist e link ao brief; issues menores só quando reduzirem risco.
- Uma branch/PR principal por fase; desdobramentos vinculados à issue.
- PR inclui screenshot/gif quando cabível, comandos de validação e comportamento esperado/observado.
- GitHub é fonte de verdade: evitar contexto escondido em conversas.
- Atualizar links do PR/issue em `docs/PROJECT_STATUS.md` após revisão; não marcar concluído antes de merge aceito.
