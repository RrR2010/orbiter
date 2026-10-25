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

**Próxima execução:** Fase 3 — Primeira Era Espacial, conforme `docs/phases/PHASE_03.md` e sua issue de execução. Um novo agente pode implementar até merge autônomo dentro dos gates. A Fase 4 não está autorizada. **Política CI v3:** não executar Actions por commit; apenas `workflow_dispatch` final após testes e smoke tests locais. Riscos principais: scheduler determinístico sob warp alto, evolução persistente sem quebrar saves, controle de número de eventos.
