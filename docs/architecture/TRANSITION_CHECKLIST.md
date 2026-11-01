# Checklist de transição para engine composável

**Uso:** checklist vivo, baseline inicialmente **NÃO VERIFICADO**. Auditoria transforma itens em diagnóstico com evidência (arquivo/teste), classifica cada um: existente/reutilizável, parcial/refatorar, ausente/criar, descartar. Não marcar como entregue sem integração e testes. Link à [visão-alvo](TARGET_VISION.md).

## A. Compreender o estado atual

- [ ] Mapear módulos de voo local e interplanetário, com dependências e pontos de duplicação.
- [ ] Inventariar estados, unidades, referenciais, transformações e algoritmos existentes.
- [ ] Mapear contratos atuais de missão/veículo, solvers, scheduler, knowledge, comunicação e persistência.
- [ ] Inventariar inspector, HUD, seleção, câmera, trilhas e renderers separados.
- [ ] Mapear suites de teste, seeds de referência, limites de benchmark e compatibilidade dos saves.
- [ ] Medir custo real em navegador (FPS, render, memória) antes de propor troca de renderer.

## B. Contratos universais

- [ ] Estado cinemático e referenciais estáveis, incluindo corpos e veículos.
- [ ] Serviço comum de efemérides/estado no tempo e transformações de referencial.
- [ ] Análise orbital comum AP/PE/energia/elementos com corpo e referencial explícitos.
- [ ] Propagação/coast e integração finita com massa/energia/consumo e testes de continuidade.
- [ ] Interface de solver de manobra e execução de burn separadas.
- [ ] Objetivos de operações reusáveis, condições, falhas e composição de planos.
- [ ] Política de autonomia (fixo, condicional, intenção, deliberativo) independente da física.
- [ ] Modelo de veículos e componentes (energia, integridade, comunicações, ciência).
- [ ] Conhecimento por civilização separado de World Truth, estimativas/incertezas.
- [ ] Suporte multi-civilização sem singletons e com propriedade de missões/ativos.

## C. Observação e produto

- [ ] Seleção/câmera/follow/inspector aplicáveis a qualquer entidade relevante.
- [ ] Trajetórias previstas, planejadas, osculantes e percorridas claramente diferenciadas.
- [ ] HUD/telemetria compartilhada por provedor de dados, com N/D onde necessário.
- [ ] Missões e conquistas observáveis por feed, diretor de eventos e eventualmente PiP.
- [ ] Warp com presets ajustados, suavização de apresentação e segurança do scheduler.
- [ ] Sprites/efeitos/áudio desacoplados da física.

## D. Migração e verificação

- [ ] Preservar fixtures de referência: voo local, circularização, impacto, escape, flyby, correção, ciência, comunicação e reload.
- [ ] Implementar adaptadores e substituir um pipeline por vez, sem big-bang rewrite.
- [ ] Validar invariantes e tolerâncias numéricas, determinismo e tempo particionado.
- [ ] Definir política segura de migração de saves antes de modificar formato.
- [ ] Demonstrar local e interplanetário pelo mesmo executor de operações.
- [ ] Remover duplicações somente após migração e regressões aprovadas.
- [ ] Atualizar As-Built, ADRs, design, status e testes no mesmo PR.

## E. Avaliação de tecnologia

- [ ] Separar decisão de engine física da de renderização.
- [ ] Avaliar manter Canvas vs PixiJS vs Phaser vs Godot, com protótipo/bench se houver benefício e custo claro.
- [ ] Avaliar bibliotecas numéricas/astrodinâmicas JS/TS ou WASM, solvers e licenças/manutenção.
- [ ] Avaliar Python apenas para referência numérica, não como runtime sem justificativa.
- [ ] Definir critério e ponto de decisão para possível migração gráfica, sem misturá-la ao refactor físico.
- [ ] Registrar decisão com matriz evidenciada, riscos de lock-in, desempenho e custo de integração.

## Regra de gate

A auditoria entrega evidências, prioridades, dependências e propostas — **não deve marcar como implementado itens da arquitetura futura**. Cada fase posterior adota subconjunto explícito com testes e compatibilidade.
