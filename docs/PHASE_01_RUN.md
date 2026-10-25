# Fase 1 — execução e validação humana

Requisitos: Node.js 22.12+ e npm. Na raiz do repositório, use `npm ci` para instalar exatamente as versões fixadas no `package-lock.json`:

```bash
npm ci
npm run dev
```

Abrir o endereço informado pelo Vite (normalmente http://localhost:5173). Validação completa: `npm run validate` (executa lint, typecheck, tests e build, sem parar na primeira falha; mostra PASS/FAIL por etapa e encerra com erro se qualquer uma falhar. A saída de `npm run validate` é um relatório compacto delimitado por `ORBITER VALIDATION REPORT` e `END ORBITER REPORT`, pronto para copiar ao agente. O relatório extrai no máximo 12 linhas relevantes por falha, trunca linhas individuais em 220 caracteres e limita a captura por comando em 2 MiB; informações de depuração extensas devem ser obtidas executando o comando individual). Comandos individuais: `npm run typecheck`, `npm run lint`, `npm test` e `npm run build`.

## Demonstração guiada

1. Observar o sistema e suas órbitas; arrastar para pan, usar scroll ou teclas +/− para zoom.
2. Usar Espaço para pausar/retomar e teclas 1–5 para alterar velocidade (1×, 100×, 10.000×, 100.000×, 1.000.000×); os campos de texto continuam recebendo digitação normalmente. Verificar que não existe salto abrupto de tempo.
3. Ativar Tela cheia, redimensionar a janela e verificar controles e proporções.
4. Observar o relógio em horas:minutos:segundos (e dias após 24h). Anotar seed e tempo, recarregar e confirmar retomada no mesmo universo.
5. Alterar a seed, confirmar no diálogo e comparar o novo sistema; observar a estabilidade da animação. O product owner aceitou um ensaio de 15 minutos para esta fase.

## Contrato de controle temporal

O clock expõe `dispatch({type: 'set-warp', warp})` e `dispatch({type: 'toggle-pause'})`, independentemente de DOM. Controles humanos chamam essa API; sistemas futuros poderão enviar comandos após detectar eventos reais. A redução automática pré-evento não está implementada na Fase 1 (IDEA-012). Os atalhos não voltam no tempo, apenas param ou alteram o avanço futuro.

## Simplificações e limites

Órbitas keplerianas elípticas de dois corpos em plano 2D; distâncias em metros, tempo em segundos, período derivado de parâmetro gravitacional. Não há perturbação N-body, colisões, inclinação 3D ou movimentos seculares. Estrela central fixa; luas seguem pais, sem propagação perturbada. Raio visual dos astros é aumentado artificialmente; trilhas usam 96 segmentos. Pontos do cinturão são ilustração agregada fixa, sem corpo físico individual ou falsas colisões. O zoom só transforma coordenadas. A simulação fica parada enquanto a aba está inativa e o tempo não avança offline. Deltas de animação são limitados a 0,1 s para evitar saltos após suspensão. **Consequência:** se o FPS cair abaixo de 10 ou o navegador ficar suspenso, o tempo real excedente é descartado e o mundo simulado avança menos do que o relógio de parede. Esta política é aceitável apenas nesta fase sem eventos; deve ser revista antes de introduzir simulação orientada a eventos para não pular consequências.

O `localStorage` usa formato validado `orbiter.phase1.v1` e persiste seed, tempo e câmera a cada 5 segundos, na ocultação da página e após interações. Armazenamento indisponível não impede visualização, mas compromete persistência. Formatos futuros exigirão migração.

## Evidências, aceite e limitações

O humano reportou `npm run validate` com **4/4 PASS** (lint, typecheck, testes e build) no Windows, verificou interação, seed e recarregamento e observou 15 minutos de estabilidade sem travamentos ou jitter aparentes até aproximadamente o dia simulado 1400. A orquestradora aceitou a exceção expressa do product owner ao requisito original de 30 minutos. Não foram medidas taxas de FPS, uso de memória ou estabilidade por várias horas; esses pontos continuam riscos residuais, não impedimentos declarados para esta fase. Consulte `docs/PHASE_01_HANDOFF.md` e o comentário da revisão no PR #2.


## Dependências de desenvolvimento e segurança

O Vitest foi atualizado para a série 5 corrigida após o audit apontar falhas em versões anteriores do Vitest, `@vitest/mocker` e `tinypool`. Atualizações de major exigem executar `npm ci`, `npm run validate` e `npm audit` com lockfile sincronizado antes do merge. Evitar `npm audit fix --force` sem avaliação.
