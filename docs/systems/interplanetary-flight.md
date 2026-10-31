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

## Transferência contínua experimental (incremento 5B)

`src/simulation/interplanetary-continuous-transfer.ts` conecta a injeção impulsiva ideal de órbita de estacionamento, a propagação hiperbólica planetocêntrica até a SOI, o handoff de posição/velocidade e o coast heliocêntrico até o tempo previsto de chegada. A massa e combustível atravessam o handoff sem alteração, e o resultado reporta distância real ao destino em amostras fixas da viagem, sem declarar encontro ou sucesso. `tests/interplanetary-continuous-transfer.test.ts` verifica conservação de estado, tempo absoluto e falta de propelente. **Não há ainda lançamento físico da superfície, otimização do vetor de injeção para o destino, prova robusta da distância mínima ou integração à civilização.** A distância mínima amostrada pode perder uma aproximação estreita; a etapa permanece experimental.

## Refinamento geométrico de aproximação (incremento 5B)

A transferência contínua agora informa `closestTimeS` e refina a menor distância encontrada na vizinhança da melhor amostra por busca ternária determinística. O refinamento não modifica a trajetória nem decide sucesso; reduz erro de discretização local, mas ainda não prova que não existe outro mínimo mais estreito entre amostras. Testes verificam intervalo temporal e distância mínima não maior que a da chegada. É obrigatório encontrar um caso de flyby positivo e um miss reproduzível antes da integração ao scheduler.

## Referência de encontro e miss (teste adicional, pendente de execução local)

`tests/interplanetary-reference-encounter.test.ts` cria duas órbitas circulares sintéticas no mesmo plano, uma com fase de Hohmann adequada e outra deslocada em 0,6 radiano. Verifica proximidade física dentro do raio do planeta no primeiro cenário e miss distante no segundo, a partir de propagação heliocêntrica de dois corpos. **Este é um teste isolado do motor heliocêntrico**, não demonstra ainda o encontro após escape da superfície/SOI em um sistema procedural. Esse gate integrado permanece aberto.

## Telemetria geométrica do encontro (incremento 5B)

`simulateContinuousTransfer` também retorna `closestAltitudeM` (distância mínima ao centro menos raio físico do destino) e `closestRelativeSpeedMs`, derivada da velocidade heliocêntrica da sonda menos a velocidade inferida das efemérides do destino no instante da aproximação. São dados do cenário físico propagado, não previsões de sucesso. Altitude negativa indica interseção geométrica com o corpo **sem simulação de impacto/captura**; não classificá-la automaticamente como sobrevôo científico. O teste correspondente verifica finitude, consistência da altitude e determinismo. O primeiro flyby positivo após handoff e o miss integrado continuam gates abertos.

## Classificação geométrica preliminar (incremento 5B)

`src/simulation/interplanetary-approach.ts` distingue `flyby`, `impact-risk` e `distant-miss` a partir da distância e altitude mínima **já calculadas na trajetória propagada**. O limite operacional de reconhecimento é 10 raios planetários; distância menor ou igual ao raio representa risco de impacto, não sobrevoo científico. Valida consistência da geometria e velocidade relativa. `tests/interplanetary-approach.test.ts` cobre fronteiras e estados inválidos com geometrias sintéticas. A classificação ainda não é transmitida nem persistida no scheduler e não comprova o flyby positivo após handoff; não interpretar `flyby` como ciência automaticamente recebida.

## Comunicação causal de ciência (incremento 5C, contrato isolado)

`src/simulation/interplanetary-communications.ts` estima o tempo de propagação de uma observação do ponto heliocêntrico da sonda até o planeta de origem, à velocidade da luz, considerando a movimentação orbital do receptor por iteração determinística limitada. A estrutura `ScienceTransmission` separa `observationAtS` de `receivedAtS` e informa distância e latência. `tests/interplanetary-communications.test.ts` verifica recepção futura, posição móvel do receptor, consistência geométrica e entradas inválidas. **Este contrato não agenda ainda eventos no scheduler nem atualiza conhecimento**; transmissões não possuem ainda potência de rádio, obstrução solar, falha de antena ou perda de sinal. A coleta e aplicação de observações científicas precisam depender de um evento real de recepção antes de conceder conhecimento à civilização.

## Entrega de ciência após recepção (incremento 5C, isolado)

`src/simulation/interplanetary-science-delivery.ts` aplica uma observação de gravidade somente quando `nowS >= receivedAtS` da transmissão associada; antes disso retorna exatamente o registro científico anterior. Falha declarada de transmissão (`transmitted=false`) não transmite conhecimento. Na recepção usa `receiveGravityObservation`, que deduplica pelo identificador da observação, sem aprendizado repetido ao reproduzir eventos. Rejeita alvo incompatível e épocas inválidas. `tests/interplanetary-science-delivery.test.ts` cobre atraso, atualização, idempotência, falha e incompatibilidade. **Ainda não foi implementada integração ao scheduler, criação de observação a partir de flyby físico ou transmissão persistida entre saves.**

