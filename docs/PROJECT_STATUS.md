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
