# Fase 7 — Fundação física universal: golden fixtures e referenciais

**Status:** autorizada para execução após Discovery funcional breve e validação dos gates.
**Escopo técnico:** M0 + M1 do [plano de migração](../architecture/MIGRATION_PLAN.md). **Não executar M2–M7 nem iniciar Fase 8.**

## Por que esta fase

A Fase 6 provou que os voos locais e interplanetários já compartilham propagador e parte dos tipos, mas carecem de um contrato explícito de posição/velocidade referenciado a corpo e instante. Antes de unificar missões, precisamos proteger os resultados existentes e normalizar os referenciais.

## Abertura / Discovery com o PO

Antes de modificar comportamentos visíveis ou políticas de save, explicar as mudanças propostas em termos funcionais, perguntar expectativas de continuidade e apresentar possíveis diferenças perceptíveis. Não transferir decisões de API/algoritmo ao PO. A implementação física deve ser **observacionalmente equivalente** por padrão; qualquer diferença de resultado não intencional bloqueia o gate.

## M0 — baseline reproduzível (fazer primeiro)

1. Criar golden fixtures determinísticas para: voo suborbital/impacto, inserção orbital, falha de circularização, escape/SOI, Lambert/transferência, flyby positivo e miss, correção de curso e gasto de propelente, ciência/transmissão/recepção, serialização e reload.
2. Fixar seeds, instante inicial, entradas, versões e critérios quantitativos; registrar resultados e tolerâncias antes de alterar a semântica física.
3. Comparar simulação em passagem única e avanço particionado, pausas, warps e budgets do scheduler. Testes novos devem rodar localmente e não depender do DOM.
4. Preservar fixtures de saves V2 (válidos, incompletos e inválidos) sem apagar dados do navegador; explicitar política de reset pré-release do ADR vigente.
5. Criar benchmark repetível de custo CPU, memória e tamanho de save; separar o benchmark do navegador/FPS e não prometer que mediu o que não mediu.
6. **Gate M0:** fixtures e validação passam na base atual; capturar evidências no PR antes de começar M1. Se a base falhar, caracterizar o desvio em vez de mudar o resultado esperado silenciosamente.

## M1 — estado e referenciais explícitos

1. Introduzir tipos/contratos compartilhados para `EntityId`, `FrameId`, epoch, `StateVector` e transformações, com SI e convenções documentadas. Tipos propostos em `TARGET_CONTRACTS.md` são referências, não API imposta.
2. Criar frames explícitos para sistema solar e corpos locais e um serviço de transformação de posição **e velocidade** com efemérides dependentes de instante, evitando deslocamentos artificiais ou uso implícito de origem.
3. Criar adaptadores para estado local V2, corpos celestes e sondas interplanetárias, preservando IDs, saída física, fronteira de persistência e funcionamento atual dos renderers.
4. Consolidar o acesso a estado cinemático sem alterar guidance, solvers, scheduler, telemetria, UI ou resultado das missões. É permitido conectar pontos selecionados ao adaptador **somente para provar compatibilidade**, mantendo rollback simples.
5. Testar round-trip de transformações, continuidade de r/v em handoff SOI, tempo absoluto, estados inválidos, determinismo e tolerâncias com escalas numéricas realistas.
6. Garantir que nenhuma entidade teletransporte ao mudar de frame, que unidade/velocidade sejam explícitas e que campos de combustível/massa não sejam confundidos com estado gravitacional dos corpos.
7. **Gate M1:** voos locais e interplanetários são expressáveis pelo novo contrato, sem divergência não explicada nas fixtures M0.

## Limites

- Não criar nova engine paralela, não reescrever Lambert/ascensão/guidance, não trocar Canvas/PixiJS, não mudar UX ou modelos de missão.
- Não introduzir múltiplas civilizações, recursos, energia, nova física ou features da próxima fase.
- Evitar refactors não necessários. Adapters primeiro; substituição de pipelines apenas em fases subsequentes.
- Se for necessária alteração incompatível de save, escalar e obter aprovação antes de aplicar. Jamais excluir storage do usuário automaticamente.
- Atualizar docs/systems, arquitetura, checklist, ADR/backlog e status apenas para o que foi realmente implementado.

## Aceite e entrega

- **A1:** M0 congelado com fixtures e resultados reproduzíveis.
- **A2:** M1 implementado como estado/frame comum com adaptadores para corpos, voo local e sonda.
- **A3:** continuação de posição e velocidade nos frames, determinismo e invariantes dentro de tolerâncias mensuradas.
- **A4:** casos locais e interplanetários preservados; ausência de mudança deliberada nos outcomes.
- **A5:** saves V2 e reload testados sem perda ou reset silencioso.
- **A6:** testes, lint, typecheck, build, audit e benchmark locais registrados; smoke humano orientado quando necessário.
- **A7:** `Orbiter Final CI` via `workflow_dispatch` **somente após validação local e smoke**, no HEAD final; sucesso antes do squash merge.
- **A8:** PR revisável, docs As-Built, checklist, relatório e Issue concluídos; **não iniciar Fase 8**.

O executor pode fazer squash merge autonomamente depois dos gates, respeitando branch protection e riscos escaláveis. Não confundir avanço de M0/M1 com conclusão da engine unificada.
