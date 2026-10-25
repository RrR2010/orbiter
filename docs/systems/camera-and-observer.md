# Câmera e Observatório — As-Built

## Câmera e desenho
`Camera {x,y,zoom}` em `src/rendering/canvas.ts` usa centro em metros e zoom adimensional. `cameraScale(w,h,c)=min(w,h)/(12×AU)×zoom`; `projectPoint` e `unprojectPoint` em `src/rendering/camera.ts` implementam a conversão entre metros e pixels, compartilhada pelo Canvas e pelo hit test. `PlanetariumRenderer.resize()` limita DPR a 2 e ajusta o transform; `draw(world,time,camera,layers,selectedId, ...)` desenha sem modificar física, com trajetórias, estrelas, planetas e luas. O renderer da main também recebe dados da Fase 3 para símbolos/órbitas de missões; seus contratos estratégicos ficam em outros documentos. O corpo selecionado tem contorno destacado e rótulos/órbitas/cinturão obedecem toggles. O render amplia corpos pequenos para legibilidade; não tomar diâmetro em pixels como raio físico.

`pickBody` em `src/rendering/pick.ts` usa posições analíticas projetadas e hit radius mínimo de 10 px, incluindo discos físicos ampliados em zoom alto; usa score para favorecer corpos pequenos à frente de planetas visualmente grandes. A lista do observatório permite selecionar corpos demasiado pequenos para clicar.

## Operações e estado
`ObservatoryState` em `src/ui/observatory.ts`: `selectedId`, `follow`, `layers {orbits,labels,belt}`, `ambient`, `cameraSpeed` (1, 3, 7, 20; default 3). `selectBody` valida ID, desmarca IDs inválidos e desativa acompanhamento; `focusBody(camera,state,world,time,id)` **centraliza imediatamente**, dá zoom 5× aos planetas, zoom derivado da órbita local às luas (limitado a 20.000×), retorna ao zoom 1× para estrela, e **não inicia follow**. `trackBody(state,world,id)` liga acompanhamento sem mudar o zoom; `updateFollow` posiciona a câmera sobre o corpo atual sem atraso de warp, respeitando offsets persistidos apenas durante a sessão por `panFollow`. O arraste em acompanhamento ajusta offset em vez de desligar follow; zoom manual permanece livre. `resetView` volta a (0,0,1) e desativa follow. `cancelCameraZoom` cancela eventual transição de zoom em andamento. Apesar de `cameraSpeed` continuar configurável/persistido, o caminho usual de `focusBody` é instantâneo na main; não prometer animação suave nesse comando.

`bodyTelemetry`, `orbitalSpeed`, `distanceLabel`, `timeLabel` fornecem dados legíveis: raio físico, semieixo, excentricidade, período, distância atual ao pai e velocidade escalar relativa ao pai. Valores sem órbita mostram indisponibilidade. Painel exibe seleção e dados; atalhos `Espaço` e `1–5` atuam fora do campo de seed editável; `Esc` desmarca, `F` chama foco, `H` alterna painel. O modo ambiente recolhe UI sem suspender mundo.

## Persistência, testes, limites
Configurações são serializadas na chave `orbiter.observatory.v2`; `parseObservatory` valida campos e usa defaults seguros, inclusive ao faltar cameraSpeed. As transições e offsets de acompanhamento ficam em WeakMaps de runtime, **não** no JSON. Ver `persistence.md` para o save principal.

`tests/observatory.test.ts` cobre seleção, foco, follow em warp extremo, offsets de pan, zoom manual, projeção roundtrip e picking, métricas e defaults de preferências. Diferenças relevantes frente à Fase 2 histórica: **Focar** e **Acompanhar** são botões/ações distintos na main, e a chave do observatório é v2. Não extrapolar o comportamento de handoff antigo.

Referências: `src/rendering/camera.ts`, `src/rendering/canvas.ts`, `src/rendering/pick.ts`, `src/ui/observatory.ts`, `src/main.ts`; ADR-0006 a ADR-0009; PR #4, e alterações posteriores da Fase 3.
