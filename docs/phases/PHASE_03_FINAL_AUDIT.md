# Auditoria pré-merge — Fase 3 / PR #7

**Data:** 2026-10-25  
**Branch:** `phase/03-first-space-age`  
**Base:** `main`  
**Resultado:** **CONDICIONAL — NÃO liberar merge/CI ainda sem completar gates pendentes**.

## Evidência verificada nesta revisão

- O product owner reportou `npm run validate` **PASS em lint, typecheck, tests e build** no HEAD anterior à documentação final, e confirmou visualmente follow com pan offset, seleção e marcadores AP/PE.
- Código lido na branch: V2 integra missões ao scheduler, navegação orbital analítica e manobras físicas, checkpoints e impacto; render lê snapshots e diferencia trilha, previsão e símbolo; saves usam namespace V2 sem migração.
- Casos demonstrados na conversa: órbita com objetivo atingido, órbita estável parcial, falha por colisão, sucesso científico suborbital, navio em queda após falha de inserção, e monitor automático de lançamento.
- Política CI: `AGENTS.md` e `docs/WORKFLOW.md` exigem uso **somente final** de GitHub Actions, por `workflow_dispatch`, após validação local e auditoria.

## Matriz de gates

| Gate | Situação | Evidência / ação |
|---|---|---|
| Lint / typecheck / testes / build | PASS reportado | Execução local humana (4/4) antes dos commits exclusivamente documentais desta auditoria |
| Smoke visual do observatório | PASS reportado | AP/PE, linha selecionada, pan offset de nave, acompanhamento, lançamentos observados |
| Determinismo de missões e save/reload | PARCIAL | Há regressões automatizadas; sem demonstração ampliada de múltiplos mundos e recarga durante todos os estados |
| Missão com órbita, falha, suborbital | PASS demonstrado | Logs e capturas humanas ao longo da Fase 3 |
| Validação de LOD/sprites em alto zoom | PARCIAL | Testes humanos demonstraram zoom, base, foguete, satélite; sem inspeção formal de todos os limites |
| `npm audit` / dependências | PENDENTE | Executar localmente e anexar resumo de vulnerabilidades e justificativas |
| Performance x1.000.000 com 100/1000/10000 objetos | PENDENTE | Sem números/perfis; deve ser medido ou receber exceção explícita do PO antes do merge |
| Limpeza de V1 obsoleto | DÍVIDA TÉCNICA | `spaceflight/flight.ts` e testes legados permanecem; runtime usa V2. Avaliar remoção segura ou registrar exceção explícita ao brief |
| Revisão de diff, segredos, branch protection | PENDENTE | Conferir diff real com `main`, lockfile, workflow manual, políticas e conflitos |
| CI final no HEAD definitivo | NÃO EXECUTADO (correto) | Executar **uma vez** após os gates locais finais; não disparar por commit |
| Merge na main | NÃO EXECUTADO | PR #7 deve ficar draft até gates liberados |

## Achados e riscos

1. **Sem risco funcional novo identificado no polimento visual:** AP/PE deriva da conic em `predicted-orbit.ts`; selection id é passado explicitamente ao Canvas; pan segue offset por missão. Não foi executado browser automatizado pela auditoria.
2. **Legado:** presença de `flight.ts` V1 contraria o ideal de remoção integral do plano V2; não reativar lógica antiga nem reinterpretar saves sem autorização.
3. **Escala:** cap de histórico e arrays de símbolos reduz o trabalho por frame, mas não demonstra performance de populações grandes. A arquitetura não autoriza alegar que milhares de missões são suportadas em 1.000.000× sem benchmark.
4. **IA física simplificada:** controle não equivale a MechJeb, usa 2D, dois corpos, aproximação de manobra e correções heurísticas. Isto é aceitável na Fase 3 desde que representado como simplificação, não física integral.
5. **Documentação histórica:** seções antigas de `PROJECT_STATUS.md` e plano visual V1 são registros cronológicos; a síntese mais recente deste relatório e o contrato V2 prevalecem. Não interpretar notas antigas “pendente” como estado atual.
6. **Persistência:** reset V1 foi autorizado pelo produto; não alegar compatibilidade retroativa.

