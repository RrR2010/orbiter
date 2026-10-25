# Persistência do universo e preferências — As-Built (núcleo Fases 1–2)

## Save principal vigente
`src/persistence/save.ts` exporta `SAVE_KEY='orbiter.world.v2'`, `Save {version:2,seed,time,warp,camera:{x,y,zoom}}`, `parseSave(raw)` e `serializeSave(save)`. A validação exige seed não vazia com no máximo 120 caracteres, tempo finito ≥0, warp em `[0,1,100,10000,100000,1000000]`, câmera finita e zoom entre 0,035 e 2.000.000. JSON inválido, version divergente e dados malformados retornam `null`; `serializeSave` lança erro se não puder fazer roundtrip validado. `src/main.ts` lê a chave atual, ou usa seed `orbiter-001`, tempo 0 e câmera default quando não há save válido; grava periodicamente e em interações. Não há snapshot orbital por frame: o mundo é regenerado por seed, e seu estado dinâmico orbital deriva do tempo.

## Legado e diferença de versões
Na Fase 1 a chave foi `orbiter.phase1.v1` com `version:1`, camera.zoom inicialmente até 400; Fase 2 preservou esse formato e introduziu preferências separadas. **A main atual já usa `orbiter.world.v2` e somente reconhece `version:2` em `parseSave`.** Na inicialização observada de `src/main.ts`, não existe leitura automática explícita da chave `orbiter.phase1.v1`; consequentemente, não afirmar migração transparente de saves v1 neste código. O sistema estratégico da Fase 3 mantém persistência própria em `orbiter.civilization.v2` (ver `strategic-persistence.md` quando disponível).

## Observatório
`src/ui/observatory.ts` utiliza `OBSERVATORY_KEY='orbiter.observatory.v2'`, guarda ID selecionado, follow, camadas, modo ambiente e `cameraSpeed`. Valores ausentes ou inválidos caem em defaults; ID inexistente no mundo atual deve ser descartado pelo fluxo da aplicação. Histórico: Fase 2 utilizou `orbiter.observatory.v1`. O código atual não demonstra importação automática de preferências dessa chave antiga. Offsets da câmera e animações transitórias não são persistidos.

## Falha e integridade
Chamadas de `localStorage` na UI são cercadas por tratamento de erro; falha de escrita informa o usuário sem bloquear o render. Não há gravação transacional entre as chaves de mundo/observatório/civilização, nem migração explícita do legado visível nos arquivos verificados. Mudanças em identidade de seed/gerador são sensíveis porque as entidades são reconstruídas, não congeladas em snapshots. **Divergência a investigar fora desta tarefa documental:** brief/handoffs da Fase 2 prometiam compatibilidade de save v1; o código vigente na main não lê explicitamente essas chaves. Não modificar código aqui.

## Testes e extensão
`tests/simulation.test.ts` cobre parser e serialização de Save v2, zoom alto e rejeição de versões inválidas; `tests/observatory.test.ts` cobre preferências válidas, malformadas e default cameraSpeed. Testes atuais de parser v2 **não** provam migração a partir de v1. Antes de alterar saves, planejar migração versionada com testes que inicializem dados reais de versões anteriores.

Referências: `src/persistence/save.ts`, `src/ui/observatory.ts`, `src/main.ts`, `tests/simulation.test.ts`, `tests/observatory.test.ts`; ADR-0005/0007; PRs #2/#4.
