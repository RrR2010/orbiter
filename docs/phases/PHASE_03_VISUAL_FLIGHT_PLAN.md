# Fase 3 — Plano técnico revisado: ecossistema espacial local

**Estado:** proposta de execução no PR #7; não substitui gates da Issue #6. **Autorização:** primeiras missões apenas no planeta natal; não iniciar Fase 4.

## Norte de experiência
Em zoom distante, visualizar sistema kepleriano. Ao aproximar-se do planeta natal, revelar relevo estilizado, base de lançamento, foguete, previsão orbital local, evento de queima, inserção, reentrada/impacto e satélites persistentes. A história deve ser inteligível sem abrir um log. UI compacta, com detalhe sob demanda. A simulação define fatos; arte e narrativa os representam.

## Decisões e limites do modelo físico

- Planetas/luas continuam analíticos, sem mudança de seed, ID ou órbita.
- Veículos usam dinâmica de dois corpos **relativa ao planeta natal**, em plano 2D, com estado `r,v,m` em SI e parâmetro gravitacional `mu=GM` explícito no modelo local. O gerador atual não tem massa planetária; criar regra estável e versionada para derivar `mu` por raio/densidade ou atribuir valores tipados sem alterar órbitas existentes. Registrar simplificação.
- Durante propulsão/atmosfera: integrar `dr/dt=v`, `dv/dt=-mu*r/|r|³ + thrust/m + drag/m` com passo fixo em **tempo simulado**, integrador semi-implícito ou velocity-Verlet apropriado e testes de conservação em coast. Guidance determinístico em marcos temporais/condições, com vetor de empuxo, `Isp`, consumo de propelente, `deltaV`, e perfil de gravity turn. Não rodar um integrador por frame de Canvas.
- Fora de queima e atmosfera: converter estado local `r,v` para elementos cônicos osculadores, propagar analiticamente no intervalo de coast. Calcular energia específica, momento angular, apoapsis, periapsis e excentricidade; trajetórias cujo periapsis cruza a superfície são **suborbitais com impacto previsto**, não órbitas permanentes. Prever evento de interseção/impacto sem presumir que toda órbita é elipse (energia >=0 implica escape/parábola/hipérbole; limitar nesta fase).
- Primeira fase de lançamento: plataforma fixa na superfície de um planeta 2D; orientar posição inicial com ângulo da base e rotação superficial simplificada (documentar quando negligenciada). Foguetes só operam em torno da origem; nenhuma transferência interplanetária.
- Sucesso e falha decorrentes de combustível, empuxo, perfil de guidance, integridade e eventos discretos de confiabilidade amostrados **uma única vez por missão/estágio** de stream independente. Resultado é consequência do estado e limites (ex.: periapsis > superfície+altitude mínima e energia ligada por janela estável); jamais pré-sortear sucesso e depois fingir física. Diferentes seeds/tier geram variabilidade reproduzível.
- Fluxo: queued -> ignition -> ascent -> ballistic/coast -> insertion burn -> orbiting | reentry | impact | failure. Outros resultados só se justificados por modelo/testes.
- Scheduler mantém `targetTime` pendente, processa em ordem `(time,priority,id)`, integra trechos limitados por orçamento sem descartá-los; pausa não cria novo tempo, mas conclui débito já adquirido. Warp alto pode reduzir **velocidade real de acompanhamento**, nunca pular eventos. Visual tem marcador/hold de alguns segundos reais sem congelar a evolução factual.
- Prevenir custo infinito em warp 1e6: integrar somente durante janelas de queima/atmosfera e propagar coast analiticamente; cap explícito de trabalho por frame, fila de eventos e limites para objetos/eventos.
- Satélite persistente usa estado orbital local real, em SI, renderizado por `planetAbsolutePosition(t)+localOrbitalPosition(t)`. Cap e agregação determinísticos para missões históricas.

## Sprites e LOD

**Pipeline padrão:** SVG vetorial próprio -> PNG RGBA individual -> atlas PNG(s) + JSON de metadados. Render usa `drawImage` com UV retangular e pivô, com fallback vetorial. Não depender de CSS sprites nem de corte manual em runtime. Gerar atlas por script reprodutível (Canvas/Sharp se justificado, ou Python/Pillow como ferramenta de autoria **fora do bundle**), com padding extrudado de 2–4 px para evitar bleeding, atlas power-of-two quando vantajoso e manifest com versão/hash. Arquivos originais editáveis ficam em `assets/source/`; artefatos finais em `public/assets/`. Não adicionar milhares de texturas na primeira fase.

**Manifest:** `id,atlas,rect:{x,y,w,h},sourceSize:{w,h},pivot:{x,y},metersPerUnit?,category,lod,frames?,frameDuration?`. Coordenadas em pixels; pivô normalizado [0,1]; `sourceSize` é dimensão sem trim. Consistência da seleção via bounding geometry em coordenadas do mundo, não via alpha pixel do sprite.

**Tamanhos iniciais sugeridos, não físicos:** planetas 256–512 px RGBA por variante; foguetes 64×128 (3 tiers), satélites 48–96 px, base 64–128 px, protoestação apenas asset reservado. Separar textura de superfície planetária (albedo) da iluminação (terminador por máscara/camada Canvas). Paleta procedural determinística por seed com variações limitadas. Asset não muda identidade física.

