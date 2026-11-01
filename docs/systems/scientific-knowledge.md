# Conhecimento científico — contrato inicial Fase 5A

**Estado:** módulo inicial em desenvolvimento, ainda não integrado ao scheduler, persistência estratégica nem voo. Este documento não afirma uma experiência de exploração já funcional.

## Responsabilidade

`src/simulation/scientific-knowledge.ts` separa estimativas da civilização do estado físico de `World`. `initialScientificRecord(world)` cria uma estimativa inicial reproduzível da aceleração superficial em m/s² para cada planeta, com incerteza elevada (45% da estimativa), a partir do modelo de densidade constante já utilizado pelo motor e de um viés por seed. Este é um modelo inicial de observação imperfeita, não um novo parâmetro gravitacional físico. `receiveGravityObservation(state, observation)` exige sinal de transmissão, valida campos, recebe evento por ID uma única vez e atualiza a estimativa por precisão ponderada; o histórico de IDs impede duplicação após replay/save.

**Limite provisório importante:** as estimativas estão em SI mas são geradas com um prior simplificado a partir do modelo físico existente; não existe ainda uma cadeia independente de observação astronômica nem diferenças planetárias de densidade. Não orientar manobras até a conexão validada ao planner. Os eventos científicos ainda são passados diretamente ao módulo; o fluxo aquisição/telemetria/transmissão não foi implementado.

## Testes

`tests/scientific-knowledge.test.ts` contém determinismo, imutabilidade de `World`, ausência de aprendizado antes da transmissão, idempotência e validação de medidas. Testes ainda dependem de execução local.

## Próximos passos de integração

Calibrar priors e distinguir conhecimento observável de estado físico, persistir registros cientificos e seus IDs em migração segura do save V2, associar observações ao flyby fisicamente verificado e à comunicação.

## Integração de persistência (incremento 5A)

`Civilization.science` armazena o registro de estimativas e IDs de observações recebidas. Civilizações V2 novas começam com priors reproduzíveis; saves V2 anteriores sem `science` recebem apenas estimativas iniciais ao carregar, sem descobertas retroativas. `parseCivilization` valida registros presentes e rejeita registros inválidos conforme a política atual de recuperação. A aquisição e transmissão ainda não são geradas automaticamente por missões.
