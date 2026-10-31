# Discovery funcional aprovado — Fase 5

**Data:** 2026-10-29  
**Issue:** #10  
**Estado:** **A1 aprovado pelo PO** após escolha explícita da alternativa **B — Primeira era de exploração**. Este documento fixa a experiência; implementação e demais gates permanecem pendentes.

## Escolhas confirmadas pelo PO

- **Ritmo:** progresso gradual, com tecnologias e marcos evoluindo organicamente.
- **Destino:** seleção autônoma pela melhor oportunidade, considerando dificuldade e capacidade.
- **Primeiro perfil:** sonda robótica de sobrevoo científico (flyby).
- **Destaques:** cinematográficos opcionais e modo ambiente não intrusivo.
- **Falhas:** risco físico real, compreensível, rastreável e persistido.
- **Aspiração de fidelidade:** influência de janelas de transferência, massa, combustível/delta-v, motores, conhecimento científico, gravidade, atmosfera, captura e escape.
- **Aprendizado:** civilização possui estimativas incompletas sobre corpos; resultados de sondas e erros refinam conhecimento usado em missões futuras.
- **História:** sequência causal persistente de marcos, descobertas, sucessos e falhas; diário de exploração desejado.
- **Divisão:** PO aceita considerar etapas internas na Fase 5 para estabelecer suportes necessários.

## Princípios funcionais aprovados

1. Separar parâmetros físicos reais de estimativas/intervalos conhecidos pela civilização; decisões usam informações disponíveis na época.
2. Incerteza e variação são reproduzíveis por seed, IDs e tempo; nunca usar aleatoriedade de render ou FPS.
3. Introduzir primeiro capacidade heliocêntrica 2D, janelas, delta-v e flyby causal; não fingir captura atmosférica ou orbital.
4. Aprendizado científico deriva de observações realizadas e altera oportunidades futuras; não conceder conhecimento por falhas que não geraram dados.
5. Diário registra fatos verdadeiros, preserva eventos de maior importância e separa intenção de resultado.
6. Manter arquitetura e compatibilidade com saves V2 da Fase 4; mudanças de schema exigem migração segura.
7. Limitar frequência de lançamentos/eventos para conservar modo ambiente e desempenho.

## Etapas internas autorizadas dentro da Fase 5

- **5A — Conhecimento e capacidade:** estimativas planetárias, incerteza, pesquisa aplicada e envelopes de veículo/delta-v.
- **5B — Navegação interplanetária:** janelas, trajetórias heliocêntricas, saída local, encontros físicos.
- **5C — Ciência e aprendizado:** flyby, risco, coleta de observações, histórico causal e segunda decisão informada por descoberta.
- **5D — Experiência visual e narrativa:** UI, rotas, acompanhamento, notificações, diário de exploração, smoke.

## Limites vigentes do brief

Uma civilização e um sistema, sondas flyby, física determinística 2D, sem colônias, economia nova, N-corpos global, 3D ou implantação antecipada da Fase 6. Orbiter permanece um ecossistema autônomo de observação, não um simulador de pilotagem manual.

## Decisões complementares delegadas pelo PO e consolidadas

