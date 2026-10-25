# Registro de decisões arquiteturais e de produto

Registrar decisões não triviais com motivo, alternativas e consequências. Não reescrever decisões antigas: acrescentar substituições com referência.

## ADR-0001 — Baseline de produto (2026-10-24)

**Estado:** aceita. **Decisão:** física híbrida (realista com aproximações); observador com intervenções opcionais; um sistema planetário e uma civilização inicial; persistência entre sessões; 2D top-down. **Motivo:** equilíbrio entre visual atraente, profundidade emergente e implementação incremental. **Consequência:** 3D, múltiplos sistemas e simulação física irrestrita não bloqueiam MVP.

## ADR-0002 — Simulação separada do desenho (2026-10-24)

**Estado:** aceita. **Decisão:** engine determinística isolada de Canvas/DOM e FPS; tempo e seed explícitos. **Motivo:** testabilidade, persistência, warp e evolução de longa duração. **Consequência:** UI opera via comandos e snapshots.

## ADR-0003 — Mecânica celeste inicial (2026-10-24)

**Estado:** aceita para Fase 1. **Decisão:** elementos orbitais keplerianos para planetas/luas em 2D, sem interação N-body contínua. **Motivo:** render estável e avanço temporal barato. **Consequência:** perturbações e colisões ficam para fases posteriores, com modelos próprios claramente explicados.

## ADR-0004 — Entregas faseadas e backlog protegido (2026-10-24)

**Estado:** aceita. **Decisão:** um agente executor por fase; PR com evidência; revisão de gate antes de avançar; ideias novas capturadas sem scope creep. **Motivo:** continuidade de um projeto vibecoded entre contextos independentes. **Consequência:** documentos versionados são autoridade operacional, não chats.

## Novo ADR (template)

```markdown
## ADR-XXXX — Título (AAAA-MM-DD)
**Estado:** proposta | aceita | substituída.
**Contexto:** problema concreto.
**Opções:** alternativas consideradas.
**Decisão:** escolha e alcance.
**Motivo:** razões.
**Consequências:** vantagens, custos, migração, compatibilidade.
**Substitui:** ADR anterior, se aplicável.
```
