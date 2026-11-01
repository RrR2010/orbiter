# Avaliação tecnológica — Fase 6 (pesquisa em 2026-10-31)

**Decisão recomendada:** manter TypeScript + Canvas 2D no momento; separar refatoração física da apresentação. Não instalar dependências sem prova de valor. Avaliação de licenças é triagem técnica, não parecer jurídico; revisar LICENSE/NOTICE e dependências transitivas antes de uso.

## Render/UX

| Opção | Licença, evidência | Maturidade/manutenção | Benefício | Custo/riscos de integração | Recomendação |
|---|---|---|---|---|---|
| Canvas 2D atual | API Web nativa; já em `rendering/canvas.ts` | estável via navegadores | custo zero, fallback e controle total | CPU e desenho manual, precisa medir | **reter**; otimizar draw/LOD/picking primeiro |
| PixiJS v8 | MIT; [repo/releases](https://github.com/pixijs/pixijs/releases), versão v8.21.0 publicada em 2026 | ativo, releases recentes | GPU batching e filtros/sprites | transformação de câmera, picking, contexto WebGL/WebGPU, acessibilidade HUD segue HTML | **candidato a spike isolado após profiling** |
| Phaser | MIT; [oficial](https://phaser.io/download/license), [repo](https://github.com/phaserjs/phaser) | framework maduro de jogos | cenas, input, assets | ciclo de engine/game e física Arcade não são astrodinâmica; overhead conceitual | não adotar como núcleo |
| Godot | MIT; [oficial](https://godotengine.org/license/) | engine madura e ativa | tooling, efeitos, editor e portabilidade | migração estrutural de TypeScript/DOM, saves e build web; lock-in de runtime/editor | não adotar na consolidação |

## Matemática, científica e runtimes

| Opção | Licença/fonte | Adequação | Risco/custo | Decisão |
|---|---|---|---|---|
| Funções TS/JS existentes | código interno; `coast.ts`, `conics.ts`, `interplanetary-lambert.ts` | alta: regressões locais e sem FFI | manutenção dos solvers numéricos | **reter e testar contra oráculos** |
| gl-matrix | MIT, [repo](https://github.com/toji/gl-matrix) | vetores/matrizes úteis sobretudo rendering/WebGL | precisão: rotinas típicas usam Float32Array; avaliar double para SI astronômico | opcional para render; não migrar propagação por padrão |
| math.js | Apache-2.0, [repo](https://github.com/josdejong/mathjs) | álgebra genérica/unidades e prototipagem | footprint, performance e NOTICE; repo aponta código derivado CSparse LGPL-2.1+ — revisar distribuição | uso auxiliar, não dependência essencial do loop |
| WASM Rust/C/C++ | licença depende do módulo | solver isolado com hotspot pesado | interface JS/WASM, copy, determinismo, toolchain e debug | adiar até profiler mostrar ganho líquido |
| SciPy Python | BSD-3-Clause, [projeto](https://scipy.org/), [license](https://github.com/scipy/scipy.org/blob/main/LICENSE) | referência independente de integração/raízes/otimização para golden fixtures | pipeline offline e versionamento de parâmetros | **recomendado apenas como oráculo de testes offline** |
| poliastro Python | MIT, [repo](https://github.com/poliastro/poliastro) | inspiração e testes históricos orbitais | **repositório arquivado**; sem manutenção futura | não incorporar como dependência |
| Orekit Java | Apache-2.0 (verificar pacote transitivo e release no uso), [projeto](https://www.orekit.org/) | toolkit astrodinâmico robusto para benchmarks externos | Java + bindings/FFI e modelo tridimensional pesado para 2D browser | somente oráculo opcional offline |

**Não confundir biblioteca de render/Arcade Physics com motor gravitacional orbital**; qualquer solver substituto deverá atingir equivalência numérica e ter modelo explícito. Para bibliotecas não instaladas, versões/compatibilidade são sinais de pesquisa pública, não resultado de execução no Orbiter.

## Critérios para experimentar, com decisão mensurável

- Baseline antes: traces do Canvas em 1× e warp alto, DPR 1/2, 100/1.000 entidades renderizadas por fixture sintética, FPS mediano e p95 frame time, heap, custo de zoom/picking, cold load. Dados inexistentes = não alegar ganho.
- Spike Pixi sem integração: reproduzir o mesmo snapshot de draw, câmera, linhas de trajetória, zoom extremo, seleção e accessibility via DOM, com build independente; medir ganho de p95 render >=25% e ausência de regressões de legibilidade/memória como limiar **proposto**.
- Spike solver/WASM: comparar resultados double, determinismo entre browsers, custo total incluindo bridge e startup e ganho >=2× em hotspot mensurado; se não atingir, manter TS.
- Licenças: registrar LICENSE/NOTICE (inclusive dependências transitivas), compromisso de redistribuição, lockfile, política de atualização, auditoria de segurança e fallback antes de merge.

## Fontes e limitações

[Pixi releases](https://github.com/pixijs/pixijs/releases), [Phaser MIT](https://phaser.io/download/license), [Godot MIT](https://godotengine.org/license/), [gl-matrix](https://github.com/toji/gl-matrix), [math.js](https://github.com/josdejong/mathjs), [SciPy](https://scipy.org/), [poliastro arquivado](https://github.com/poliastro/poliastro). Conferência documental de fontes em 2026-10-31; sem benchmark, PoC, instalação ou troca de stack na Fase 6. O tamanho, precisão e suporte exato por plataforma devem ser validados antes de adoção.