## Preflight antes de integração

1. Na branch final, executar `npm ci`, `npm run validate` e `npm audit`; guardar o output. Não disparar Actions nessa etapa.
2. Executar smoke curto: universo novo, primeira missão, acompanhamento 1×, missão falha até impacto, satélite estável, seleção AP/PE, pan com follow, zoom, reload e warp x1.000.000.
3. Fazer diff review final, verificar segurança, política do workflow, conflitos e se existem bloqueios de branch.
4. Resolver ou explicitamente aceitar as duas pendências de escopo: limpeza do V1 e benchmark de escala. Sem aceitação explícita, não fazer merge.
5. Atualizar este registro com evidências reais. Somente então executar o workflow **Orbiter Final CI** manualmente, confirmar `success` no HEAD relevante, squash merge e fechar issue #6.
6. Não iniciar a Fase 4 sem nova autorização.

**Auditoria efetuada pela IA sobre código e documentação conectados; validação local, navegador e `npm audit` nesta etapa não foram executados pela IA.**

## Atualização — limpeza V1 e benchmark isolado (2026-10-25)

O product owner executou `npm ci`, `npm run validate` (4/4 PASS) e `npm audit` (0 vulnerabilidades) antes destes novos commits. `npm ci` informou aviso de versão de ESLint depreciada e postinstall de esbuild não coberto por `allowScripts`; não foi relatada falha, mas avaliar aviso em manutenção de dependências.

Com aprovação explícita, removido `src/simulation/spaceflight/flight.ts` (planejador V1 obsoleto); tipo de snapshot necessário à renderização V2 foi definido em `flight-view.ts`. Os módulos reutilizados de mecânica orbital e respectivos testes são **compartilhados**, não devem ser eliminados como legados automaticamente.

Criado `npm run benchmark:orbits` (`scripts/benchmark-orbits.mjs`): empacota código-fonte real da física via esbuild **apenas em memória**, cria vetores sintéticos de 100, 1000 e 10000 naves com órbitas circulares e mede propagação analítica de 1.000.000 segundos por nave, geometria de previsão para no máximo 8 selecionáveis, heap consumido e checksum reprodutível. `npm run benchmark:orbits -- 100 1000 10000` permite tamanhos explícitos. **O comando não abre o navegador, não escreve arquivos e nunca acessa localStorage/saves.** Ele não representa FPS Canvas, scheduler, nem milhões de misses/eventos; é um microbenchmark que deve acompanhar smoke manual de warp 1.000.000×.

**Status atualizado:** Security audit 0 vulnerabilidades e 4/4 previamente comprovados pelo humano; **limpeza V1 e script de benchmark requerem nova validação 4/4** no HEAD atual. Benchmark ainda **não foi executado nem medido** nesta auditoria; capturar resultados e hardware antes de aprovar escala. CI e merge continuam pendentes.

## Resultado do benchmark e correção de limpeza V1 — 2026-10-25

**Benchmark executado pelo PO no Windows / Node:** 100 objetos = 0,67 ms de propagação, 6,7 MB heap; 1.000 objetos = 5,49 ms, 7,5 MB; 10.000 objetos = 8,2 ms, 11,4 MB. Cada propagação abrange um salto de 1.000.000 s simulados; geometria de previsão para 8 objetos levou 0,49 / 0,22 / 0,21 ms respectivamente. Resultados reais observados, embora sem benchmark repetido/estatístico e sem FPS Canvas ou custo do scheduler de missões. O cenário sintético não alterou saves.

**Regressão de limpeza V1:** após exclusão de `flight.ts`, o PO encontrou importações restantes em `tests/finite-apoapsis-burn.test.ts` e `tests/launch-guidance.test.ts`: lint PASS, typecheck FAIL, tests FAIL, build FAIL. Ambos os arquivos testavam exclusivamente API e opções `FlightPlan version:1` (compatibilidade com saves V1, perfis com constantes V1). Foram removidos; comportamento V2 é coberto por `tests/flight-v2.test.ts`, `tests/ascent-v2.test.ts`, `tests/executor-v2.test.ts` e demais testes. **Revalidação local 4/4 após essa remoção ainda pendente.** Nenhum CI ou merge executado.
