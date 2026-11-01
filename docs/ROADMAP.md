# Roadmap orientado a gates

A sequência abaixo é a **ordem desejada**, não autorização para iniciar todas as fases. Cada fase exige avaliação da orquestradora após entrega do agente. Escopo pode ser dividido ou reordenado mediante ADR e atualização do status.

| Fase | Nome | Resultado demonstrável | Gate para avançar |
|---|---|---|---|
| 0 | Fundação documental | Visão, arquitetura, workflow, backlog e brief inicial versionados | Documentos preparados; próxima fase definida |
| 1 | Planetário vivo | Sistema procedural em Canvas, órbitas, câmera, warp e save/load básico | Screensaver agradável e estável por 30 min |
| 2 | Observatório e telemetria | Seleção, foco, detalhes orbitais, camadas e eventos astronômicos | Usuário consegue explorar e entender o sistema |
| 3 | Primeira era espacial | Civilização inicial, tecnologias básicas, lançamentos/satélites e falhas | Progressão autônoma testável e consequência visível |
| 4 | Linguagem visual, HUD e UX de missões | Discovery com PO, instrumentação, iconografia vetorial, trilhas corretas e design system | Voos legíveis, sem telemetria inventada; padrões documentados |
| 5 | Missões interplanetárias | Transferências, sondas, encontros e pousos simplificados | Missões têm causa, risco e resultados reproduzíveis |
| 6 | Auditoria e arquitetura composável | As-Is/To-Be, mapa de duplicações, plano de migração e avaliação de bibliotecas | Diagnóstico verificável e fases técnicas propostas, sem reescrita |
| 7+ | Consolidação incremental da engine | Contratos de estado, frames, operações, conhecimento e observação universais | Migrações graduais com testes de referência e saves seguros |
| Futuro | História, infraestrutura, longevidade, produção audiovisual | Expansão apoiada na engine unificada | Cada feature reutiliza contratos antes de especializar |

## Regras de fase

- Fazer somente uma fase de implementação por vez.
- Nenhuma fase futura começa sem avaliação do gate anterior.
- Toda fase recebe issue de execução, branch, PR, evidências e handoff.
- Regressões bloqueantes exigem correção antes de avançar.
- Mudanças de prioridade são registradas em `docs/DECISIONS.md` e `docs/PROJECT_STATUS.md`.
- O humano aprova comportamento esperado por demonstração; agentes defendem abordagem técnica e testes.

## Gates universais

1. Critérios específicos cumpridos e observados no navegador.
2. Testes, typecheck, build e lint relevantes passam (ou bloqueios explicitados).
3. Instruções reproduzíveis para abrir e avaliar.
4. Regressões analisadas; performance e persistência verificadas onde aplicáveis.
5. PR revisável e relatório com limitações; status não declarado concluído só pela IA.

## Planejamento progressivo

Apenas a fase ativa recebe especificação operacional detalhada. Fases futuras são intenções de produto, refinadas uma de cada vez com evidências da fase anterior. Nunca estimar prazo como requisito de aceite.


## Sequência técnica sugerida pela auditoria Fase 6 (não autorizada)

M0 golden fixtures e baseline/benchmarks → M1 estado temporal e referenciais → M2 state/observation providers → M3 eventos e operações adaptados → M4 executor compartilhado → M5 solvers/autonomia/knowledge por composição → M6 observabilidade universal → M7 remoção dos caminhos legados. Gate crítico: **mesmo executor físico-operacional para missão local e interplanetária sem regressões e sem teleporte**. O desdobramento de 7+ em fases exige decisão futura da orquestradora; detalhes em [plano](architecture/MIGRATION_PLAN.md).
