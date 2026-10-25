# Orbiter

**A living universe, unfolding.** Um ecossistema espacial autônomo, observável e persistente, que produz histórias emergentes por meio de astronomia, exploração espacial e evolução tecnológica.

**Estado (25/10/2026):** Fases 1 e 2 integradas. Fase 3 (Primeira Era Espacial) implementada no [PR #7](https://github.com/RrR2010/orbiter/pull/7), em auditoria pré-merge. A fase ainda **não** foi integrada à `main`. Consulte `docs/PROJECT_STATUS.md` para os gates pendentes.

## Decisões de produto

- Física híbrida: modelos realistas com aproximações explícitas.
- Usuário observador, com intervenções opcionais.
- Escopo inicial: um sistema planetário com uma civilização.
- Persistência entre sessões.
- Visualização 2D top-down em HTML/Canvas; fullscreen e experiência passiva como prioridades.
- O universo evolui sem intervenção; o usuário pode acompanhar histórias, missões e consequências.

## Rodar localmente

Requer Node.js 22.12 ou superior.

```bash
npm ci
npm run dev
```

Validação local: `npm run validate` (lint, typecheck, testes e build). No observatório, selecione uma missão para destacar sua órbita e exibir AP/PE; o comando `orbiterDebug()` no DevTools apresenta checkpoints de voo. A opção de monitoramento do próximo lançamento reduz automaticamente o warp para 1× durante a preparação.

O simulador utiliza física orbital 2D e missões V2; os mundos e saves experimentais V1 não são migrados. Veja [o contrato V2](docs/phases/PHASE_03_V2_AUTONOMOUS_FLIGHT.md).

## Por onde começar

**Humano:** leia [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) e abra a issue da fase ativa. Entregue ao próximo agente: “Leia AGENTS.md, docs/PROJECT_STATUS.md e o arquivo da fase ativa; implemente apenas o escopo da fase, execute os testes, abra PR e entregue o relatório de handoff.”

**Agente:** leia [AGENTS.md](AGENTS.md) antes de editar qualquer coisa. Contratos de produto e implementação estão em [docs/PRODUCT_VISION.md](docs/PRODUCT_VISION.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/ROADMAP.md](docs/ROADMAP.md) e [docs/WORKFLOW.md](docs/WORKFLOW.md).

**Arquiteta-orquestradora (retorno entre fases):** revisar PR e evidências, comparar critérios de aceite, decidir continuar/corrigir/replanejar e atualizar status, backlog e decisões.

## Navegação

- [Estado e próxima ação](docs/PROJECT_STATUS.md)
- [Visão e princípios do produto](docs/PRODUCT_VISION.md)
- [Arquitetura técnica e contratos](docs/ARCHITECTURE.md)
- [Roadmap e gates de qualidade](docs/ROADMAP.md)
- [Fase 1: planetário vivo](docs/phases/PHASE_01.md)
- [Fase 3: voo autônomo V2](docs/phases/PHASE_03_V2_AUTONOMOUS_FLIGHT.md)
- [Protocolo de handoff e mudanças](docs/WORKFLOW.md)
- [Backlog vivo de ideias](docs/BACKLOG.md)
- [Registro de decisões](docs/DECISIONS.md)

**Fonte de verdade:** documentos versionados no GitHub e issues/PRs do repositório. Conversas com agentes são transitórias. Nunca considerar concluída uma fase apenas pela resposta do agente.
