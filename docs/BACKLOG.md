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
| IDEA-011 | Observar órbitas de luas com zoom/foco automático | next | 2 | entregue no PR #4; foco local e follow |
| IDEA-012 | Desacelerar automaticamente antes de eventos previstos, com prioridade, aviso e opção de cancelar | later | 4–5 | capturada; depende de eventos agendados reais |

## Template de captura

```markdown
### IDEA-013 — Nome breve
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

### IDEA-013 — Satellite selection and camera follow
- **Origem:** Fase 3, integração inicial
- **Experiência desejada:** selecionar o veículo/satélite diretamente no Canvas e acompanhar trajetória representacional com inspector específico
- **Motivação:** observabilidade durante missão
- **Risco/dependências:** generalização do seletor e do follow; cuidar para não misturar trajetória representacional e física
- **Triagem:** now
- **Status:** pendente de conclusão do gate A4 da Fase 3


### IDEA-014 — Agenda global multi-civilização
- **Origem:** Discovery Fase 4, desejo de lançamentos paralelos.
- **Experiência desejada:** priorização clara entre lançamentos de civilizações diferentes, com fila visual de observação.
- **Motivação:** manter controle de atenção sem teleporte de câmera.
- **Risco/dependências:** existência efetiva de múltiplas civilizações e scheduler global, ausentes da Fase 3.
- **Triagem:** later
- **Status:** capturada; **não implementada** na Fase 4.

### IDEA-015 — Modos de câmera e miniaturas de navegação
- **Origem:** mockup visual aprovado, com cartões de visões e mapa de manobra.
- **Experiência desejada:** acesso rápido a visões distintas sem confundir representações.
- **Risco/dependências:** estados e referencial de câmera adicionais; mapa de manobra requer dados físicos reais.
- **Triagem:** later
- **Status:** capturada; não implementar a partir de arte ilustrativa.


### IDEA-016 — Atlas de naves com LOD visual
- **Origem:** feedback do PO durante refinamento da Fase 4.
- **Experiência desejada:** glifo distante, silhueta intermediária e sprite em zoom próximo, preservando reconhecimento e orientação física 2D.
- **Risco/dependências:** atlas original, política de escala e fallback vetorial, consistência de picking e performance.
- **Triagem:** later
- **Status:** capturada; sprites definitivos não implementados neste refinamento.
