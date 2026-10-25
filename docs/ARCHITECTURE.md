# Arquitetura de referência (baseline, revisável via ADR)

## Stack alvo inicial

TypeScript strict + Vite + Canvas 2D + CSS/HTML + Vitest. Sem framework UI obrigatório no início. Dependências novas precisam de justificativa. Avaliar PixiJS/WebGL apenas sob evidência de gargalo. Executar no navegador moderno, inclusive fullscreen.

## Organização prevista

```text
src/
  core/{clock,events,random,state,math}
  simulation/{celestial,world}
  rendering/{camera,layers,effects}
  narrative/{history,director}
  persistence/
  ui/
  app/
tests/{unit,integration,scenarios}
docs/phases/
```

Criar diretórios somente quando houver implementação real; não gerar dezenas de arquivos vazios.

## Fluxo unidirecional

`configuration + seed -> simulation clock -> deterministic systems -> world state + domain events -> read-only view model -> renderer / UI / narrative observations`.

Simulação não importa Canvas, DOM, `Date.now()`, timers ou componentes UI. UI emite *commands* validados, nunca modifica estado diretamente. Narrativa só escolhe relevância e apresentação, não altera fatos.

## Núcleo mínimo

- `WorldState`: objetos com IDs estáveis, unidades explícitas e versão de schema.
- `SimulationClock`: tempo simulado monotônico, pausa e controles de warp; render desacoplado.
- `SeededRandom`: gerador reproduzível para geração e eventos; streams independentes por subsistema para evitar acoplamento acidental.
- `DomainEvent`: `id,time,type,entityIds,payload,causeId?`; registrar eventos relevantes em vez de posições a cada frame.
- `WorldGenerator`: a mesma seed e mesma versão do gerador reproduzem o mesmo estado.
- `SimulationEngine`: avança por passos físicos/eventos sem depender de `requestAnimationFrame`.
- `Renderer`: consulta snapshot/view model; desenha, não modifica.

## Física — compromisso de fidelidade

- Corpos grandes: elementos orbitais keplerianos; posições avaliáveis por timestamp.
- Sistema inicial 2D plano; coordenadas de simulação em SI (m, s, kg), projeção em pixels isolada na câmera.
- Excentricidade e inclinação: no 2D inicial, excentricidade suportada; inclinação 3D reservada ao futuro.
- Interações orbitais e evolução secular: não fingir suporte na Fase 1; propostas para fases posteriores com aproximações ou integrações locais.
- Objetos numerosos: renderização/estatísticas agregadas sem granularidade física falsa.
- Missões futuras: patched conics com impulsos de delta-v; aproximações declaradas, conservação e tolerâncias testáveis.

## Tempo e desempenho

- Render alvo 60 fps em máquina de desenvolvimento comum, com degradação elegante.
- Física, render e economia trabalham em frequências diferentes.
- Warp não deve saltar eventos agendados; processamento orientado a próximos eventos quando aplicável.
- Fase 1 pode usar simulação e renderização na thread principal com fronteira clara; Web Worker só se medição justificar.
- DPR, resize, canvas pixel scaling e visibilidade de aba precisam de tratamento consciente.

## Persistência

- Fase 1: formato versionado + `localStorage` para configuração/seed e estado mínimo; a implementação decide IndexedDB se necessário, documentando motivo.
- Snapshots e event log em evolução posterior; schema migration obrigatória antes de alterar formatos persistidos.
- Falha de armazenamento nunca deve inutilizar a tela: informar usuário e permitir reiniciar com segurança.
- Não armazenar frames ou posição orbital em tempo real quando posição puder ser derivada do tempo.
- Seeds, versões, eventos e configurações devem ser suficientes para diagnósticos reproduzíveis; não prometer replay exato até haver testes.

## Limites de módulos

- `core` sem dependências de apresentação.
- `simulation` depende de `core`, não de `rendering` nem `ui`.
- `rendering` recebe estado imutável e câmera.
- `narrative` observa eventos e estado, sem introduzir causalidade fictícia.
- `persistence` serializa/valida versões de estado.
- `app` integra subsistemas.

## Qualidade

- Testes determinísticos: mesma seed e tempo -> mesmos elementos/posições; variação de FPS não muda estado.
- Invariantes: distâncias finitas, excentricidade válida, órbitas fechadas quando apropriado, nenhuma coordenada NaN.
- Teste de persistência: salvar/recarregar não muda identidade nem tempo.
- Benchmarks reproduzíveis e sem promessas não medidas.
- Desenvolver fallback para WebGL não é requisito nesta etapa.
