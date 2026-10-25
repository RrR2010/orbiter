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

## Política de economia do GitHub Actions (v3)

- **Durante a implementação:** commits e pushes livres; todo o feedback de desenvolvimento é obtido localmente (`npm ci`, `npm run validate`, `npm audit`, smoke tests de navegador). PR pode ficar aberto sem disparar CI.
- **Gate final:** depois de implementação completa, documentação, revisão, testes automatizados e smoke tests aprovados, disparar manualmente o workflow `Orbiter Final CI` via `workflow_dispatch` apontando à branch e ao HEAD do PR. Conferir conclusão `success` e SHA correspondente antes do squash merge.
- **Falha:** corrigir localmente, repetir testes e fazer no máximo nova rodada de CI final quando o trabalho estiver realmente pronto; não há proibição de reexecutar quando necessário, mas não executar por commit.
- **Infraestrutura:** o workflow não deve ter triggers `push`/`pull_request`. Caso as regras do repositório exijam checks gerados por eventos automáticos ou a API não possa disparar manualmente, escalar o bloqueio ao humano/orquestradora antes do merge. Nunca ignorar branch protection.
- **Rastro de validação:** handoff informa os comandos locais, resultados de smoke test, URL da execução final, conclusão e SHA.

## Continuidade técnica entre agentes — As-Built

1. No início de toda fase, ler `docs/systems/README.md` e apenas as especificações dos subsistemas que serão afetados, além do brief/ADRs pertinentes.
2. Os documentos As-Built devem refletir a **implementação na main**, descrevendo propósito, regras, algoritmo/unidades, estado, APIs/eventos, integração, referências do código e testes, limitações e pontos de extensão.
3. Uma feature que altera um subsistema existente só está pronta quando a documentação desse subsistema também estiver atualizada. Criar documento novo apenas para um limite de responsabilidade real.
4. Handoffs são históricos, `docs/phases/` são requisitos planejados, `docs/systems/` é contrato atual; evitar usar um handoff antigo como descrição vigente.
5. Manutenção retrospectiva excepcional: somente documentação, diretamente na main, com responsabilidade dividida por subsistema e sem disparar GitHub Actions. Não editar os mesmos arquivos em paralelo; sincronizar antes de commitar. Se uma descoberta exigir correção de código/contrato ou controversa, registrar a divergência e escalar, sem corrigir o produto nessa tarefa.
