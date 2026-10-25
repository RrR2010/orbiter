# Fase 2 — Observatório e Telemetria — Handoff técnico

## Como rodar
`npm ci`, `npm run dev`, abrir URL do Vite. `npm run validate`; `npm audit`.

## Demonstração visual (validação humana)
1. Reabrir save da Fase 1, confirmar seed e dia; clicar no planeta ou escolher planeta/lua em **Explorar corpos**.
2. Ler inspector (dados do modelo, distância ao pai e velocidade relativa ao pai em km/s).
3. Selecionar uma lua, clicar **Focar e acompanhar**, alterar warp com 1–5; arrastar para desativar follow; **Visão geral** restaura zoom 1 e centro da estrela.
4. Alternar camadas Órbitas/Rótulos/Cinturão; ocultar UI em **Modo ambiente**, recuperar com botão ou tecla H, observar fullscreen.
5. Recarregar; comprovar que seed, relógio e câmera foram preservados, e preferências visuais persistiram.

## Física e arquitetura
Telemetria é derivada de elementos keplerianos no tempo simulado. Velocidade orbital é **relativa ao corpo pai**, pelo cálculo vis-viva com μ=4π²a³/T² inferido dos elementos armazenados; não estima velocidade barycêntrica absoluta. Estrela apresenta métricas orbitais indisponíveis. Raios físicos têm origem no gerador, mas dimensões desenhadas são deliberadamente ampliadas. O foco local da lua aumenta zoom e centraliza o corpo, sem alterar suas coordenadas físicas. Uma órbita do corpo pai continua posicionada pelo timestamp corrente. O cinturão ainda é agregado visual.

## Persistência
A chave legada `orbiter.phase1.v1` e seu esquema não mudaram; continua responsável por seed/tempo/câmera. Observatório usa chave isolada `orbiter.observatory.v1`; campos ausentes/malformados recebem defaults seguros. Um ID de corpo inexistente após troca de seed é desmarcado sem apagar o mundo. A mudança não exige migração destrutiva.

## Controles
Espaço pausa; 1–5 alteram warp; +/- zoom; F foca e acompanha corpo selecionado; Esc desmarca; H alterna painel. Pan desativa follow. O follow só muda câmera. `prefers-reduced-motion` não ativa movimentos decorativos adicionais.

## Limites
Canvas depende de navegador e GPU local para desempenho; FPS/memória necessitam de observação real. Frame clamp de 0,1 s da Fase 1 permanece, e eventos agendados ainda não existem. Seleção por mapa requer corpo visível; a árvore/lista permite alcançar corpos muito pequenos. O ajuste semântico de zoom de luas é contextual e não altera a escala da simulação.

## Ajustes de experiência após teste humano

- Atalhos globais de pausa/velocidade permanecem ativos quando botões, lista de corpos e campos de configuração do painel estão focados; a única exceção é a entrada editável de seed (e outras áreas de texto editáveis).
- Ao selecionar outro corpo enquanto o acompanhamento está ativo, a câmera redireciona o follow ao novo corpo. Se o follow estava desligado, a seleção apenas altera o inspector.
- **Configurações da câmera** oferece quatro velocidades (suave, normal, rápida e quase instantânea), gravadas em `orbiter.observatory.v1`, com default compatível para preferências antigas. O follow usa interpolação exponencial de posição e zoom baseada no tempo real por frame; o zoom interpola no espaço logarítmico. Isso altera apenas a projeção, não a física. Ativar Focar e acompanhar não teleporta a câmera.
- Teste sugerido: com foco no dropdown, usar teclas 1–5 e Espaço; iniciar acompanhamento de uma lua, trocar pelo dropdown e observar transição; repetir nas quatro velocidades e recarregar para conferir persistência.
