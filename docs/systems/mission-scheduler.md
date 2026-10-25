# Scheduler estratégico de eventos — As-Built (Fase 3)

## Autoridade e API
`advanceCivilization(c,world,target,budget=256,stopOnPreparation=false):number` em `src/simulation/civilization.ts` consome eventos em tempo simulado. Rejeita `target<c.time`, tempo inválido ou orçamento não inteiro positivo. `Civilization.nextAt` é o próximo evento, `time` o instante estratégico processado, `accruedAt` o marco contábil. Não existe worker, fila de prioridade genérica ou simulação por frame de combustível.

## Máquina de eventos
Enquanto `nextAt<=target` e `processed<budget`:
1. Contabiliza recursos/conhecimento até o instante do evento.
2. Se missão `preparing`: gera e resolve plano V2, muda para `ascending`, registra `launch` e agenda `max(now+1,flight.terminal.timeS)`.
3. Se missão `ascending`: define sucesso por `orbital || goalAchieved`, fecha missão, registra evento `success`/`failure` e agenda recuperação 172800 s.
4. Sem missão ativa, estágio <4: pesquisa se houver conhecimento ou reagenda a tentativa.
5. Tecnologia completa e recursos >=70: prepara uma missão, registra `preparation`, agenda +1200 s; caso contrário espera recuperação.

`stopOnPreparation` interrompe a iteração exatamente após o evento de preparação, para o observador poder reduzir warp para 1× (`src/main.ts` checkbox `orbiter.watch-launch.v2`). Se todos os eventos até `target` foram consumidos, avança `c.time` ao alvo; caso o orçamento termine antes, preserva a dívida temporal no caller. IDs dos eventos usam tempo/tipo/serial; listas são aparadas a 120 eventos e 60 missões.

## Invariantes, integração e riscos
`src/main.ts` mantém `pendingSimulatedTime`, chama o scheduler em cada frame com orçamento 256 e sincroniza o relógio via `SimulationClock.settleTo`; somente o alvo de tempo vem do warp/câmera, nunca o resultado do motor. A resolução do voo ocorre no evento de lançamento, e não continuamente durante o tempo de voo; simulação de vários lançamentos simultâneos não existe. Processar backlog exige múltiplos frames quando excede orçamento. Eventos podem referenciar missões antigas já fora do histórico limitado.

Testes: `tests/civilization.test.ts` (equivalência entre avanço integral, particionado e orçamento baixo; serialização; IDs; limites), `tests/launch-watch.test.ts`, `tests/launch-phase.test.ts`, `tests/space-program-evolution.test.ts`. Cuidado ao alterar ordem de prioridades: muda a história determinística e potencialmente os saves.
