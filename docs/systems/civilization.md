# Civilização — As-Built (Fase 3)

## Responsabilidade
Uma civilização autônoma por universo, com planeta natal determinístico, recursos, conhecimento, tecnologia, contadores, missões e eventos. Não há múltiplas civilizações, diplomacia ou comando manual de lançamentos.

## Contrato e estado
`src/simulation/civilization.ts`: `Civilization` tem `version:2`, `id:'civilization-0'`, `homeId`, `seed`, `time`, `accruedAt`, `stage`, `knowledge`, `resources`, `nextAt`, `missionSerial`, `missions`, `events`, `successes` e `failures`. `createCivilization(world,time=0)` escolhe entre os planetas da seed com `seededRandom('orbiter:mission:v2:'+seed+':home)`; não modifica a astronomia. O estado é mutável exclusivamente pelo avanço estratégico; a renderização o consulta.

## Economia e comportamento
Começa com 80 recursos, estágio 0 e conhecimento 0. `accrue` calcula minutos simulados inteiros entre marcos de tempo: +18 recursos por dia (teto 300) e +0,45 conhecimento por minuto; arredondamento de seis casas. A preparação debita 70 recursos. A evolução usa `stage` e `knowledge` para parametrizar o veículo ao lançamento, sem alterar planos anteriores. Ver [tecnologia](technology.md), [missões](missions.md) e [scheduler](mission-scheduler.md).

## Interfaces e integração
Exports: `createCivilization`, `advanceCivilization`, `technology`, `serializeCivilization`, `parseCivilization`, constantes `RESOURCE_CAP`, `RESOURCE_INCOME_PER_DAY`, `LAUNCH_RESOURCE_COST`. `src/main.ts` cria/carrega civilização, avança eventos, apresenta painel do programa espacial e salva o estado. O planeta natal permanece o mesmo enquanto a seed não muda.

## Testes e limites
`tests/civilization.test.ts` verifica determinismo, estado inicial, evolução, custo de lançamentos, orçamento de eventos, histórico limitado, recarga e integridade da seed. `tests/space-program-evolution.test.ts` cobre progressão autônoma. Não há cadeia de produção, economia entre planetas, civilizações concorrentes nem simulação de acumulação offline. Registro estratégico V2: [persistência estratégica](strategic-persistence.md).
