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

## Extensões de interface — Fase 4 (branch de desenvolvimento)

`src/main.ts` monta uma agenda contextual de missões em preparação e HUD para missão selecionada; `src/style.css` contém os estilos responsivos `.mission-hud` e `.launch-agenda`. O mapa e câmera continuam em Canvas e comandos existentes; missão selecionada usa `trackedMissionId`. O modo ambiente recolhe ambos os painéis. A preferência de marcações da agenda usa `orbiter.mission-watch.v1`, lista de IDs persistida separadamente (não faz parte do save físico nem do observatório V2). O código trata eventos de lançamento recém-processados em lote e não troca câmera se já houver acompanhamento de missão. Há somente uma civilização no modelo atual; concorrência entre múltiplas civilizações permanece futuro, não implementado.

**Limitações:** o painel usa seleção/acompanhamento unificados, sem modo independente de inspeção passiva de missão; não há cronograma global multi-civilização; nem alerta programado com confirmação. A agenda exibe apenas missões que já possuem `launchAt` real, nunca inventa eventos. Testes de navegador/reload pendentes antes do aceite.

### Refino do HUD como instrumento

A camada de apresentação da Fase 4 usa `hudIcon` (`src/ui/hud-icons.ts`) e estrutura CSS `mission-hud-{primary,orbit,apsides,secondary,footnote}` em lugar de uma grade uniforme de cards. Não houve mudança no `missionTelemetry` nem em física/câmera/saves. Estados reais de acompanhamento continuam fonte do cabeçalho; dados sem fonte permanecem N/D. Requer inspeção visual humana no próximo smoke.

### Preferências visuais de Fase 4

Interface inclui duas opções independentes no observatório (ênfase cinematográfica de notificações e redução automática após inatividade), persistidas como `orbiter.visual.v1`. Não mudam o schema de `orbiter.observatory.v2`, nem câmera, clock ou saves. O modo ambiente dedicado existente continua disponível; redução por inatividade é somente visual e reversível.

### Correção de preparação e acompanhamento de lançamento

`src/ui/mission-camera.ts` resolve a posição global da base de lançamento via `homeLaunchSite` + `sitePosition` + `positionsAt` (ou posição inicial imutável do plano V2). Selecionar a missão na agenda agora inicia acompanhamento da **base na superfície**, com enquadramento local inicial; no lançamento, o mesmo ID passa a seguir o símbolo físico da nave. `watch-launch` continua controlando apenas a redução do warp a 1×; não usa mais `trackBody` para centralizar o planeta na preparação. Se uma missão já está sendo acompanhada, a preparação de outra não sequestra a câmera. Testes puros em `tests/mission-camera.test.ts`; smoke humano pendente.

### Organização global de UI na Fase 4

`src/main.ts` reorganiza nós DOM existentes do Observatório em páginas **Corpos / Missões / Camadas**, com `aria-selected` e persistência independente de aba (`orbiter.observatory-tab.v1`). Não duplica AP/PE em histórico textual quando o HUD já fornece essa informação. Header agrupa controles de tempo e visualização sem mudar IDs ou eventos; rodapé mostra tempo, seed/corpos, missão acompanhada, status e ajuda de atalhos recolhível. A página Missões permanece disponível mesmo após seleção de outro corpo. Todos os botões originais continuam conectados aos seus handlers.
