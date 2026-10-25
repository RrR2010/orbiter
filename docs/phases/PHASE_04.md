# Fase 4 — Linguagem Visual, HUD e UX de Missões

**Status:** AUTORIZADA, após Discovery funcional com o Product Owner e critérios de aceite cumpridos. **Missões interplanetárias passam à Fase 5.**
**Premissa:** melhorar o que se observa e como se acompanha uma missão, sem inventar telemetria ou mascarar simulação.
**Pré-requisito:** atualizar main, ler AGENTS.md, docs/WORKFLOW.md, docs/systems/README.md e contratos As-Built relevantes (voo, missões, veículos, câmera, persistência e scheduler).

## Etapa obrigatória A — Discovery funcional e proposta visual

**Antes de implementar mudanças de UX**, entrevistar o humano de modo curto e exploratório, com perguntas sobre prioridades, estilo (instrumentação estilo KSP vs observatório minimalista), intensidade da interface, atenção passiva vs inspeção ativa, iconografia e comportamento das trilhas. Propor 2–3 abordagens com vantagens/desvantagens e recomendação. Preferir perguntas com exemplos visuais ou mockups simples. Não exigir decisões de bibliotecas, estruturas de código ou cálculos. Registrar as escolhas funcionais como `docs/design/DISCOVERY_PHASE_04.md` e alinhar com o humano. Uma vez alinhado, seguir com autonomia até o merge. Conceitos e referências visuais não são equivalentes a implementação, e o agente não deve copiar arte do KSP.

## Entregas obrigatórias (após Discovery)

1. **Design system durável:** criar `docs/design/README.md`, `visual-language.md`, `mission-hud.md`, `iconography.md`, `motion-and-feedback.md`. Definir semântica de cores, tipografia, densidade de informação, estados, zoom, níveis de destaque, padrões de controles, acessibilidade, responsividade e modo ambiente. Descrever contrato para futuras features: regra simulada → telemetria derivada → apresentação visual → teste. Catalogar tokens e componentes efetivamente usados.
2. **HUD contextual:** ao acompanhar/selecionar um veículo, exibir painel integrado à cena ou overlay discreto com fase de voo e informações prioritárias; manter painel lateral como índice e detalhes opcionais. Adotar hierarquia estabelecida no Discovery. HUD não deve obstruir veículo nem controles. Estado sem seleção mantém cena limpa.
3. **Telemetria verdadeira:** altitude instantânea, velocidade (com referencial definido), AP/PE atual/alvo, massa, propelente restante, delta-v restante e Isp quando disponíveis/calculáveis com os dados do motor. Identificar valor atual, previsto e alvo; indicar N/D para propriedades sem fonte confiável. Se faltar dado, propor extensão **mínima e testável** do view model ou simulação, sem fabricar novos comportamentos de voo nem mudar seus resultados.
4. **Ícones de veículos:** substituir marcadores provisórios por iconografia vetorial original e coerente. Distinguir lançador, sonda, satélite, estágio/fragmento apenas quando essas categorias de fato existirem. Orientação, tamanho e estados (selecionada, ativa, desativada, perda) devem ser legíveis em diferentes zooms; atlas/spritesheet atual pode ser reutilizado, mas não é obrigação criar bitmap. Criar guia de extensão da iconografia.
5. **Trajetórias/trails:** eliminar rastro residual de decolagem quando o objeto muda de fase, conclui missão ou impacta. Separar visual e semanticamente trajetória prevista, trajetória recente/histórica, propulsão ativa e órbita persistente. Estabelecer lifetime, fading, seleção/LOD, camadas e regras de limpeza; nenhuma linha-fantasma depois do desaparecimento físico do veículo. Linhas não devem insinuar órbitas que a física não produziu.
6. **Estados e feedback:** pequenas transições e avisos (preparação, lançamento, coast, manobra, inserção, falha, impacto); usar o estado de missão real. Compatível com pausa/warp, preferências de movimento reduzido e modo ambiente.
7. **Refino UI:** diminuir densidade do painel de observatório em visão geral; reorganizar ações e informações sem remover capacidades. Preservar seleção por lista/canvas, seguir/focar, zoom, controles de tempo, fullscreen, uso por teclado e persistência de preferências; evitar modais intrusivos.
8. **As-Built e qualidade:** atualizar `docs/systems/` pertinentes, ADR/backlog e criar smoke test para modo geral, lançamento, nave seguida, órbita, falha/impacto e reload. Testar cálculos/formatadores de telemetria, estados do HUD, lifecycle do rastro, seleção e persistência. Não quebrar saves V2 ou determinismo.

## Limites de escopo

- Não implementar transferências interplanetárias, colonização, novas civilizações ou economia.
- Não reescrever o motor de voo/scheduler por questões estéticas. Correções mínimas para expor telemetria são permitidas, com testes e documentação. Alterações físicas de comportamento requerem escalonamento.
- Não prometer combustível, delta-v ou Isp atual se o modelo não permitir calcular. Não inventar inclinação 3D, navball funcional ou orientação 3D física sem dados.
- Não clonar HUD/arte do KSP: referência conceitual apenas.

## Gates de aceite

- **A1 Discovery:** entrevista registrada e direção funcional escolhida pelo PO antes de UX final.
- **A2 Linguagem visual:** documentos do design system concretos, indexados e aderentes à implementação.
- **A3 HUD:** missão selecionada legível em segundos com fase, altitude/velocidade e dados adicionais existentes; visão geral não poluída.
- **A4 Verdade física:** telemetria, unidades e referenciais verificáveis por testes; desconhecidos marcados N/D, nunca inventados.
- **A5 Iconografia:** veículos e estados reconhecíveis em zoom local e global; orientação coerente; ao menos três situações reais testadas.
- **A6 Trilha:** sem rastro fantasma em falha/impacto/encerramento; distinção visual entre trajetória prevista, passada e propulsão.
- **A7 Regressão:** foco/follow, câmera, zoom, warp, modo ambiente, teclado, persistência e saves sem regressões; smoke humano ou evidência de navegador.
- **A8 Qualidade:** `npm ci`, `npm run validate`, `npm audit` e smoke tests **locais primeiro**; GitHub Actions via `workflow_dispatch` **somente no gate final do HEAD do PR**, após demais validações. Conferir success antes do squash merge.
- **A9 Entrega:** documentação As-Built, design docs, ADR/backlog, issue, PR, status e handoff consistentes; após merge **parar** antes da Fase 5.

## Demonstração humana sugerida

1. Abrir visão geral: avaliar limpeza visual, painel e modo ambiente.
2. Escolher lançamento em preparação e acompanhar veículo; ler fase, altitude e velocidade sem abrir inspector completo.
3. Ver mudança de estados, propelente e parâmetros da órbita quando existentes; comparar atual vs alvo.
4. Observar conclusão, falha ou impacto; conferir que o rastro desaparece ou se transforma conforme a regra.
5. Alternar zoom, fullscreen, pausa, warp e outro objeto; recarregar e verificar preferências e saves.
6. Observar se ícones e linhas continuam distinguíveis em diferentes escalas.

## Autonomia e escalonamento

Agente pode decidir tecnologias vetoriais, componentes, arquitetura de view model e organização visual, depois de Discovery aprovado pelo PO. Escalar mudanças funcionais relevantes, riscos de save, alteração de dinâmica física ou dependências externas intransponíveis. Pode realizar merge autonomamente apenas com todos os gates cumpridos. Registrar divergências sem alegar validações não realizadas.
