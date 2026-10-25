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
| 6 | História e direção narrativa | Timeline, resumos, protagonistas e câmera de eventos | Destaques ancorados em eventos reais |
| 7 | Infraestrutura e economia | Estações, mineração, logística e recursos | Infraestrutura surge por necessidades reais |
| 8 | Ecossistema de longa duração | Otimização, estabilidade, crises e legado | Simulação longa e retomada confiáveis |

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
