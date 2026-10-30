# Conhecimento científico — contrato inicial Fase 5A

**Estado:** módulo inicial em desenvolvimento, ainda não integrado ao scheduler, persistência estratégica nem voo. Este documento não afirma uma experiência de exploração já funcional.

## Responsabilidade

`src/simulation/scientific-knowledge.ts` separa estimativas da civilização do estado físico de `World`. `initialScientificRecord(world)` cria um valor inicial reproduzível por planeta, com incerteza elevada. `receiveGravityObservation(state, observation)` exige sinal de transmissão, valida campos, recebe evento por ID uma única vez e atualiza a estimativa por precisão ponderada; o histórico de IDs impede duplicação após replay/save.

**Limite provisório importante:** o valor inicial de gravidade é uma escala relativa ilustrativa sem unidade SI ou conexão com a gravidade real. Não deve orientar manobras até o contrato de gravidade física do motor interplanetário estar conectado. Os eventos científicos ainda são passados diretamente ao módulo; o fluxo aquisição/telemetria/transmissão não foi implementado.

## Testes

`tests/scientific-knowledge.test.ts` contém determinismo, imutabilidade de `World`, ausência de aprendizado antes da transmissão, idempotência e validação de medidas. Testes ainda dependem de execução local.

## Próximos passos de integração

Definir gravidade verdadeira em SI por corpo de maneira estável, calibrar priors, persistir registros cientificos e seus IDs em migração segura do save V2, associar observações ao flyby fisicamente verificado e à comunicação.
