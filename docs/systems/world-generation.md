# Geração planetária — As-Built

## Contrato atual
`generateWorld(seed)` em `src/simulation/world.ts` cria um `World` estático `schemaVersion: 1`, `generatorVersion: 1`; `seed` deve conter texto não vazio e ter até 120 caracteres. `seededRandom` em `src/core/random.ts` usa hash FNV-1a e sequência Mulberry32, inicializada com prefixo `orbiter:v1:`. A sequência é determinística, mas depende da ordem das chamadas ao gerador; mudanças no algoritmo/ordem alteram o universo de uma seed.

`World` contém estrela fixa `star-0`/Helion (raio 6,96×10⁸ m), 4–6 planetas Astra A–F, até três luas por planeta e 360 pontos de cinturão. IDs dos planetas seguem `planet-1` etc.; luas têm IDs derivados do planeta. `Body` é `Readonly` com `id, name, kind, parentId, radius, color, orbit`; estrela não possui órbita. Os planetas começam em distância entre 0,34 e 0,48 AU; os semieixos subsequentes crescem por multiplicadores entre 1,48 e 1,88; excentricidades entre 0,01 e 0,18. Luas têm semieixos proporcionais ao raio do planeta, excentricidades abaixo de 0,09 e período calculado com parâmetros gravitacionais aproximados em dois níveis.

Raio, cor, excentricidade e fase são gerados, **não são** medições de habitabilidade, composição ou população. Os 360 pontos do cinturão são posições gráficas fixas, não asteroides individuais simulados. `AU = 149597870700` m. Distâncias, raios e tempos de órbita usam SI; fases e ângulos são radianos.

## Interfaces, testes e limites
`generateWorld(seed): World` alimenta o render, o observatório e subsistemas posteriores. `positionsAt(world,t)` avalia posições absolutas em m usando órbitas relativas aos pais, sem mutação; o algoritmo presume que pais apareçam antes de filhos no array. O render não modifica `World`.

`tests/simulation.test.ts` verifica repetibilidade/diferença entre seeds, 4–6 planetas, máximo de três luas, 360 pontos e posições finitas em tempos distintos. Não há garantia de plausibilidade dinâmica das luas em longo prazo, estabilidade por interações múltiplas nem versionamento automático do gerador. Alterar geração exige tratar compatibilidade de identidade dos saves regenerativos e dos sistemas posteriores.

Referências: `src/core/random.ts`, `src/simulation/world.ts`, `src/simulation/orbits.ts`; ADR-0002, ADR-0003, ADR-0005; Fase 1 / PR #2.
