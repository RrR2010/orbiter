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

## Novos testes de integridade orbital (5B)

O incremento de testes mede conservação aproximada de energia específica e momento angular sob gravidade solar, compara propagação em um único intervalo com duas partições e verifica que `withinTargetRadius` corresponde exclusivamente à distância física mínima versus raio do destino. Tolerâncias relativas de 1e-6 são usadas para estados numéricos. Estes testes são necessários, mas ainda não suficientes para comprovar encontro científico ou evitar falsos negativos do detector amostrado. `tests/interplanetary-trajectory.test.ts`.

## Estimativa preliminar de orçamento de partida (incremento 5B)

`src/simulation/interplanetary-budget.ts` estima o delta-v de inserção em órbita de estacionamento e o incremento de escape planetário até uma velocidade de excesso hiperbólico associada à transferência circular. Usa gravidade planetária V2, órbita de estacionamento heurística e reserva configurável; compara a soma com o delta-v ideal `VehicleCapability.deltaVMs`. `feasible` indica **somente viabilidade de orçamento ideal aproximado**, não sucesso do voo nem autorização para produzir eventos históricos. Não há integração com planner estratégico/scheduler, nem contabilização física de queima/combustível. Despreza arrasto, gravity losses detalhadas, inclinação e geometria real de escape. Flyby não exige circularização no destino. Testes em `tests/interplanetary-budget.test.ts`.

## Seleção por capacidade e incerteza (incremento 5B)

`src/simulation/interplanetary-selection.ts` implementa seleção pura: requer tecnologia no estágio 4 e memória científica presente, avalia oportunidades segundo delta-v ideal disponível do veículo, e classifica candidatas viáveis por esforço, tempo de espera, erro de fase e incerteza gravitacional da estimativa científica. Retorna `null` caso nenhuma candidata supere o orçamento ideal. Não cria missão, não agenda lançamentos nem reserva recursos. A pontuação é heurística e o campo `feasible` continua indicando **apenas** orçamento estimado, não encontro demonstrado. Testes em `tests/interplanetary-selection.test.ts`.

## Intenção de agenda sem efeito colateral (incremento 5B)

`src/simulation/interplanetary-schedule.ts` acrescenta `proposeInterplanetaryLaunch`, que só propõe uma janela futura se há estágio tecnológico 4, recursos suficientes, nenhuma missão local ativa, antecedência mínima para preparação e espera limitada. Esta função **não** altera `Civilization.nextAt`, missões ou scheduler: é uma pré-condição testável para a futura integração causal, não um lançamento disponível ao observador. A seleção retorna nulo quando não existe orçamento viável. `tests/interplanetary-schedule.test.ts` verifica ausência de efeitos colaterais e limites. Antes de ligar ao scheduler, devem ser entregues escape físico, transmissão/encounter e testes de persistência/warp.

## Handoff de referencial SOI (incremento 5B)

`src/simulation/interplanetary-handoff.ts` define o raio de esfera de influência de Laplace aproximado `a (mu_planeta/mu_sol)^(2/5)` e transforma um estado planetocêntrico inercial **já na borda ou além da SOI** em coordenadas heliocêntricas somando posição e velocidade do planeta obtidas de efemérides determinísticas. Massa, combustível e tempo não mudam. Estados ainda internos à SOI são rejeitados. `tests/interplanetary-handoff.test.ts` verifica transformação, determinismo e pré-condição de cruzamento. **Não há ainda propagação de escape até a SOI nem integração do handoff ao voo/missão; este módulo não autoriza salto físico para a borda.**

## Escape planetocêntrico experimental (incremento 5B)

`src/simulation/interplanetary-escape.ts` implementa `propagatePlanetaryEscape(world, planetId, initial, maxDurationS)`: exige estado inicial fora da superfície e dentro da SOI, velocidade radial positiva e energia específica positiva (hipérbole). Propaga analiticamente com o contrato V2 `propagateCoast`, busca a primeira passagem para além da SOI por dobramento temporal limitado e refina o cruzamento com 56 iterações de bisseção. Só após alcançar fisicamente a fronteira chama `handoffToHeliocentric`; preserva instante, massa e combustível. Retorna `null` se o estado não for hiperbólico externo ou não alcançar a fronteira até o limite de tempo. Os testes em `tests/interplanetary-escape.test.ts` cobrem cruzamento, estados inválidos e orçamento temporal.

**Limites atuais:** o estado inicial precisa já estar em escape, fornecido externamente; não foi implementada queima real de injeção, escolha de direção, perdas ou conexão com o lançamento V2. A trajetória ainda não está ligada ao scheduler, missões, HUD nem produção de observações científicas. Não declarar missão interplanetária concluída.

### Correção de convergência no escape (checkpoint pendente)

Quando o solver universal do coast não converge em um intervalo hiperbólico longo, o detector de SOI tenta subdivisões determinísticas sucessivas (até 1024 segmentos iguais), preservando a propagação dinâmica e sem antecipar a borda. Falhas que não sejam do solver permanecem explícitas; esgotar o limite gera erro diagnóstico. A regressão `tests/interplanetary-escape.test.ts` originou esta correção. O comportamento e custo ainda precisam de validação local, sobretudo em seeds extremas.

## Injeção de escape idealizada (incremento 5B; aguardando validação)

`src/simulation/interplanetary-injection.ts` calcula a velocidade hiperbólica de partida em órbita de estacionamento e aplica a equação de Tsiolkovsky para descontar propelente e massa de um impulso ideal. O resultado pode ser passado a `propagatePlanetaryEscape`, que agora aceita velocidade radial inicial igual a zero no periastro hiperbólico (injeção tangencial), sem exigir um movimento radial artificial. `tests/interplanetary-injection.test.ts` verifica consumo, conservação de massa, insuficiência de combustível e tentativa de cruzamento real da SOI. **Esta função pressupõe que a órbita de estacionamento já foi atingida**: não modela ascensão, gasto prévio de combustível para inserção orbital, duração de queima ou orientação calibrada para a transferência solar. O teste integrado ainda não comprova encontro no planeta de destino; não ligar ao scheduler até resolver esses contratos e o orçamento global de lançamento.