1. **Conhecimento antes da visita:** efemérides e distâncias podem ser estimadas por astronomia; parâmetros gravitacionais de outros corpos têm uma estimativa inicial e incerteza significativa, melhoráveis por observação e sobrevôo. Não revelar parâmetros exatos do motor como conhecimento da civilização. Atmosfera pode constar no catálogo como desconhecida, mas não influencia fisicamente flybys desta fase.
2. **Ciência e comunicação:** conhecimento científico só é incorporado depois de um evento verificável de aquisição de dados e transmissão/recepção. Falha depois de transmitir pode render ciência parcial; destruição sem transmissão não concede descoberta. O planner usa o conhecimento disponível na época do plano e resultados já recebidos.
3. **Propulsão e orçamento:** modelar massa, combustível, empuxo, impulso específico, delta-v disponível e requerido (com margens) e limitações de precisão; o planner escolhe autonomamente dentre capacidades pequenas e auditáveis. Não implementar editor de foguetes, árvore completa de motores nem engenharia detalhada de estágios.
4. **Transferência:** aproximação 2D determinística com janelas e trajetória heliocêntrica causal, saída do referencial local e critério físico de proximidade; planejado versus realizado claramente identificados. Sobrevoo físico é o sucesso mínimo. Não falsificar intercepção com animação.
5. **Risco e recuperação:** erros e incertezas reproduzíveis por seed/identidade/contexto, não amostrados por frame ou recarga. Distinguir miss distante, flyby científico parcial/completo e falha técnica; registrar causas, impacto estratégico e oportunidade de aprendizado.
6. **Diário histórico básico:** marcos persistentes e limitados, derivados de eventos reais; exibir descoberta, primeira missão, lançamento, aproximação, resultado e influência da ciência futura. Não antecipar diretor narrativo complexo da Fase 6.
7. **Destaque visual:** modo cinematográfico **opt-in** para lançamento/encontro, com acesso por alerta discreto; sem roubar foco ou impor warp; pausa e acompanhamento respeitam a preferência do observador.
8. **Fronteira:** captura orbital, aerofrenagem, atmosfera dinâmica, pouso e múltiplas gerações de motores ficam **fora do escopo de implementação**. Estruturas extensíveis podem ser criadas apenas quando necessárias e compatíveis. Registrar ideias futuras no backlog, sem iniciá-las.

## Critérios funcionais demonstráveis

- Uma sonda alcança proximidade física de planeta distinto, em uma janela válida, com estados/telemetria verificáveis e transição de referencial documentada.
- Um cenário determinístico de erro/falha ou passagem distante preserva motivo, trajetória real e consequência.
- Evidência de aprendizado: estimativa de ao menos um parâmetro muda após dados recebidos e informa planejamento posterior; falha sem comunicação não concede conhecimento.
- Planner não emite sondas sem limite nem finge recursos; missão possui delta-v e capacidade rastreáveis.
- O diário apresenta marcos reais, sem duplicá-los após save/load ou warp; HUD distingue destino, trajetória planejada, posição atual e resultado.
- Seeds/tempo particionado/saves V2 antigos e novos, inclusive componentes da Fase 4, preservados por testes.
- Smoke humano e validações locais precedem CI manual; merge apenas quando gates A2–A9 forem verificáveis.

## Governança

Este acordo não modifica o brief base nem autoriza a Fase 6. Caso seja necessária ampliação funcional relevante para além do flyby com aprendizado limitado, escalar antes de fazê-la. 

## Extensão de navegação — checkpoints e controle condicionado à tecnologia (2026-10-31)

O PO aprovou a ideia de que a execução de uma manobra não precisa reproduzir perfeitamente a trajetória nominal; a missão pode observar a diferença prevista × realizada e executar correções em checkpoints. Esse refinamento complementa a decisão por Lambert da ADR-0018 e segue a ADR-0019.

- **MVP Fase 5:** sonda robótica com programa inicial e, apenas quando necessário ao gate de flyby, até uma correção intermediária fisicamente contabilizada. Pode existir missão sem correção por limite de combustível, desconhecimento ou comunicação.
- **Tecnologia futura:** evolução de autonomia embarcada, alcance do comunicador, latência, qualidade de sensores, resolução de orientação/empuxo e precisão do estimador; sem alterar artificialmente a precisão do motor de física.
- **Modos futuros:** sem enlace, executar apenas plano embarcado/autonomia instalada; com enlace, correções comandadas após telemetria/atraso; tripulada, decisões locais contínuas limitadas pelos recursos. Tripuladas, manobras de captura e rendezvous permanecem fora do escopo desta fase.
- **Observabilidade:** HUD e histórico deverão distinguir órbita/rota prevista antes da manobra, nova previsão, manobra programada, resultado medido e Δv restante, sem mostrar informação verdadeira como se a civilização a conhecesse.
- **Aceite adicional se implementada correção:** nenhum teleporte; consumir combustível; erros determinísticos; enlace/latência respeitados; save/load e warp não executam duas vezes o mesmo checkpoint.
