# Fase 2 — Observatório e Telemetria

**Estado:** AUTORIZADA para execução end-to-end e merge autônomo, conforme `AGENTS.md` e `docs/WORKFLOW.md`.
**Dependência:** Fase 1 integrada (PR #2, merge `81bd3e9`).
**Objetivo funcional:** transformar o planetário existente em um observatório explorável sem interromper sua beleza passiva nem alterar o resultado da física por causa da câmera.

## Experiência esperada

O observador encontra um planeta ou uma lua, clica e descobre o que é; vê informações orbitais compreensíveis; centraliza ou acompanha o objeto enquanto o tempo avança; alterna camadas visuais e sempre consegue voltar à visão geral. As luas hoje difíceis de enxergar devem poder ser descobertas e inspecionadas.

## Entregas obrigatórias

1. **Seleção confiável de corpos:** clique/tap em estrela, planeta ou lua visível; realce do selecionado; deseleção e alternância intuitivas; seleção também por uma lista/navegador de corpos para alcançar objetos pequenos.
2. **Inspector contextual leve:** identidade, tipo, corpo pai, raio físico, semieixo maior, excentricidade, período orbital e distância atual do pai, quando aplicável; valores com unidades legíveis e precisão coerente; parâmetros não aplicáveis devem aparecer como indisponíveis, não inventados.
3. **Foco e acompanhamento:** comando para centralizar câmera em um corpo, follow opcional acompanhando sua posição enquanto o tempo avança, pan manual desativa follow ou segue regra explícita; botão para voltar à visão geral; zoom compatível com luas e escalas planetárias.
4. **Zoom semântico mínimo:** tornar órbitas e luas observáveis em escala local; camada/representação contextual que não confunda tamanho gráfico com tamanho físico; preservar legibilidade em escala global.
5. **Camadas visuais controláveis:** ao menos órbitas, rótulos e cinturão de asteroides, com toggles discretos; preferências de camadas persistidas entre reloads sem quebrar saves v1.
6. **Telemetria orbital derivada, não simulada por efeitos:** posição/distância e velocidade orbital estimada a partir do modelo kepleriano, se exibida. Definir se a velocidade é relativa ao corpo pai; documentar hipótese. Não usar valores aleatórios para HUD.
7. **UX do modo ambiente:** UI recolhível ou com distração reduzida, sem sacrificar acessibilidade; atalhos descobríveis; fluxo intuitivo de seleção/follow/reset; nada de modal obrigatório enquanto o universo roda.
8. **Compatibilidade:** preservar comportamento e controles da Fase 1, seed, warp e persistência; salvar/carregar com migração/fallback de v1 se mudar schema; nunca apagar universo anterior silenciosamente.
9. **Qualidade:** testes automatizados de estado de seleção, foco/follow, transformação de câmera, formato/derivação de métricas e compatibilidade de persistência; guia de teste humano e observação visual comprovável.

## Critérios de aceite / gate

- **A1:** planetas e luas podem ser localizados, selecionados e distinguidos; a árvore/lista permite acessar objetos pequenos.
- **A2:** inspector exibe números derivados do mundo/física em unidades corretas; nenhum parâmetro fictício.
- **A3:** acompanhar planeta ou lua funciona durante warp; volta à visão geral; drag/zoom obedecem comportamento documentado.
- **A4:** camadas são alternadas sem mudar world state; visual passivo continua agradável, inclusive fullscreen.
- **A5:** mundo já salvo na Fase 1 reabre sem perda de identidade/seed/progresso; settings novos usam migração/default seguro.
- **A6:** nenhuma regressão nas funções de Fase 1; `npm ci`, `npm run validate`, `npm audit` executados; CI verde e PR mergeável.
- **A7:** agente valida UI visualmente em navegador quando disponível, ou guia humano por roteiro conciso; relata limites reais e evita alegar medições ausentes.
- **A8:** nenhuma civilização, foguete, missão, evento narrativo causal ou economia foi implementado antecipadamente.
- **A9:** branch, PR, documentação, backlog, ADR (se necessário), status e issue mantidos coerentes; merge autônomo **somente após gates**.

## Nota técnica e riscos herdados

- **Zoom e câmera:** manter mapeamento metros↔pixels isolado do motor; follow não deve modificar o estado físico.
- **Órbitas das luas:** renderer atual pode ocultar trajetórias muito pequenas. Resolver com foco local/transformações de câmera; evitar geometria enganosa.
- **Persistência:** `orbiter.phase1.v1` existe em navegadores reais. Não sobrescrever com formato incompatível; versionar/migrar e testar.
- **Frame clamp:** permanece limitação conhecida; não é requisito desta fase implementar scheduler. Não declarar tempo real estrito.
- **Cinturão:** pontos gráficos agregados não são corpos selecionáveis a menos que isso seja explicitamente modelado no futuro.
- **Escopo do inspector:** não requer novos atributos de habitabilidade, materiais, cultura ou população; não fabricar tais dados.

## Sugestão de implementação (agente decide detalhes)

1. API de seleção e view model das propriedades calculadas.
2. Câmera com target/follow e transformação/testes desacoplados da física.
3. Inspector + navegador de corpos e zoom local de luas.
4. Camadas visuais + preferências persistentes e migração de save.
5. Polimento de modo ambiente, acessibilidade, smoke tests e documentação.
6. PR com checklist, CI e audit; merge autônomo se gates cumpridos; atualização de status e issue.

## Roteiro de demonstração humana

1. Abrir um save criado na Fase 1; confirmar seed, tempo e corpos.
2. Selecionar um planeta e ler telemetria; acompanhar sua órbita acelerando o tempo.
3. Abrir o navegador de corpos, selecionar uma lua pequena e usar foco local até visualizar sua órbita.
4. Desativar/ativar órbitas, rótulos e cinturão; conferir fullscreen e modo ambiente.
5. Voltar à visão geral, recarregar e verificar que universo continua íntegro.

## Não fazer

Nada de desenvolvimento de civilização, missões, eventos, exploração interplanetária, physics rewrite ou 3D. Itens sugeridos fora de escopo vão para backlog. Não criar dados não existentes só para encher painéis.

## Governança

Agente executor está autorizado a escolher a arquitetura interna, corrigir bugs, criar testes, atualizar dependências e fazer merge por squash após gate objetivo. Escalar apenas por risco irreversível, blocker externo, mudança significativa de escopo, incompatibilidade de saves sem migração ou exceção ao critério obrigatório. Finalizado o merge, parar e solicitar revisão de produto antes de Fase 3.
