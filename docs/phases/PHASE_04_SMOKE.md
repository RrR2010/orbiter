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
