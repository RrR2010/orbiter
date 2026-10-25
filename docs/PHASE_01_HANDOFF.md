# Handoff — Fase 1 (2026-10-24)

- **Branch / PR:** `phase/01-living-planetarium` / https://github.com/RrR2010/orbiter/pull/2 (draft, sem merge).
- **Issue:** https://github.com/RrR2010/orbiter/issues/1.
- **O que funciona para o usuário:** sistema planetário procedural determinístico; órbitas keplerianas; pausa e warp (1×, 100×, 10.000×, 100.000×, 1.000.000×); teclas Espaço e 1–5; zoom, pan, fullscreen, seed e persistência de tempo/câmera.
- **Como executar:** `npm install`, `npm run dev` e abrir URL indicada pelo Vite (normalmente http://localhost:5173). Executar `npm run validate` para checagem consolidada.
- **Demonstração guiada:** (1) observar planetas; (2) alterar velocidades por 1–5 e pausar com Espaço; (3) usar pan/zoom/fullscreen; (4) recarregar e confirmar a seed e o dia simulado; (5) criar novo universo por seed.

## Critérios de aceite

- **A1 — PASSOU (automatizado + humano):** mesma seed e identidade preservadas no reload; usuário confirmou.
- **A2 — PASSOU (automatizado + humano):** clock independente do FPS, warp e pausa; velocidades calibradas após feedback.
- **A3 — PASSOU (automatizado); validação visual parcial:** testes numéricos para órbitas elípticas e coordenadas finitas; no ensaio humano não houve mudança orbital aparente, mas inspeção ocular não mede semieixo maior.
- **A4 — PASSOU (manual):** pan, zoom, fullscreen e controles observados funcionais; medição de DPR não reportada separadamente.
- **A5 — PASSOU (manual + automatizado):** refresh persistiu seed e progresso até o dia ~1400.
- **A6 — PASSOU (Windows):** saída reportada pelo usuário: PASS Lint (1,5 s), PASS Typecheck (1,2 s), PASS Tests (2,7 s), PASS Build (5,2 s); RESULT 4/4 passed. Testes unitários: 15 após incremento de warp intermediário (contagem final não informada pelo relatório compacto).
- **A7 — ACEITO PELO PRODUCT OWNER COM RESSALVAS:** ensaio humano contínuo por 15 minutos, sem travamentos, gargalos ou jitter percebidos; órbitas aparentaram estáveis, controles e refresh continuaram funcionais. O brief exige 30 minutos ou equivalente instrumentado justificável mais verificação visual. Não houve medição instrumental de FPS/memória ou execução de 30 minutos. **O product owner aceitou formalmente 15 minutos como critério suficiente para esta fase em 2026-10-24; exceção ao limiar original de 30 minutos, sem afirmar equivalência instrumental. Revisão final do gate permanece com a orquestradora.**
- **A8 — PASSOU (escopo):** sem civilização, missões, economia ou funcionalidades da Fase 2.

## Testes e limitações

O ambiente de execução do agente não realizou medição instrumental nem abriu navegador; evidência funcional vem da execução humana no Windows. FPS/memória não medidos. A matemática orbital é analítica e não integra estado a cada frame, portanto as trilhas não acumulam erro numérico de integração; isso não substitui ensaio requerido. A simulação para ao fechar a página; cinturão é representação agregada sem colisões; raios visuais são ampliados.

## Decisões / backlog / riscos

- Persistência regenerativa via `localStorage`, formato v1, ADR-0005.
- API de comandos para clock permite futuras políticas de warp, mas desaceleração pré-evento não implementada.
- IDEA-011 (foco em luas) e IDEA-012 (desaceleração antecipada por eventos) permanecem para triagem posterior.
- Risco remanescente aceito pelo product owner: não há evidência de estabilidade por 30 minutos nem telemetria FPS/memória; testes mais longos devem ser reconsiderados quando o número de entidades e sistemas crescer.

## Recomendação ao gate

Não fazer merge automático nem liberar Fase 2. Submeter ao julgamento da orquestradora com A7 **aceito pelo product owner mediante exceção documentada de 15 minutos**. A orquestradora decide se aceita a exceção no gate; não declarar ensaio de 30 minutos nem liberar a próxima fase sem decisão.
