# Auditoria de encerramento — Fase 5 (pré-merge)

**Situação:** Em revisão; **não liberar merge** com esta evidência isolada.

**Checkpoint comprovado pelo PO:** branch `phase/05-interplanetary-exploration`, HEAD `093cf4b01d4f31eda46c1660a6f691641331e92d`, `npm run validate` **4/4 PASS, 202/202 testes** (Lint 3.8 s; Typecheck 2.3 s; Tests 5.3 s; Build 3.9 s). A auditoria documental posterior não significa que novos commits tenham sido validados.

## Gates do brief `PHASE_05.md`

| Gate | Evidência existente | Estado |
|---|---|---|
| A1 Discovery aprovado | Verificar aprovação explícita e arquivo `PHASE_05_DISCOVERY.md` | **A conferir** |
| A2 Sobrevoo real e falha rastreável | Cenário físico positivo `phase-five-real-vehicle`, casos de miss e injeção inviável em testes de simulação | **Evidência automatizada** |
| A3 Observabilidade de origem, destino, progresso e outcome | Canvas, picking/follow, feed e HUD; ainda requer smoke humano no browser | **Parcial** |
| A4 Warp/particionamento/scheduler | Testes de replay, milestones e recepção de ciência, inclusive save/load | **Evidência automatizada; smoke pendente** |
| A5 Saves e regressões | Validação corrente 202/202, parsers de timeline e inbox; verificar integridade no navegador | **Parcial** |
| A6 Desempenho e limites | Ainda sem relatório reproduzível de warp longo, FPS, custo e tamanho do histórico | **Pendente** |
| A7 `npm ci`, `npm audit`, smoke e docs | Só `npm run validate` reportado neste checkpoint; docs As-Built atualizadas incrementalmente; catálogo/design devem ser conciliados | **Pendente** |
| A8 CI final e merge | Não houve `workflow_dispatch` neste ciclo, PR/merge não certificados | **Pendente (não disparar até resolver anteriores)** |
| A9 Não iniciar Fase 6 | Nenhum desenvolvimento de Fase 6 | **Atendido** |

## Pendências concretas para auditoria funcional

1. **Rota planejada vs. rota percorrida:** conferir se o Canvas distingue ambas visualmente; uma posição física do veículo, por si só, não prova a existência de trilhas diferenciadas.
2. **Spotlight/warp na aproximação:** conferir redução de warp e notificação discreta do encontro interplanetário; atenção à política existente de watch launch.
3. **Política estratégica:** testar progressão natural em múltiplas seeds, recorrência de sondas, bloqueios por capacidade e falhas; a autorização automática atual requer conhecimento >=3000 e primeiro sucesso local e tenta somente a primeira missão interplanetária.
4. **Modelo físico/tecnológico:** escape impulsivo parte de uma órbita de estacionamento já idealizada; não assumir ascensão planetária integral, precisão universal de flyby ou link budget RF físico.
5. **Observabilidade e saves:** smoke de selecionar missão pelo feed/mapa, seguir do escape à SOI, atravessar correção, receber ciência só após atraso, pausar e retomar save sem repetir eventos.
6. **Governança:** atualizar índice `docs/systems/README.md`, documentação visual, status, backlog e eventuais ADRs; fazer `npm ci`, `npm audit`, benchmark, PR revisável e CI manual no HEAD final.

## Conclusão

A suíte atual passa, mas os gates A3, A5, A6, A7 e A8 não possuem evidência suficiente para conclusão e merge. Não iniciar Fase 6; não declarar aprovação funcional humana nem CI que não ocorreu.

## Atualização de evidências — 2026-10-31, lockfile 196614b

- **A2/A3:** smoke real do PO com seed `orbiter-002`, sonda `interplanetary-125`: lançamento T+1057 dias, correção, flyby com medição científica recebida, encerramento T+1336 dias; localização e follow pós-chegada confirmados em captura posterior. A experiência ainda possui limitações visuais e não há trilha planejada versus percorrida demonstrada.
- **A4/A5:** suite local `npm run validate` **4/4 PASS (205/205)** no HEAD anterior à modificação de dependências. Testes de replay, ciência e trajetória; smoke do PO confirma acompanhamento, porém não deve substituir testes explícitos de reinício sob warp alto.
- **A7 segurança:** PO regenerou `package-lock.json` usando `npm install --package-lock-only --ignore-scripts`; `npm ci` OK, `npm ls minimatch` = **11.0.3** nos dependentes do lint, `npm audit` = **0 vulnerabilidades**, `npm run validate` = **4/4 PASS (205/205)**. Commit `196614b` publicado na branch e lock conferido. ESLint 9 deprecated e esbuild allowScripts continuam avisos não equivalentes a vulnerabilidade.
- **A6 desempenho:** `npm run benchmark:orbits` mede apenas coast sintético de dois corpos, **não** o scheduler interplanetário, nem Canvas/browser. Ensaiar e reportar tempos/memória; além disso verificar avanço real em warp alto e quantidade de eventos/entidades sem bloquear interface. Não declarar este gate aprovado somente pelo benchmark sintético.
- **A8:** GitHub Actions final e merge ainda **não realizados**.

**Observação:** registros anteriores acima são históricos do pré-merge e não devem substituir as evidências mais recentes desta atualização.
