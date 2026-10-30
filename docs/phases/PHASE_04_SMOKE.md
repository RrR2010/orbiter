# Smoke test humano — Fase 4 (pré-merge)

**Estado:** pendente; não registrar PASS sem execução no navegador. Executar localmente no HEAD da branch `phase/04-visual-hud-ux`, com Node >=22.12.

## Comandos obrigatórios

```bash
git fetch origin
git checkout phase/04-visual-hud-ux
git pull --ff-only
npm ci
npm run validate
npm audit
npm run dev
```

Anotar saída completa do validador e auditoria, incluindo SHA testado (`git rev-parse HEAD`). Não executar GitHub Actions nesta etapa.

## Passos visuais

1. **Visão geral:** recarregar universo, conferir barra de controles, painel do observatório e que o Canvas permanece central. Nenhuma telemetria de missão sem seleção.
2. **Missão em preparação:** avançar warp para preparação, verificar a agenda com tempo real, marcar `Acompanhar` e observar o lançamento sem pulo arbitrário quando já se acompanha outra missão.
3. **Seleção:** clicar no marcador de veículo ou item na lista. Ler altitude, velocidade, combustível, AP/PE, massa, ΔV e Isp. Confirmar referencial planetocêntrico e valores N/D quando ainda não há voo.
4. **Voo:** acompanhar ascensão e mudança de fase. Verificar variação causal de altitude, velocidade e combustível. Comparar metas de AP/PE com telemetria atual, sem atribuir previsão ao alvo.
5. **Órbitas:** conferir setas discretas de direção das órbitas mesmo em pausa; selecionar uma missão, validar diferenciação visual da cônica. Confirmar que o rastro de ascensão some após fase propulsada/conclusão e não reaparece após impacto.
6. **Câmera/controles:** focar, acompanhar, arrastar e zoom durante follow, voltar à visão geral, modo ambiente, fullscreen, pausa e 1×/warp. Testar com teclado.
7. **Reload:** marcar missão agendada, atualizar página e verificar se a preferência persistiu sem alterar estado simulado. Observar teste com largura de janela reduzida.
8. **Movimento reduzido:** habilitar `prefers-reduced-motion` no navegador e conferir ausência de informação dependente de animação.

## Pontos de atenção conhecidos

- Agenda contempla apenas missões em preparação efetivamente registradas, não eventos genéricos do futuro.
- Versão atual possui uma civilização; múltiplas civilizações não são parte do motor existente.
- HUD é contextual, sem todas as miniaturas/módulos ilustrativos do mockup.
- Não há prova ainda de execução local de lint/typecheck/test/build/audit nem validação visual.
- Caso uma etapa falhe, salvar captura + seed, tempo, velocidade de warp, ação executada e erro de console para reprodução.

## Gate de integração

Somente depois de correções e todos os gates A1–A7 aprovados: executar `Orbiter Final CI` manualmente via `workflow_dispatch` no **HEAD definitivo do PR** e confirmar sucesso com SHA correspondente. Então squash merge e fechamento de Issue #8.

## Verificações adicionais da iteração de acabamento

9. Ativar/desativar **Eventos cinematográficos** no observatório, induzir evento real de lançamento, verificar destaque opcional sem mudança de ocorrência física.
10. Ativar **Reduzir interface após inatividade**; não tocar teclado/mouse por 11+ segundos, conferir opacidade reduzida e retorno após interação. Desativar e repetir. Recarregar para verificar persistência. Testar também com `prefers-reduced-motion`.

## Regressão de câmera — relatório do PO

11. Com opção `Reduzir para 1×` marcada e **nenhuma missão selecionada**, avançar ao próximo início de preparação: observar redução para 1× e centro da câmera na base de superfície (não no centro do planeta). No instante de ignição, observar câmera seguindo o veículo sem intervenção.
12. Repetir usando o botão `Acompanhar` de uma missão na agenda, inicialmente com o checkbox de redução desmarcado: enquadramento na base durante preparação, nave após ignição. Manter follow de outra missão e verificar que novos avisos não sequestram a câmera.
13. Fazer pan e zoom manual durante preparação e após lançamento, verificando a permanência do offset e do zoom escolhidos.

## Smoke adicional — organização integral da interface

14. Alternar **Corpos, Missões, Camadas**; verificar se seletores, programas, camadas e câmera continuam operacionais. Recarregar e confirmar aba preferida.
15. Selecionar corpo e depois missão; comparar Observatório (índice / ações) com HUD (telemetria), sem repetição de AP/PE no feed.
16. Conferir header em tela larga/estreita: seed/Gerar, pausa, warp, visão geral, ambiente e fullscreen.
17. Conferir rodapé: tempo, corpo/universo, missão atual, mensagem operacional e botão **Atalhos ?**. Testar os atalhos de teclado e ausência de obstrução da cena.

## Smoke — acabamento global cinematográfico

18. Abrir aba Corpos e clicar em estrela e planetas pelo navegador visual, conferir que a lista nativa e a seleção do mapa continuam sincronizadas. Testar seleção de lua pela lista e foco/follow.
19. Testar a sinalização inferior de **SIMULAÇÃO ATIVA/PAUSADA** contra o tempo real e alternar pausa via botão e barra de espaço. Não aceitar estado verde durante pausa.
20. Confirmar visual geral escuro, leitura de textos, foco por teclado, responsividade, fullscreen e modo ambiente. A arte do planeta continua Canvas 2D; não há minimapa ou 3D simulados.

## Polimento final — atalhos e rodapé

21. Abrir **Atalhos ?**, clicar na cena, no painel e em outro controle; em todos os casos o balão fecha. Reabrir e pressionar Esc: fecha apenas a ajuda, sem desmarcar a seleção; Esc seguinte retoma comportamento normal.
22. Testar rodapé em largura grande e estreita, com mensagem de missão longa, garantindo que a mensagem operacional tenha prioridade e nenhum elemento cubra o botão Atalhos.
23. Selecionar uma lua pela lista: o planeta pai deve receber indicação visual contextual sem parecer que o próprio planeta foi selecionado.
