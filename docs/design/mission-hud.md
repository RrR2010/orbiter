# HUD contextual de missão

## Estados

Sem seleção: não desenhar cartão de missão. Selecionada: exibir nome, civilização/corpo de origem quando disponível, fase real, telemetria e ações de foco/follow. Acompanhada: realçar discretamente estado de follow, sem alterar a física ou bloquear drag/zoom.

## Hierarquia

**Primária, com peso equivalente:** altitude instantânea sobre a superfície do corpo de referência; velocidade com referencial explícito; propelente restante (massa e/ou fração); AP/PE (atuais e alvo quando disponíveis).  
**Secundária:** massa atual, delta-v restante, Isp, tempo decorrido e indicadores de estado.  
**Analítica:** dados atuais, previstos e alvo separados. Mostrar `N/D` sempre que não deriváveis com segurança.

## Semântica

Não confundir altitudes com distâncias ao centro, velocidade planetocêntrica com heliocêntrica, propulsão nominal com real, perfil guiado com previsão puramente balística. AP e PE devem registrar corpo de referência; PE abaixo da superfície não ganha valor falso. Não apresentar inclinação tridimensional em sistema 2D. `Isp` e `delta-v` requerem massa, propelente e motor realmente disponíveis.

## Lançamentos simultâneos

Agenda usa dados de scheduler persistido. Missão marcada para acompanhar = intenção de observação, não ordem de lançamento. Avisos são discretos; múltiplos candidatos são listados, não provocam salto arbitrário da câmera. A política concreta de desempate e persistência de marcações precisa ser implementada e coberta por testes antes de declarar o recurso entregue.

## Testes necessários

Sem seleção, preparação, ascensão, coast, órbita, falha/impacto, valores N/D, diferenças de referencial, 1×/warp, modo ambiente, reload e conflito entre lançamentos.

## Refino instrumental aprovado (2026-10-25)

O PO pediu explicitamente um **HUD operacional em vez de dashboard de cartões**. `src/ui/hud-icons.ts` fornece SVGs semânticos originais para altitude, velocidade, propelente, AP, PE, massa, ΔV e Isp; `renderMissionPanel` compõe faixa primária (ALT, VEL, propelente), par orbital AP/PE (atual e alvo) e faixa secundária (massa, ΔV, Isp). O CSS utiliza divisórias finas e menos blocos retangulares, preservando valores tabulares e estados N/D. Ícones não carregam significado exclusivamente pela cor e são decorativos, pois os rótulos textuais permanecem.

Futuro: sprite sheet das naves com LOD distante/glifo, médio/vetor, próximo/sprite, sujeito a implementação e testes próprios; não implica alterar física ou persistência.
