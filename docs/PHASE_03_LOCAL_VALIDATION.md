# Fase 3 — Validação local pelo humano

**PR:** #7, branch `phase/03-first-space-age`. Este documento não declara aprovação antecipada dos gates.

## Preparação

Abra um terminal na raiz do repositório:

```bash
git fetch origin
git switch phase/03-first-space-age
git pull --ff-only
npm ci
npm run validate
npm audit
npm run dev
```

Registre as saídas completas de comandos que falharem e o SHA exibido em `git rev-parse HEAD`. Não dispare o workflow do GitHub Actions nesta etapa.

## Smoke tests de navegador

1. Abra a URL indicada por Vite em uma aba sem dados anteriores (janela privada). Verifique corpos, estrelas, trilhas, controle de velocidade, zoom manual, seleção e foco. Não deve haver erro no console.
2. No painel **Programa espacial**, confirme que há um planeta de origem, pesquisa em andamento e recursos numéricos válidos.
3. Use velocidade 10.000× para acompanhar pesquisa e uma missão (se necessário aumente para 100.000×). Observe atualização da missão e estado final. Volte a 100× ou 1× próximo de um evento para identificar o marcador de lançamento.
4. Clique no símbolo de um veículo/satélite ou botão de missão recente; confira o texto descritivo e o foco no planeta de origem. A posição visual do símbolo é **representacional**, não uma propagação orbital física.
5. Pause e confira que a simulação não progride quando não há débito anterior; use zoom e follow em planetas distantes. Retome e verifique se o planeta não se afasta do centro no warp alto.
6. Recarregue a página e confirme que pesquisa, orçamento, quantidade de sucessos/falhas e histórico não reiniciam nem duplicam.
7. Gere outra seed e confirme que programa e contagem de missões recomeçam, sem reaproveitar histórico da seed anterior.
8. Opcional para regressão de saves Fase 2: em outro perfil/navegador, abra primeiro a versão main, crie um save, depois abra a branch Fase 3 com o mesmo armazenamento. Deve preservar seed/órbitas/tempo e iniciar civilização no instante corrente, sem inventar missões passadas.
9. Deixe rodar por 10 minutos em 1.000.000×, alternando ambiente/painel e foco. Registre fluidez, resposta do navegador e se o feed continua legível.

## Retorno esperado

Envie SHA testado, saída de `npm run validate` e `npm audit`, navegador utilizado, smoke tests aprovados/falhados, eventuais erros de console e prints da interface com o programa espacial.

**Regra CI:** somente após todos os testes, revisão e smoke tests aprovados, fazer `workflow_dispatch` do workflow final para o SHA definitivo.
