# Fase 1 — execução e validação humana

Requisitos: Node.js 22+ e npm. Na raiz do repositório:

```bash
npm install
npm run dev
```

Abrir o endereço informado pelo Vite (normalmente http://localhost:5173). Validações: `npm run typecheck`, `npm run lint`, `npm test` e `npm run build`.

## Demonstração guiada

1. Observar o sistema e suas órbitas; arrastar para pan, usar scroll ou teclas +/− para zoom.
2. Alternar 1×, 100× e 10.000×, pausar e retomar; verificar que não existe salto abrupto de tempo.
3. Ativar Tela cheia, redimensionar a janela e verificar controles e proporções.
4. Anotar seed e tempo, recarregar e confirmar retomada no mesmo universo.
5. Alterar a seed, confirmar no diálogo e comparar o novo sistema; observar por 30 minutos.

## Simplificações e limites

Órbitas keplerianas elípticas de dois corpos em plano 2D; distâncias em metros, tempo em segundos, período derivado de parâmetro gravitacional. Não há perturbação N-body, colisões, inclinação 3D ou movimentos seculares. Estrela central fixa; luas seguem pais, sem propagação perturbada. Raio visual dos astros é aumentado artificialmente; trilhas usam 96 segmentos. Pontos do cinturão são ilustração agregada fixa, sem corpo físico individual ou falsas colisões. O zoom só transforma coordenadas. A simulação fica parada enquanto a aba está inativa e o tempo não avança offline. Deltas de animação são limitados a 0,1 s para evitar saltos após suspensão.

O `localStorage` usa formato validado `orbiter.phase1.v1` e persiste seed, tempo e câmera a cada 5 segundos, na ocultação da página e após interações. Armazenamento indisponível não impede visualização, mas compromete persistência. Formatos futuros exigirão migração.

## Evidências pendentes

O agente preparou testes automatizados, mas não conseguiu instalar o ambiente npm nem abrir o app servido pelo Vite no contexto de execução. A execução real de lint/typecheck/test/build, screenshot em navegador, FPS/memória e ensaio de 30 minutos precisa ser concluída antes de considerar A6/A7 aprovados. Não substituir medições por estimativas.
