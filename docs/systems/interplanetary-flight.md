# Voo interplanetário — Fase 5B (incremento de planejamento)

**Estado:** módulo de oportunidades implementado isoladamente; não há sonda viajando, transição SOI nem chegada confirmada nesta etapa. Não utilizar o plano como uma trajetória física resolvida.

## Oportunidades preliminares

`src/simulation/interplanetary-planner.ts` oferece `planTransferOpportunity(world, originId, targetId, nowS)` e `rankTransferOpportunities(world, originId, nowS)`. Para planetas distintos no mesmo sistema, calcula duração de Hohmann circular a partir dos semieixos em metros e parâmetro gravitacional solar constante, em SI. Busca alinhamento angular aproximado da posição real do planeta de partida e da posição futura do destino em um ciclo sinódico (128 amostras e 48 refinamentos); calcula delta-v heliocêntrico idealizado para as duas mudanças de velocidade tangenciais. A classificação prioriza erro de fase, delta-v e espera; não incorpora ainda ciência, motor ou limite financeiro.

## Hipóteses e limitações

- As efemérides geradas são excêntricas; o Hohmann circular aproxima apenas a oportunidade, não garante trajetória ou encontro.
- `heliocentricDeltaVMs` soma velocidades heliocêntricas de injeção e circularização; para **flyby** a segunda queima não é necessariamente requerida. O resultado **não** corresponde a custo total de escape do planeta natal.
- O erro angular pequeno não comprova proximidade espacial. Não usar como critério de sucesso.
- Sem transição planetocêntrica-heliocêntrica, propagador de sonda, limites de engenharia ou efeitos gravitacionais de encontro.
- Entradas inválidas de época são rejeitadas; origem/destino inadequados retornam `null`.

## Validação

`tests/interplanetary-planner.test.ts`: determinismo, futuro, finitude de estimativas, rejeição de origens indevidas e imutabilidade do mundo. Os testes de voo causal, chegada física, saves e warp ainda são gates abertos.

## Propagação física experimental (incremento seguinte)

`src/simulation/interplanetary-trajectory.ts` usa `propagateCoast` da mecânica V2 com gravidade solar para calcular posição/velocidade heliocêntricas em tempo absoluto. O estado inicial é derivado da posição e velocidade do planeta na época planejada e de um impulso tangencial aproximado. `evaluateInterplanetaryEncounter` compara as posições reais calculadas da sonda e do planeta ao longo do intervalo de viagem, refinando o mínimo amostrado e reportando distância, tempo e velocidade relativa. Não chama encontro apenas por época prevista.

**Importante:** ainda é um protótipo isolado: a sonda começa idealmente na órbita heliocêntrica do planeta, sem simular escape, queima planetocêntrica, combustível ou SOI; o perfil de impulso não garante intercepção. O detector amostrado não comprova ausência de encontros breves e precisa de testes de precisão antes de uso como autoridade para resultado de missão. A velocidade planetária é calculada por diferença central das efemérides. Não há missão integrada nem resultado estratégico.

`tests/interplanetary-trajectory.test.ts` cobre reprodutibilidade de propagação e medida de separação. Não considerar gates A2–A4 atendidos até integrar à física/estratégia com cenários positivos e negativos verificáveis.
