# Backlog vivo de produto

Não é uma lista de promessas. Ideias entram aqui primeiro, recebem triagem no gate entre fases e só então viram issues implementáveis. Usar `now / next / later / parking-lot` e manter IDs estáveis.

| ID | Ideia / resultado para o usuário | Horizonte | Fase candidata | Estado |
|---|---|---|---|---|
| IDEA-001 | Acompanhar uma nave com telemetria contextual | next | 2–4 | capturada |
| IDEA-002 | Detritos orbitais com consequências reais | later | 4–7 | capturada |
| IDEA-003 | Comunicações com atraso e ocultação por planeta | later | 4–6 | capturada |
| IDEA-004 | Descobertas dependem de instrumentos e exploração | later | 3–6 | capturada |
| IDEA-005 | Famílias de foguetes com confiabilidade aprendida | later | 3–4 | capturada |
| IDEA-006 | Arqueologia espacial e patrimônio de missões | later | 5–7 | capturada |
| IDEA-007 | Recuperar histórico e rever missões antigas | later | 5–7 | capturada |
| IDEA-008 | Ajuste automático de aceleração próximo de eventos importantes | later | 5 | capturada |
| IDEA-009 | Revisitar intervalo simulado ao retornar de outra sessão | parking-lot | 7+ | capturada |
| IDEA-010 | Intervenções opcionais em asteroides e condições iniciais | later | 6+ | capturada |
| IDEA-011 | Observar órbitas de luas com zoom/foco automático | next | 2 | capturada |

## Template de captura

```markdown
### IDEA-012 — Nome breve
- **Origem:** fase / feedback do humano / observação do agente
- **Experiência desejada:** o que o observador verá/fará
- **Motivação:** por que melhora o universo
- **Risco/dependências:** sistemas afetados, custo provável
- **Triagem:** now | next | later | parking-lot
- **Status:** capturada | aceita | descartada | entregue
- **Issue/PR:** (somente se promovida)
```

## Regra

Se for correção de bug que bloqueia critério da fase atual, registrar na issue/PR da fase e classificar `now`. Nenhum item `later` deve entrar na implementação por entusiasmo do agente.
