# Mecânica de voo V2 — As-Built (Fase 3)

## Responsabilidade e unidades
Dinâmica 2D local ao planeta natal, posições em metros, velocidades em m/s, tempos em segundos simulados, massas em kg, empuxo N e parâmetro gravitacional mu em m³/s². Não há atmosfera, arrasto, n-corpos, transferência interplanetária ou modelo de pouso. `src/simulation/spaceflight/{types,gravity,integrator,conics,coast,ascent-v2,guidance-v2,executor-v2,flight-v2}.ts` formam a cadeia; visualização não decide desfechos.

## Plano e subida
`createAutonomousFlightV2` usa seed+ID, objetivo, planeta, tier, conhecimento, base `homeLaunchSite` e capacidade do veículo. Cria `AutonomousFlightPlanV2` versão 2. `resolveAutonomousFlightV2` inicia `executeAscentV2`, com passo nominal de 1 s, limite padrão de 1200 s, três perfis `vertical`, `gradual`, `tangential`. O gravity turn combina tempo, altitude, progresso até AP e velocidade radial; limita guinada tangencial em descida/baixa subida. Desliga ao atingir AP-alvo acima de altitude mínima, reservar combustível, impactar ou esgotar duração. Grava checkpoints temporais de subida.

## Mecânica orbital e inserção
`analyzeTrajectory` calcula energia específica, momento angular, excentricidade, PE/AP, semieixo e período; classifica cônica ligada, parabólica ou hiperbólica e `surfaceIntersecting`. `propagateCoast` resolve o problema de dois corpos por variáveis universais (Stumpff e iteração), com redução por período quando ligado. `propagateUntilImpact` faz amostragem limitada + bisseção temporal do primeiro cruzamento da superfície; impactos rasantes podem escapar da amostragem.

`decideGuidance` escolhe `raise-apoapsis`, `coast-to-apoapsis`, `raise-periapsis`, `goal-achieved`, `partial-orbit` ou `abort` conforme cônica e objetivo. `executeGuidanceV2` estima delta-v pela equação de foguete, centra a queima finita em torno do tempo do AP quando necessário (`start=max(now,AP-duração/2)`), usa passo nominal de 2 s e direção quase prógrada (fração 0,94 ao elevar PE); amostra checkpoints de manobra ~10 s e interrompe ao alcançar PE-alvo, impactar ou completar queima. É um controlador heurístico, não otimizador MechJeb.

## Resultado, amostragem e limites
O plano V2 retorna `AutonomousFlightResultV2` com `checkpoints`, `terminal`, `outcome`, `reason`, `orbital`, `goalAchieved`. Suborbital científica avalia AP e segue até impacto quando previsto. Inserção malsucedida com cônica cortando superfície é propagada até impacto antes de encerrar. `sampleAutonomousFlightWithPlanet` interpola visualmente trechos de queima entre checkpoints e usa conic analítica no coast; não integra por FPS. A previsão `rendering/predicted-orbit.ts` omite trechos subterrâneos, mostra AP/PE válidos quando missão está selecionada. LOD e históricos são limitados; não presumir robustez infinita de solver em órbitas degeneradas.

## Testes e extensões
`tests/{spaceflight,ascent-v2,guidance-v2,executor-v2,flight-v2,suborbital-impact,failed-insertion-descent,predicted-orbit,flight-view}.test.ts`. Benchmark não destrutivo `npm run benchmark:orbits` mediu propagação sintética; não mede FPS do Canvas ou scheduler de milhares de lançamentos. Extensões futuras exigem preservar determinismo entre warp, câmera e recarga.
