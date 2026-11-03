# Checklist de transição para engine composável

**Uso:** checklist vivo. Diagnóstico documental da Fase 6 concluído em 2026-10-31; **implementação To-Be continua pendente**. Auditoria transforma itens em diagnóstico com evidência (arquivo/teste), classifica cada um: existente/reutilizável, parcial/refatorar, ausente/criar, descartar. Não marcar como entregue sem integração e testes. Link à [visão-alvo](TARGET_VISION.md).

## A. Compreender o estado atual

- [x] **Auditoria documental:** mapear voo local/interplanetário, dependências e duplicações — [As-Is](AS_IS_AUDIT.md) e [matriz](COMPOSABILITY_GAP_MATRIX.md).
- [x] **Auditoria documental:** estados/unidades/frames/transformações — [As-Is](AS_IS_AUDIT.md); padronização física ainda pendente.
- [x] **Auditoria documental:** contratos de missão/veículo/solver/scheduler/knowledge/comunicação/save — [As-Is](AS_IS_AUDIT.md).
- [x] **Auditoria documental:** inspector, HUD, seleção, câmera, trilhas e renderers — [matriz](COMPOSABILITY_GAP_MATRIX.md).
- [x] **Auditoria documental:** inventário dos testes, scripts benchmark, saves e riscos; fixtures universais e medições ainda pendentes — [plano](MIGRATION_PLAN.md).
- [ ] Medir custo real em navegador (FPS, render, memória) antes de propor troca de renderer.

## B. Contratos universais

- [x] Estado cinemático e referenciais estáveis, incluindo corpos e veículos — M1 `reference-frames.ts`, adapters and regression tests; not yet a universal runtime state provider.
- [x] Serviço comum de efemérides/estado no tempo e transformações de referencial — M1 `frameOrigin`, `celestialState`, `transformState`; solar/body translating frames only.
- [ ] Análise orbital comum AP/PE/energia/elementos com corpo e referencial explícitos.
- [ ] Propagação/coast e integração finita com massa/energia/consumo e testes de continuidade.
- [ ] Interface de solver de manobra e execução de burn separadas.
- [ ] Objetivos de operações reusáveis, condições, falhas e composição de planos — M3 na branch Fase 9: identidade, intenção, estados e causalidade tipados, com adaptadores de leitura para voo local/interplanetário. Grafo de execução e executor compartilhado permanecem M4; validação/CI pendentes.
- [ ] Política de autonomia (fixo, condicional, intenção, deliberativo) independente da física.
- [ ] Modelo de veículos e componentes (energia, integridade, comunicações, ciência).
- [ ] Conhecimento por civilização separado de World Truth, estimativas/incertezas.
- [ ] Suporte multi-civilização sem singletons e com propriedade de missões/ativos.

## C. Observação e produto

- [ ] Seleção/câmera/follow/inspector aplicáveis a qualquer entidade relevante — M2 na PR #17: provider comum de estado e migração parcial de corpo/veículo/sonda em focus/follow/picking; inspector especializado permanece; smoke humano 7/7 aprovado, CI manual pendente.
- [ ] Trajetórias previstas, planejadas, osculantes e percorridas claramente diferenciadas.
- [ ] HUD/telemetria compartilhada por provedor de dados, com N/D onde necessário — M2 na PR #17: métricas físicas básicas dos HUDs migradas para `stateTelemetry`; apsides, objetivos e cronologia permanecem especializados; validate local 234/234 e smoke humano 7/7 aprovados; CI manual pendente.
- [ ] Missões e conquistas observáveis por feed, diretor de eventos e eventualmente PiP.
- [ ] Warp com presets ajustados, suavização de apresentação e segurança do scheduler.
- [ ] Sprites/efeitos/áudio desacoplados da física.

## D. Migração e verificação

- [ ] Preservar fixtures de referência: voo local, circularização, impacto, escape, flyby, correção, ciência, comunicação e reload — M0 regression coverage and physical orbital/flyby goldens added; full quantitative golden matrix still incomplete.
- [x] Implementar adaptadores e substituir um pipeline por vez, sem big-bang rewrite — M1 local/celestial/probe adapters and SOI handoff; no further pipeline migration authorized.
- [x] Validar invariantes e tolerâncias numéricas, determinismo e tempo particionado — M0 temporal tests, M1 round-trip and SOI continuity, orbital/flyby goldens.
- [ ] Definir política segura de migração de saves antes de modificar formato.
- [ ] Demonstrar local e interplanetário pelo mesmo executor de operações — M3 projeta as duas classes pelo mesmo contrato, **sem executor comum**; execução pertence a M4.
- [ ] Remover duplicações somente após migração e regressões aprovadas.
- [ ] Atualizar As-Built, ADRs, design, status e testes no mesmo PR.

## E. Avaliação de tecnologia

- [x] **Decisão de arquitetura documental:** física e backend gráfico são decisões independentes — [avaliação](TECHNOLOGY_EVALUATION.md).
- [x] **Pesquisa comparativa documental:** Canvas/PixiJS/Phaser/Godot — [matriz](TECHNOLOGY_EVALUATION.md). Prova/benchmark **não executados**.
- [x] **Pesquisa documental:** opções numéricas, WASM, licenças, manutenção — [matriz](TECHNOLOGY_EVALUATION.md).
- [x] **Pesquisa documental:** SciPy como oráculo offline; poliastro arquivado — [matriz](TECHNOLOGY_EVALUATION.md).
- [x] **Proposta de gate:** prova gráfica após profiling e consolidação de frames — [plano](MIGRATION_PLAN.md).
- [x] **Proposta documental:** matriz e ADR-0020; adoção de dependência **não aprovada/executada**.

## Resultado da auditoria (diagnóstico, não migração)

- [x] Entregar [As-Is](AS_IS_AUDIT.md), [matriz de gaps](COMPOSABILITY_GAP_MATRIX.md), [contratos To-Be](TARGET_CONTRACTS.md), [roadmap incremental](MIGRATION_PLAN.md), [pesquisa tecnológica](TECHNOLOGY_EVALUATION.md).
- [ ] Obter medições empíricas em navegador, golden fixtures e comparação quantitativa de solvers: trabalho futuro M0.
- [ ] Demonstrar engine única de operações local/interplanetária: trabalho futuro M3–M4.

## Regra de gate

A auditoria entrega evidências, prioridades, dependências e propostas — **não deve marcar como implementado itens da arquitetura futura**. Cada fase posterior adota subconjunto explícito com testes e compatibilidade.
