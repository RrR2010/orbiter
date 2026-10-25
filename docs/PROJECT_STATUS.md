# Estado operacional — Orbiter

**Atualização:** 2026-10-25
**Fase atual:** 1 — Planetário vivo, revisão final APROVADA.
**PR de integração:** https://github.com/RrR2010/orbiter/pull/2 (head conferido `1fd2f63`; CI #61 verde).
**Situação no momento deste registro:** merge **autorizado**, ainda não realizado. Próxima fase NÃO autorizada.
**Próxima ação:** integrar PR #2 à main; fechar issue #1 e registrar merge SHA. Após integração, a orquestradora prepara o brief da Fase 2.

## Baseline funcional

Física híbrida; observador com intervenções opcionais; um sistema planetário e uma civilização inicial futura; persistência entre sessões; visual 2D top-down.

## Histórico de gates

| Fase | Gate | Evidências / limitações |
|---|---|---|
| 0 — Fundação | Aprovada | documentação inicial |
| 1 — Planetário vivo | **Aprovado para merge** | check GitHub Actions #61 verde, lockfile, npm ci, revisão técnica, ensaio visual 15 min com exceção aceita |
| 2 — Observatório | Não autorizada | depende de Fase 1 integrada e brief específico |

## Riscos residuais aceitos da Fase 1

- Ensaio de 15 minutos em lugar dos 30 inicialmente sugeridos, aceito expressamente pelo humano.
- Não foram obtidas métricas instrumentais de FPS/memória para uso de muitas horas.
- Frame clamp limita avanço em FPS baixo/inatividade e precisa de nova política antes de simulação por eventos.
- Física analítica bidimensional com aproximações e cinturão visual agregado.
- Persistência v1 regenerativa; futuras mudanças no gerador precisam de cuidado com saves.

## Regra de execução a partir das próximas fases

AGENTS.md e docs/WORKFLOW.md v2 permitem ao executor, com autorização de início de fase, fazer implementar → testar → PR → CI → **merge autônomo** caso todos os gates passem. Orquestradora não precisa aprovar cada PR, mas autoriza cada **nova fase**. Escalonamento só para mudanças relevantes de escopo, blockers, risco irreversível ou exceções não preaprovadas.

## Feedback e retorno

O humano volta após integração com link do merge e impressões funcionais. Orquestradora avalia e prepara a Fase 2; os próximos executores não precisam retornar durante o ciclo normal. Não marcar Fase 1 como integrada antes de merge verificado.
