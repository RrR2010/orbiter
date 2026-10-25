# Workflow — fase autônoma com gates objetivos (v2)

## Papéis

- **Humano / Product Owner:** define comportamento esperado, fornece feedback visual quando necessário, aceita explicitamente exceções de gate.
- **Orquestradora:** prepara briefs e roadmap, define contratos e prioridades, intervém apenas em blockers/escalonamentos e avalia entregas integradas.
- **Executor:** assume ciclo **end-to-end**, incluindo correções, validação, PR, merge e fechamento do handoff, dentro do escopo aprovado.

## Ciclo normal (sem ping-pong)

1. Orquestradora prepara e autoriza uma fase, com issue/brief e gates verificáveis.
2. Humano inicia agente com prompt abaixo.
3. Executor implementa, testa, demonstra e corrige iterativamente sem consultar a orquestradora em decisões locais.
4. Executor abre PR, verifica checklist, valida CI e auditoria, registra evidências e faz **merge autônomo** se todos os gates forem satisfeitos.
5. Executor atualiza status e issue, e fornece relatório final ao humano.
6. Humano retorna à orquestradora **uma vez ao final**, com o PR integrado e feedback. Orquestradora prioriza backlog e prepara nova fase.

**Exceção:** bloqueios fora de escopo, mudança funcional relevante ou riscos irreversíveis exigem escalonamento antes da ação. GitHub branch protection e revisão obrigatória têm precedência.

## Prompt de kickoff

> Você é o agente executor autônomo do Orbiter. Leia AGENTS.md, docs/PROJECT_STATUS.md, docs/PRODUCT_VISION.md, docs/ARCHITECTURE.md, docs/ROADMAP.md, docs/WORKFLOW.md e o brief da fase ativa. Execute a fase end-to-end: implemente, teste, corrija, valide no navegador ou com o humano, abra PR, garanta CI e auditoria e faça merge na main por squash **sem pedir nova autorização**, desde que todos os gates estejam cumpridos. Feche issue, atualize status e entregue handoff com commit integrado. Não inicie a próxima fase. Escale somente se precisar alterar escopo, houver bloqueio externo/PR pré-requisito, risco de perda de dados ou decisão estrutural irreversível. Registre ideias fora do escopo no backlog, sem implementá-las.

## Handoff pós-merge

```markdown
# Handoff — Fase N
- Issue / PR / merge SHA / branch:
- Experiência entregue ao usuário:
- Como executar / demonstrar (3–5 ações):
- Critérios de aceite e evidências (PASSOU / EXCEÇÃO APROVADA):
- Testes, CI, audit e execução visual (reais; registrar limitações):
- Simplificações, decisões/ADRs e riscos:
- Ideias registradas (IDs do backlog):
- Status main / persistência / compatibilidade:
- Feedback funcional esperado do humano:
- Próxima fase: NÃO INICIADA, aguarda orquestradora.
```

## Escalonamento obrigatório

Abrir comentário na issue e comunicar ao humano/orquestradora apenas para:
- Expansão de escopo/alteração significativa de experiência.
- Dependência que requeira PR separado fora da fase.
- Quebra de API/arquitetura global ou save incompatível sem migração.
- Perda potencial de dados, segredo, permissões ou segurança.
- CI/regras GitHub irremediavelmente bloqueantes, ou aceitação de exceção a gate.
- Incapacidade de validar critério obrigatório.

Não escalar ajustes locais reversíveis, bugs, refatorações, escolha de dependência adequada ou documentação da fase.

## Backlog vivo

Capturar ideias como `IDEA-###` no `docs/BACKLOG.md`. Classificar `now` (bloqueio do gate atual), `next`, `later`, `parking-lot`. Ideia não vira escopo sem atualização explícita do brief. A orquestradora faz a triagem **após** integração, não durante a execução normal.

## Regras para revisão, PR e merge

- Issue por fase; branch da fase; PR para `main` com checklist e evidências.
- CI deve passar no commit atual, inclusive lockfile consistente.
- Revisão automatizada ou autoinspeção do executor é útil, mas não substitui aprovação humana quando exigida por branch protection.
- Nenhum merge com testes falhos, conflitos, critérios omitidos ou exceções autoaprovadas.
- Prefira squash merge para histórico legível.
- PR descreve escopo entregue, riscos, limitações e testes; não promete o que não foi validado.
- Atualize status/issue no mesmo PR se possível; após merge, faça follow-up mínimo caso precise registrar o SHA final.

## Revisão de orquestração

A cada retorno **pós-merge**, a orquestradora avalia feedback funcional, riscos, backlog e decide CONTINUAR / HOTFIX / REPLANEJAR. Essa avaliação define o próximo brief; não é pré-requisito para concluir a fase já autorizada.