**LOD com histerese:** distante corpo com símbolo/círculo existente; médio planeta texturizado; próximo textura+marcadores de superfície+naves+órbitas locais. Critério pela projeção em pixels do **raio físico**, não pela distância orbital nem pelo nome do planeta. Blend suave e limiares de entrada/saída diferentes para não oscilar. `cameraScale` continua fonte única de metros/pixel. Nunca aumentar o raio físico só para caber a arte; naves/bases usam `minScreenPx/maxScreenPx` declarados e marcador visual separado da geometria física.

**Base fixada ao planeta:** armazenar `surfaceLongitudeRad` (ângulo no plano 2D), `altitudeM`, `planetId`, `siteId`; calcular `position=planetCenter+(radius+altitude)*[cos(theta(t)),sin(theta(t))]`, incluindo rotação do planeta apenas se modelo explícito. Sprite ancorado pela origem inferior no ponto da superfície, girado pela normal local e renderizado acima/atrás do disco segundo geometria 2D. Base não é textura pintada no planeta. Mesmo contrato servirá para alvos de pouso futuros, mas pouso controlado fora do gate atual.

## Módulos e ordem

### Bloco A — contrato e ensaio orbital
- `simulation/spaceflight/{types,gravity,integrator,conics,guidance,engine}.ts`; `tests/spaceflight*.test.ts`.
- Ensaios: queda livre, impulso circular, órbita elíptica, suborbital intercepta superfície, conservação em coast, resultados invariantes à partição de `advance`, warp e seed. Testar injeção com combustível insuficiente.
- Descontinuar resultado sorteado a priori da implementação provisória preservando uma migração explícita de `civilization.v1` e compatibilidade com saves Fase 1/2. Não reescrever desfechos históricos; marcar missões legadas como `legacy` e manter seus fatos.

### Bloco B — estado orbital persistente
- Estender missões com estágios/veículos e plano de queimas versionados; scheduler em `core/events` ou `simulation/spaceflight/scheduler`.
- Estabelecer IDs estáveis para base, veículo, satélite; arquivamento de históricos e limites. Testar save/reload durante ascensão, burn e coast; evitar duas fontes de verdade para o tempo.

### Bloco C — pipeline de arte
- Criar `assets/source`, gerador de atlas, manifest JSON, loader + fallback Canvas em `rendering/assets`.
- Primeiro lote funcional: dois visuais de planetas + três foguetes tecnológicos + um satélite + uma base, com pivôs/metadados e licença/autoria documentados. O autor de assets é o executor; GIMP fica opcional para retoque/máscara/alpha e revisão visual humana. Evitar arte complexa antes da validação da projeção.

### Bloco D — render macro/micro
- `rendering/planet-lod.ts`, `rendering/local-space.ts`, `rendering/trajectory.ts`, `rendering/pick-local.ts`.
- Renderer lê snapshot e projeta SI; desenha arcos previstos do estado orbital real (traço aberto em suborbital, fechado em órbita), nave e efeito de estágio. Eventos de explosão são visuais vinculados a `eventId`.
- Follow usa posição física da nave em coordenadas absolutas (sem atraso persistente), zoom manual permanece livre.

### Bloco E — UX e validação
- `ui/space-program.ts`: cartão compacto com planeta, tier, missão ativa, contagem de satélites e último evento em duração legível. Histórico detalhado em expansão; nenhum timestamp bruto no painel padrão. Clique na nave/órbita abre inspector contextual.
- Demostração: observar foguete partir de base, arco expandir com aceleração, alcançar ou perder órbita, continuar acompanhando satélite; reload durante missão; warp, pausa, focus, ambient e zoom da Fase 2 intactos.
- `npm ci`, `npm run validate`, `npm audit`, benchmark longo local, smoke visual humano, revisão. **Somente após tudo verde:** CI manual workflow_dispatch no HEAD definitivo; squash merge, issue encerrada e handoff.

## Critérios mensuráveis
1. Sem comando humano, primeiro lançamento ocorre em tempo simulado de demonstração e produz trajetória local visível.
2. No zoom próximo, o planeta apresenta LOD superior, a base aparece fixa à superfície e nave/satélite são selecionáveis.
3. Duas missões com perfis/condições distintos produzem pelo menos um caso orbital e um suborbital/falha, com apoapsis/periapsis coerentes com `r,v`, sem animação contraditória.
4. Mesma seed + estado + tempo/ações => mesma sequência de fatos, independentemente de FPS, partição, reload e orçamento de processamento.
5. Saves antigos entram sem perda da parte astronômica; saves de protótipo Fase 3 recebem migração explícita, preservando resultados registrados.
6. Nenhum objeto/efeito tem tamanho físico artificial inflado; ícones com mínimo em pixels ficam declarados como símbolos.
7. Missões longas não geram arrays/entidades sem limite; simulação prolongada reproduzível.
8. Painel padrão não apresenta segundos absolutos gigantes nem dez botões históricos de uma vez.

## Fora do escopo deste PR
Transferências interplanetárias, docking, estações construídas, logística de bases, n-corpos gravitacionais, múltiplas civilizações, pousos guiados e editor de foguetes. Arte para estações/múltiplas bases pode ser planejada no atlas, mas criação como entidade funcional requer fase autorizada.

## GIMP (opcional)
O executor deve gerar sprites e metadados, validar recortes e transparência, e enviar prévias ao humano. Intervenção manual opcional: limpar bordas, corrigir alpha, ajustar alinhamento/pivôs ou retocar visuais. Exportações sempre transparentes em sRGB, escala 1× do atlas, sem reamostragem não registrada. Nunca depender de arquivo .xcf para render runtime.
