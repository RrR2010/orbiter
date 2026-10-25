# Linguagem visual — Mission Control

## Prioridades

1. Universo ocupa a maior área visual, sem overlays obrigatórios em visão geral.
2. Seleção ativa instrumentação legível em segundos.
3. Dados físicos são mais importantes que ornamentação; não sobrepor nave, órbita selecionada ou controles.
4. Cor denota papel, **nunca** substitui forma, legenda ou texto.

## Tokens propostos — verificar na implementação

| Papel | Referência |
|---|---|
| Fundo profundo | `#060D19` |
| Superfície de painel | `#101D2D` |
| Borda discreta | `#294057` |
| Texto principal | `#E5EDF6` |
| Texto secundário | `#9EB1C7` |
| Seleção/trajetória ativa | `#59C8DF` |
| Operação nominal | `#6BD3BE` |
| Atenção/objetivo | `#E4AC5D` |
| Falha/impacto | `#E47779` |

Valores preliminares, sujeitos a ajustes por contraste e renderização real. Preferir fontes disponíveis no navegador e fallback local; nenhuma dependência de CDN é exigida.

## Densidade e layout

- **Panorama:** ênfase no Canvas, controles de tempo persistentes, painel de observatório recolhível.
- **Missão selecionada:** HUD contextual na lateral livre; telemetria principal em grupo equilibrado, secundária recolhível, agenda independente da seleção.
- **Tela estreita:** cartões colapsam, mantendo controles críticos acessíveis e sem cobrir o alvo.
- Estados: sem seleção, preparando, ascendendo, coast/inserção quando o estado físico diferenciar, órbita, perda/impacto e dado indisponível.
- Tipografia monoespaçada/tabular em números quando possível, valores e unidades inseparáveis; distinguir atual/alvo/previsto semanticamente.
- Camadas orbitais: baixa ênfase para órbitas gerais; destaque seletivo para conic real; indicação de direção independente da animação.
- Modo ambiente: recolher paineis e diminuir ruído; preservar alertas críticos discretos.
