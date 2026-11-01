# Fase 6 — Auditoria arquitetural e plano de transição composável

**Status:** AUTORIZADA para auditoria, NÃO autorizada para reescrita/novas funcionalidades. Reposicionar História e Direção Narrativa para depois da consolidação do núcleo.
**Missão:** provar onde existem duplicações e acoplamentos, validar arquitetura-alvo e recomendar sequência incremental de refatoração, incluindo biblioteca/engine de física e renderização.

## Leitura obrigatória

`AGENTS.md`, `docs/architecture/TARGET_VISION.md`, `docs/architecture/TRANSITION_CHECKLIST.md`, `docs/ARCHITECTURE.md`, `docs/systems/README.md`, `docs/design/README.md`, `docs/WORKFLOW.md`, `docs/ROADMAP.md`, Fases 3–5 e documentação de voo interplanetário.

## Discovery e alinhamento

Entrevistar o PO em linguagem funcional: fidelidade desejada, continuidade dos saves e do universo, prioridades de interação, múltiplas civilizações, custo aceitável de mudança visual. Propor trade-offs; não pedir decisões de APIs/frameworks. Registrar escolhas; não bloquear auditoria documental por preferências que não mudam o diagnóstico.

## Entregas obrigatórias

1. **Mapa As-Is:** fluxos reais, módulos/exports e responsabilidades de voo local, interplanetário, civ, knowledge, scheduler, câmera, HUD, trajectories, saves. Citar arquivos, linhas/exports quando possível. Apontar comportamento e divergências de docs As-Built.
2. **Matriz de duplicações e lacunas:** quais partes são reimplementadas, quais já são compartilhadas, diferenças físicas legítimas e onde a abstração deve ser revista em vez de adicionar paralelo.
3. **Arquitetura To-Be:** contratos TypeScript de referência (apenas documentação ou protótipos isolados), diagrama de dependências, fluxo de dados de truth → knowledge → mission plan → guidance → physics → observation, estado e eventos, mecanismos de extensão.
4. **Planos de missão:** operacionalizar as quatro políticas de autonomia, grafo de operações e papel de comunicação, recursos/energia, confiabilidade e tecnologia, sem implementar.
5. **Plano de migração por incrementos:** sequência com dependências, priorização, riscos de saves, critérios testáveis, fixtures/benchmarks, opção de rollback e momento de remover código obsoleto. Evitar reescrita de uma vez.
6. **Matriz de ferramentas:** pesquisar opções atuais de render (Canvas, PixiJS, Phaser, Godot), física/astrodinâmica JS/TS, WASM e Python auxiliar; avaliar manutenção, licenças, compatibilidade Web, desempenho, custo de migração e evidência. Protótipo ou benchmark isolado apenas se justificável; não trocar stack nesta fase.
7. **Relatório de lacunas de produto:** múltiplas civs, energia, ciência/knowledge, atmosfera, tripulação, rota planejada/realizada, diretor de eventos, PiP e warp; classificar como fundação, implementação posterior ou backlog.
8. **Governança:** atualizar checklist de diagnóstico, ADR proposto, índice, status, roadmap recomendado e issue/handoff. Não alterar código de produção nem fazer merge de refatoração na fase de auditoria.

## Artefatos esperados

`docs/architecture/AS_IS_AUDIT.md`, `COMPOSABILITY_GAP_MATRIX.md`, `TARGET_CONTRACTS.md`, `MIGRATION_PLAN.md`, `TECHNOLOGY_EVALUATION.md`; atualizar o checklist. Nomes podem variar se índice for mantido.

## Gates

- A1: evidência de código/testes sustenta cada achado importante.
- A2: recomendações distinguem duplicação acidental de especialização física legítima.
- A3: exemplos demonstram como missão local/interplanetária usariam operações e observação comuns.
- A4: riscos de saves e plano de migração/rollback claros.
- A5: comparação tecnológica com fontes atuais, licenças e critérios mensuráveis; nenhuma migração presumida.
- A6: checklist de transição e roadmap priorizado, com estimativas relativas de risco/esforço e gates futuros.
- A7: nenhum código/runtime alterado; documentação e relatórios coesos.
- A8: como tarefa documental, **não executar GitHub Actions**; validar links, consistência e Markdown localmente. Seguir governança de branch/PR e merge documental autônomo, salvo conflito/risco.

**Parar ao concluir:** próxima fase de implementação requer avaliação da orquestradora e autorização explícita. Não declarar a engine unificada pronta.
