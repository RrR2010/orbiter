# Discovery funcional — Fase 4

**Estado:** aprovado pelo Product Owner em 2026-10-25, após duas rodadas de entrevista e comparação de três mockups.  
**Referências:** [Issue #8](https://github.com/RrR2010/orbiter/issues/8), `docs/phases/PHASE_04.md`, captura da interface atual fornecida pelo PO e terceira proposta visual ("centro de operações espacial", aprovada). O mockup é referência estética, **não** especificação de telemetria, física ou features existentes.

## Intenção

Manter o Orbiter como observatório científico minimalista no uso passivo; transformar a observação ativa de uma missão em um painel de controle elegante, contextual e verificável. Direção: **Mission Control cinematográfico contido**, com acabamento refinado, fundos azul-marinho escuros, contornos finos, brilhos discretos e acentos ciano/âmbar. Não reproduzir a arte do KSP.

## Escolhas aprovadas

1. **HUD equilibrado:** painel compacto e expansível, com destaque equivalente para altitude, velocidade, combustível e parâmetros orbitais. Massa, delta-v e Isp são informações secundárias quando disponíveis.
2. **Lançamentos:** agenda de lançamentos programados, avisos contextuais e opção para marcar antecipadamente missões para acompanhamento automático. Preparar para múltiplas civilizações e lançamentos paralelos; evitar assumir troca automática indiscriminada de câmera.
3. **Iconografia híbrida:** silhuetas vetoriais originais de veículo em zoom próximo, símbolos técnicos simplificados em zoom afastado; não inventar classes de veículos.
4. **Trajetórias:** órbitas gerais básicas e discretas; selecionada com tratamento analítico. **Toda trajetória deve indicar o sentido do movimento**, inclusive com a simulação pausada. Gradientes/fade podem complementar, não substituir, marcadores de direção estáticos. Distinguir passado, previsão, propulsão e órbita; nenhuma trilha residual após desaparecimento físico.
5. **Feedback:** avisos sutis por padrão, feedback mais cinematográfico opcional, sem alterar os fatos simulados.
6. **Modo ambiente:** reduzir automaticamente a presença dos controles após inatividade e oferecer modo ambiente dedicado.
7. **Separação da interface:** mapa central protagonista, instrumentação contextual lateral, observatório de inspeção preservado, resumo inferior compacto, agenda ou cronograma acessível.

## Regras de experiência

- Sem seleção, manter o espaço visualmente dominante; não apresentar painel de telemetria vazio.
- Seleção de missão revela HUD; **Focar** e **Acompanhar** continuam distintos. Com diversos lançamentos, apenas missões explicitamente marcadas entram na fila de acompanhamento; conflitos devem ser resolvidos por prioridade explícita/reversível sem modificar a simulação.
- Agenda deve mostrar somente eventos efetivamente conhecidos pelo scheduler; não criar previsão fictícia.
- Dados físicos exibidos devem ter fonte de simulação, unidade e referencial; separar **atual**, **previsto** e **alvo**, mostrar **N/D** quando não houver origem confiável. Não apresentar inclinação orbital 3D se não for simulada.
- A direção nas órbitas gerais deve ser legível sem gerar poluição; em órbitas selecionadas, camadas e legenda identificam o significado.
- Respeitar pausa, warp, responsividade, movimento reduzido, atalhos, saves V2 e modo ambiente.
- Os valores e as telas dos mockups são **ilustrativos**; o produto deve revelar somente estados existentes.

## Referência visual aprovada

Terceira imagem da comparação apresentada ao PO, refinada na sequência: HUD principal à esquerda, mapa dominante ao centro, observatório/cronograma à direita, barra superior operacional, resumo inferior e detalhes em ciano/âmbar. **Não são compromissos automáticos:** inclinação 3D, manobras comandáveis, botão para criar missões, modos de câmera adicionais e miniaturas de imagem — requerem suporte real e/ou autorização própria.

## Critérios de demonstração visual

1. Visão geral em modo passivo e ambiente, sem HUD obstrutivo.
2. Selecionar missão em preparação e acompanhar lançamento; ler quatro grupos principais de telemetria.
3. Mostrar estado, objetivo, dados disponíveis e N/D genuínos, sem fake numbers.
4. Observar direção das órbitas, diferenciação de passado/previsão e limpeza após impacto.
5. Programar acompanhamento de lançamento conhecido; verificar coexistência de eventos sem câmera imprevisível.
6. Conferir pausa/warp, zoom, follow, fullscreen, reload e ausência de regressão dos saves.

## Controle de escopo

O alinhamento aprova UX da Fase 4, não altera dinâmica de voo, não cria missões interplanetárias, economia ou editor de veículos. Novos contratos de simulação exigem escalonamento. A execução da fase só conclui com testes locais, smoke visual e CI manual no HEAD definitivo.
