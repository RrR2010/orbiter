# Discovery funcional — Fase 5 (em elaboração)

**Data:** 2026-10-29  
**Issue:** #10  
**Estado:** escolhas iniciais confirmadas pelo PO; decisões complementares ainda em aberto. **Não iniciar implementação principal antes do acordo final.**

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

## Princípios propostos (aguardam validação complementar)

1. Separar parâmetros físicos reais de estimativas/intervalos conhecidos pela civilização; decisões usam informações disponíveis na época.
2. Incerteza e variação são reproduzíveis por seed, IDs e tempo; nunca usar aleatoriedade de render ou FPS.
3. Introduzir primeiro capacidade heliocêntrica 2D, janelas, delta-v e flyby causal; não fingir captura atmosférica ou orbital.
4. Aprendizado científico deriva de observações realizadas e altera oportunidades futuras; não conceder conhecimento por falhas que não geraram dados.
5. Diário registra fatos verdadeiros, preserva eventos de maior importância e separa intenção de resultado.
6. Manter arquitetura e compatibilidade com saves V2 da Fase 4; mudanças de schema exigem migração segura.
7. Limitar frequência de lançamentos/eventos para conservar modo ambiente e desempenho.

## Proposta de etapas internas (ainda não equivale a expansão aprovada)

- **5A — Conhecimento e capacidade:** estimativas planetárias, incerteza, pesquisa aplicada e envelopes de veículo/delta-v.
- **5B — Navegação interplanetária:** janelas, trajetórias heliocêntricas, saída local, encontros físicos.
- **5C — Ciência e aprendizado:** flyby, risco, coleta de observações, histórico causal e segunda decisão informada por descoberta.
- **5D — Experiência visual e narrativa:** UI, rotas, acompanhamento, notificações, diário de exploração, smoke.

## Limites vigentes do brief

Uma civilização e um sistema, sondas flyby, física determinística 2D, sem colônias, economia nova, N-corpos global, 3D ou implantação antecipada da Fase 6. Orbiter permanece um ecossistema autônomo de observação, não um simulador de pilotagem manual.

## Pendências para fechar acordo A1

- Intensidade da descoberta: parâmetros por corpo e grau de incerteza inicial.
- Como uma missão falhada devolve dados: somente com medições e comunicação verificáveis.
- Modelo de evolução de engenharia: diversidade inicial simplificada versus famílias amplas de motores.
- Escala e frequência do diário/história e opção cinematográfica.
- Fronteira de captura orbital, atmosferas e aterrissagem nesta fase (proposta: contratos preparatórios, implementação futura).
- Concordância do PO quanto ao limite de escopo e gates originais da Fase 5.