## Inbox de recepção científica (incremento 5C, isolado)

`src/simulation/interplanetary-science-inbox.ts` contém uma fila JSON de transmissões ainda não recebidas. `enqueueScience` ordena por instante de recepção e identificador, impede duplicação e limita o tamanho da fila a 128; `drainScience` só assimila observações quando o relógio alcança a recepção, conserva transmissões futuras e devolve os IDs efetivamente recebidos. Testes verificam serialização JSON, time warp em partições, ordem e idempotência. **Ainda é um contrato separado: a fila não é armazenada automaticamente por `Civilization` ou pelo parser V2, tampouco consumida no scheduler de eventos.** A persistência estratégica real e o replay determinístico das missões permanecem pendentes.

## Persistência da inbox no save V2 (incremento 5C)

`Civilization.scienceInbox` guarda a fila JSON de observações pendentes, inicializada vazia e serializada junto ao estado estratégico. `parseCivilization` migra saves V2 anteriores sem o campo, criando uma inbox vazia sem conceder observações retroativas; entradas existentes são validadas quanto a alvos, origem, tempos, medição, ordenação, duplicatas e sinais já recebidos. `tests/interplanetary-science-persistence.test.ts` cobre roundtrip, migração e rejeição de inbox adulterada. **O scheduler ainda não drena a inbox automaticamente e não existe criação integrada de missões interplanetárias.** Saves inválidos continuam sujeitos ao comportamento legado de reinicialização estratégica do parser V2.

## Política de save durante a Fase 5 (decisão do PO de 2026-10-30)

O PO dispensou compatibilidade com saves antigos pré-release. A implementação atual ainda contém caminhos de migração V2 por histórico incremental, mas eles **não são mais requisitos** e podem ser removidos em refatorações posteriores; campos novos podem exigir um save limpo. Permanecem obrigatórios validação do formato atual, persistência causal de observações recebidas/pendentes e determinismo no replay. Ver ADR-0017.

## Integração de recepção ao scheduler (incremento 5C; validação local pendente)

`advanceCivilization` compara o próximo evento estratégico com a recepção mais próxima na `scienceInbox` e avança para o primeiro evento vencido; o processamento de ciência ocorre antes de qualquer evento estratégico simultâneo. `drainScience` atualiza o registro apenas quando a recepção realmente ocorre, remove sinais entregues e escreve no histórico o recebimento, sem alterar as decisões de lançamento local. A interrupção por orçamento de eventos conserva a dívida temporal, inclusive recepções pendentes. `tests/interplanetary-scheduler-reception.test.ts` cobre recepção futura, múltiplas partições de warp, recarga intermediária e não duplicação. **Ainda não há emissão a partir de missões reais nem encontro integrado**; a integração observa somente itens já enfileirados.

## Preparação de observação a partir de aproximação (incremento 5C)

`scienceFromPhysicalFlyby` aceita uma transferência propagada e exige classificação geométrica `flyby` (altitude positiva, até dez raios). Uma medição gravitacional com erro instrumental determinístico por seed/missionId é preparada e um sinal é emitido da **posição heliocêntrica da sonda no instante da maior aproximação**; o resultado é apenas `PendingScience`, sem alterar a estimativa científica. `tests/interplanetary-observation.test.ts` cobre a conversão com geometria controlada, casos miss/impacto e assimilação somente após recepção. **Os testes de observação usam estado/geométricas controlados; não provam ainda uma missão integrada com flyby produzido pelo planejador.** A gravidade inferida por sensor é um modelo aproximado de instrumento, ainda não uma estimação dinâmica de deflexão real. Scheduler ainda não gera automaticamente missões e observações.

## Avaliação física de sonda e entrega à inbox (incremento 5C)

`src/simulation/interplanetary-probe.ts` adiciona `evaluateProbeMission`, que encadeia a propagação de injeção ideal, escape SOI, coast solar, geometria de aproximação e observação científica opcional. Uma transmissão só é produzida se a geometria indicar flyby positivo; `queueProbeScience` só enfileira esse resultado sem assimilar conhecimento imediatamente. `tests/interplanetary-probe.test.ts` confirma consistência da avaliação e ausência de ciência para fuga sem propelente. **Ainda não é uma missão agendada automaticamente nem prova um flyby positivo em seed procedural.** A etapa seguinte exige parametrização física da direção de injeção e teste de interceptação integrado.
