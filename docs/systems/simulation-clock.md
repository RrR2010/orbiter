# Relógio de simulação — As-Built

## Estado e comandos
`SimulationClock` em `src/core/clock.ts` mantém tempo simulado em segundos não negativos, velocidade `Warp` e última velocidade ativa para retomar. `WARP_LEVELS = [1,100,10000,100000,1000000]` e pausa é `0`. O construtor tem defaults de tempo 0 e warp 100. `dispatch({type:'set-warp',warp})` valida velocidades; `dispatch({type:'toggle-pause'})` alterna pausa/último warp. `setWarp` delega ao dispatch; getters `time, warp, selectedWarp`. `advance(elapsed)` exige delta real finito não negativo e adiciona `elapsed × warp`. `settleTo(time)` define um tempo não anterior ao atual sem despausar (usado na integração com o avanço estratégico posterior).

## Integração real na main
O loop em `src/main.ts` acumula `elapsed × clock.warp` num tempo pretendido e invoca `advanceCivilization(..., pendingSimulatedTime, 256, ...)`; depois sincroniza o relógio pelo `settleTo(civilization.time)`. Portanto **não** descrever a aplicação atual como avanço direto por `clock.advance` a cada frame: o relógio é também reconciliado com o avanço por eventos da Fase 3. O relógio usa tempo simulado, não data civil e não realiza rewind. Há uma opção de reduzir para 1× na preparação de lançamento, acionada pela integração da aplicação; o core de clock não detecta eventos por si só. Atualizações enquanto a aba está oculta são interrompidas na integração UI.

## Testes e riscos
`tests/simulation.test.ts` verifica comandos, pausa/retomada, warp intermediário e máximo, independência de particionamento de deltas e `settleTo` monotônico. O formato da HUD fica em `src/ui/time.ts`. Testes de scheduler estratégico pertencem ao contrato da Fase 3; a velocidade de atualização visível pode diferir de tempo de parede se existir backlog a processar. Extensões futuras devem manter relógio monotônico, tratar ordens de eventos e nunca depender da frequência do Canvas.

Referências: `src/core/clock.ts`, `src/main.ts`, `src/ui/time.ts`, `tests/simulation.test.ts`; ADR-0002; Fases 1–3 (integração atual).
