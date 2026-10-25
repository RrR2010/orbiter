# Fase 3 — Primeira Era Espacial

**Status:** AUTORIZADA para implementação autônoma, **sem iniciar Fase 4**.
**Dependência:** Fase 2 integrada na main (PR #4 + follow-up #5).
**Missão de produto:** o primeiro programa espacial autônomo surge em um planeta habitável e começa uma história tecnológica observável, com consequências e fracassos reais dentro do modelo.

## Resultado para o observador

Sem interagir, o usuário acompanha uma civilização que pesquisa, prepara e executa primeiros lançamentos, coloca satélites em órbita e aprende com sucessos e falhas. Pode selecionar naves/satélites, seguir uma missão e ler o que aconteceu. Ao fechar e reabrir, o progresso da civilização é preservado.

## Limites deliberados

- Exatamente **uma civilização inicial**, associada a um único planeta do sistema; determinística e estável por seed.
- Desenvolvimento tecnológico compacto em estágios (astronomia, foguetes, lançamento orbital, satélites). Nada de árvore de dezenas de tecnologias.
- Recursos estratégicos abstratos e rastreáveis (ex.: orçamento industrial, conhecimento, capacidade de lançamento), não economia completa.
- Naves/lançamentos visualmente simples; física híbrida. Se trajetória for aproximada, a interface distingue explicitamente animação representacional de propagação física. Não alegar mecânica orbital que não existe.
- Nenhuma colonização, múltiplas civilizações, missões interplanetárias, diplomacia, mineração ou IA generativa.
- Preservar todos os recursos da Fase 2 e a estética visual sóbria.

## Entregas obrigatórias

### 1. Entidade de civilização e estado estratégico

Criar estado tipado com ID, planeta de origem, era/tecnologias, conhecimento, recursos disponíveis, pesquisas e missões. Associar à seed existente sem alterar identificadores/órbitas dos sistemas antigos. Desenvolver progressão autonomamente com pré-requisitos e custos rastreáveis, sem depender de clique do usuário.

### 2. Relógio estratégico e scheduler determinístico

**Pré-requisito arquitetural obrigatório:** resolver a dependência do andamento estratégico em FPS e o frame clamp da Fase 1. Introduzir separação explícita entre tempo de simulação, cadência de render e eventos agendados. Avanços em warp alto devem processar todos os eventos relevantes em ordem estável, respeitando limites de processamento e evitando congelar a página. Queda de FPS não pode descartar acontecimentos estratégicos em silêncio. Se necessário, oferecer cap de trabalho por frame e backlog de simulação, preservando determinismo. Testar delta partitioning e diferentes warps. Documentar a política de pausa/inatividade/offline.

### 3. Pesquisa e primeiras missões

Criar pipeline de programa espacial: descoberta -> preparação -> lançamento -> sucesso/falha -> consequências. Cada missão possui ID, tipo, origem, alvo, início, estado, resultado e eventual veículo/satélite persistente. Falhas plausíveis a partir de probabilidade determinística, influenciada por tecnologia/confiabilidade. Não usar um sorteio livre a cada frame.

### 4. Observabilidade de curto prazo

Ao menos um pequeno evento observável por missão (ex.: ignição, subida, inserção orbital ou perda de veículo), com representação vetorial compatível com Canvas 2D e a arquitetura de câmera. O usuário consegue distinguir veículo em missão, satélite ativo e falha. Em warp muito alto, eventos curtos não podem desaparecer sem registro: congelar/destacar brevemente no tempo visual, oferecer follow ou indicador de evento. Evitar flash excessivo.

### 5. Inspetor e histórico mínimo

Extender o observatório com entidade civilização/missões/satélites quando aplicável: estado tecnológico, missão atual, desfechos e primeiras conquistas. Pequeno feed de eventos relevantes com tempo simulado e ligação causal, usando o mesmo vocabulário do mundo. Histórico deve ser factual (derivado do estado e eventos), não textos aleatórios apresentados como acontecimentos.

### 6. Persistência versionada e compatibilidade

Saves da Fase 1 e 2 continuam abrindo. Adicionar schema/versionamento para evolução estratégica, agenda e IDs de eventos, com migração/default seguro. Quando não houver save estratégico, inicializar de maneira determinística compatível com a seed e o tempo atual; não reescrever silenciosamente a história passada como se tivesse ocorrido. Garantir reload sem missão duplicada, perda de progresso ou alteração de resultado.

### 7. Performance e limites de longa duração

Reservar cap explícito para entidades individuais e tamanho de log; política determinística de arquivamento/agregação, quando necessária. Medir ou estimar com benchmark reproduzível o custo de simular cenários representativos. Não permitir progressão infinita descontrolada nesta fase; ao chegar ao limite tecnológico, a civilização estabiliza e mantém atividade sustentável.

### 8. Qualidade e documentação

Testar scheduler, progressão, pré-requisitos, lançamentos, sucesso/falha determinísticos, save/load/migração, idempotência e ausência de regressões em seleção, câmera, warp, zoom, UI. Atualizar ADRs e backlog. Roteiro de smoke test humano sem exigir conhecimento técnico.

## Gates de aceite

- **A1:** a mesma seed + estado inicial + ações/tempo resulta no mesmo progresso e mesmos eventos, independentemente do FPS/partição temporal.
- **A2:** uma civilização inicial pesquisa e chega de forma autônoma ao primeiro lançamento e à primeira operação orbital em cenários de teste.
- **A3:** ao menos um caso de sucesso e um de falha, cada um com efeitos persistentes e registro factual; resultados não dependem da renderização.
- **A4:** missão, satélite e progresso podem ser inspecionados; há acontecimentos visuais identificáveis em segundos/minutos reais sob velocidade de demonstração apropriada.
- **A5:** warp alto, pausa, foco/follow, zoom e modo ambiente continuam funcionais; scheduler não omite eventos nem produz duplicatas.
- **A6:** saves antigos continuam íntegros e saves novos retomam agenda, recursos e eventos sem divergência.
- **A7:** benchmark ou ensaio reproduzível para simulação longa sem explosão de eventos, degradação evidente ou crescimento ilimitado não documentado.
- **A8:** `npm ci`, `npm run validate` e `npm audit` **locais** aprovados, smoke tests executados, revisão do PR concluída. Somente então disparar **uma execução manual** do GitHub Actions no HEAD final e conferir sucesso antes de merge. Se falhar, corrigir localmente e usar uma nova execução final justificada.
- **A9:** nenhum recurso fora de escopo entrou; handoff/issue/status/ADRs/backlog atualizados; merge squash autônomo após gates.

## Demonstração humana

1. Abrir sistema salvo na Fase 2 e confirmar que foco, zoom, camadas e velocidade continuam funcionando.
2. Encontrar a civilização inicial e observar sua pesquisa e recursos.
3. Usar velocidade de demonstração adequada até um lançamento, acompanhar a animação e seu resultado.
4. Selecionar um satélite ou registro de missão e consultar o histórico.
5. Recarregar e confirmar que a civilização continua do mesmo ponto, sem repetir eventos já resolvidos.
6. Acelerar e observar progresso coerente sem sumiço de eventos importantes.

## Implementação autônoma

Agente decide design interno (event queue, estado, persistence e visual), cria testes e corrige problemas da fase. Preserve fronteiras da arquitetura original. Não perguntar ao humano sobre técnicas; solicitar observação funcional somente quando necessária. Escalar novas dependências fora de escopo, problemas de migração sem segurança ou mudança de objetivo do produto. Fazer merge autônomo apenas após os gates. Parar ao finalizar.
