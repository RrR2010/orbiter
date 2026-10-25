# Evolução tecnológica — As-Built (Fase 3)

## Modelo implementado
A tecnologia é linear: `astronomy` → `rocketry` → `orbitalFlight` → `satellites`; `stage` varia de 0 a 4. `technology(c)` retorna o prefixo desbloqueado dessa sequência. Não existe árvore ramificada nem escolha de pesquisa pelo usuário.

## Algoritmo do scheduler
Em `src/simulation/civilization.ts`, enquanto `stage<4`, os eventos estratégicos tentam desbloquear a próxima tecnologia se `knowledge >= RESEARCH_COST[stage]`: custos [30,60,100,150]. Consome o custo, incrementa estágio e registra evento `research`. Intervalos básicos `RESEARCH_SECONDS=[900,1800,3600,7200]`; após desbloqueio agenda o próximo intervalo pelo novo estágio (ou recuperação de 172800 s se completo). Sem conhecimento suficiente, reage no próximo intervalo do estágio atual. Conhecimento cresce por minutos simulados inteiros a +0,45/min; a pesquisa precede lançamentos até completar estágio 4.

## Efeito físico
O estágio tecnológico (0–4), o conhecimento acumulado e a gravidade local alimentam `designVehicle(planet,stage,knowledge,variation)` de `src/simulation/spaceflight/vehicle-capability.ts`. A experiência é limitada a 1 e cresce como `min(1,log2(1+knowledge/3000)/4)`; o avanço combinado é `stage/4*0.72 + experience*0.28`. Evoluem massas, Isp, TWR, capacidade delta-v, erro de orientação e reserva de propelente. O plano persistido guarda a capacidade específica da missão, preservando fatos históricos. Detalhes em [veículos](vehicles.md).

## Interfaces / testes / limites
Tipos `Technology`, `Civilization.stage`, `Civilization.knowledge` e função `technology` em `civilization.ts`. `tests/civilization.test.ts`, `tests/vehicle-progression.test.ts`, `tests/space-program-evolution.test.ts`. Não há desbloqueios independentes, upgrades de infraestrutura, pesquisa paralela ou mecanismos de regressão tecnológica.
