# Mecânica orbital — As-Built

## Modelo e regras
`src/simulation/orbits.ts` define `Vec2 {x,y}` e `Orbit {semiMajorAxis,eccentricity,phase,periapsisAngle,period}` em 2D. `orbitalPeriod(a,mu)` retorna `2π √(a³/μ)`, com `a` em metros, `μ` em m³/s² e resultado em segundos. `orbitalPosition(orbit,t)` valida semieixo e período positivos, `0 ≤ e < 1` e valores finitos, calcula anomalia média a partir da fase e tempo reduzido módulo período, resolve a equação de Kepler `E - e sin(E) = M` com até 28 iterações Newton e tolerância de 1e-13, projeta a elipse e a gira por `periapsisAngle`. A saída é posição **relativa ao corpo pai**, em metros.

`positionsAt(world,t)` em `src/simulation/world.ts` soma as posições pai→filho para obter coordenadas absolutas em cada timestamp. A estrela permanece em (0,0); as luas acompanham posições calculadas dos planetas. O resultado é derivado do timestamp, sem integração numérica entre frames, N-body, perturbações, colisão, inclinação 3D ou evolução secular. Não confundir com a dinâmica de voo/veículos da Fase 3, documentada pelo responsável específico.

## Telemetria e render
`orbitalSpeed(body,time)` e `bodyTelemetry(body,world,time)` em `src/ui/observatory.ts` obtêm distância atual pai–filho e velocidade escalar **relativa ao pai** via vis-viva `v=√[μ(2/r−1/a)]`, onde `μ=4π²a³/T²` é inferido da órbita armazenada. Não representam velocidade absoluta ou vetorial. Corpo sem órbita retorna `null` para medidas não aplicáveis. O Canvas desenha caminhos orbitais por amostragem de até 96 segmentos por elipse, ajustados ao pai no timestamp; segmentos são visuais, não integração física.

## Verificações e extensões
`tests/simulation.test.ts` verifica fechamento numérico em e=0, 0,1, 0,6, 0,95 e 0,999, invalidação e coordenadas finitas. `tests/observatory.test.ts` verifica telemetria finita e campos indisponíveis. Não há simulação de massa própria de corpos por integração gravitacional. Ao incluir perturbações, preservar contrato de unidades e distinguir previsões de estados físicos efetivamente calculados.

Referências: `src/simulation/orbits.ts`, `src/simulation/world.ts`, `src/ui/observatory.ts`, `src/rendering/canvas.ts`; ADR-0003; Fases 1–2.
