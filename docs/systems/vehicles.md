# Veículos e capacidade de propulsão — As-Built (Fase 3)

## Fonte e contrato
`src/simulation/spaceflight/vehicle-capability.ts` define `VehicleCapability`: `technologyStage`, `experience`, `dryKg`, `fuelKg`, `ispS`, `thrustN`, `initialTwr`, `deltaVMs`, `guidanceError`, `reserveFraction`. `designVehicle(planet,stage,knowledge,variation)` é determinística; valida estágio inteiro 0–4, conhecimento não negativo e variação em [0,1].

## Dimensionamento
Experiência `e=min(1,log2(1+knowledge/3000)/4)`; avanço `a=0.72*(stage/4)+0.28*e`. Massa seca `650-230a` kg; combustível `1250+750a` kg. Gravidade de superfície `g=mu/r²`; velocidade circular de referência na altitude `max(120000,0.025r)`. Isp base é `max(280,(1.1*vCircular+85g)/(9.80665*ln(1900/650)))` s e sobe por fator `1+0.35a`. TWR inicial `1.5+0.35a+0.16*(variation-0.5)`; empuxo `(dry+fuel)*g*TWR` N. Capacidade teórica `deltaV=Isp*9.80665*ln((dry+fuel)/dry)` m/s. Erro de guiagem `0.16*(1-0.75a)`; reserva `0.15+0.14a`.

## Integração e limites
`createAutonomousFlightV2` sorteia a variação e a perturbação de guiagem com RNG de seed+missão e fixa os valores no plano. Subida utiliza empuxo integral e reserva; inserção usa `0.35*thrustN`. `integrator.ts` consome combustível via empuxo/Isp e respeita massa seca. O veículo não possui estágios separáveis modelados, componentes editáveis, atmosfera, aerodinâmica ou falha estocástica de peça. `tests/vehicle-progression.test.ts`, `tests/ascent-v2.test.ts`, `tests/spaceflight.test.ts`.
