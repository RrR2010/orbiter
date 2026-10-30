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

## Arquitetura global da interface — refinamento do PO

A Fase 4 passa a tratar **toda a UX observatória**, não somente HUD. Responsabilidades na branch:
- **Header:** identidade e seed, criação de universo; grupo explícito de tempo/warp; grupo de modos de visão, ambiente e fullscreen. Não repetir telemetria física.
- **Observatório à direita:** três páginas, **Corpos** (seleção/inspeção e foco/acompanhamento do corpo), **Missões** (programa, histórico resumido e opções visuais) e **Camadas** (filtros e velocidade da câmera). Seleção por Canvas e lista continua existente.
- **HUD à esquerda:** somente telemetria da missão acompanhada, sem duplicação no Observatório. AP/PE atual e alvo não são reimpressos na lista de missões.
- **Rodapé:** estado global resumido, tempo simulado, universo, missão em acompanhamento e última mensagem operacional; ajuda de atalhos sob demanda. Nunca virar segundo HUD.
- **Agenda:** lançamentos efetivamente conhecidos com opt-in, independente da nave selecionada.

A página ativa do Observatório usa `orbiter.observatory-tab.v1`, isolada de estado físico e saves V2. Esta é uma reorganização da UI; nenhum modo de voo, editor de missões ou gráfico novo foi criado. Manter largura estreita navegável por teclado e sem esconder capacidades existentes.

## Direção cinematográfica global — aprovada pelo PO (2026-10-29)

O PO aprovou uma segunda referência de acabamento de *mission control* para toda a UI, por considerar o resultado anterior semelhante a software SaaS. Na branch, o refino global usa superfícies noturnas com borda luminosa sutil, hierarquia tipográfica instrumental, navegador de corpos com glifos coloridos derivados de `Body.color`, controles no header e console inferior de status explícito. Não copiar nem prometer planeta 3D, minimapa ou controles sem suporte no código: o mockup define a **sensação**, não um novo motor de render. Evitar ruído em modo ambiente, preservar navegação nativa e dados verificáveis.
