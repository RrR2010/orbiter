# Fase 1 — Planetário vivo

**Estado:** pronta para execução. **Responsável:** próximo agente executor. **Objetivo funcional:** um sistema planetário procedural que já funciona como screensaver observável em navegador, com física orbital coerente, zoom, warp e salvamento entre sessões.

## História do usuário

> Abro o Orbiter, vejo um sistema estelar vivo em fullscreen, consigo observar planetas e suas órbitas, alterar a velocidade do tempo, navegar com zoom e arrastar a câmera, recarregar e continuar no mesmo universo.

## Entregas obrigatórias

1. Projeto TypeScript strict + Vite; scripts `dev`, `build`, `test`, `typecheck`, `lint` (configurar ferramentas simples e documentar execução).
2. Estado de mundo determinístico com seed editável/reutilizável e IDs estáveis: 1 estrela, 4–6 planetas, 0–3 luas por planeta em condições plausíveis e um cinturão de asteroides (representação agregada permitida).
3. Modelo 2D kepleriano para trajetórias elípticas (ao menos planetas/luas), órbitas e posições calculadas a partir do tempo simulado; aproximar tamanhos/escala visual com clareza.
4. Canvas responsivo com tratamento de DPR, resize e fullscreen; visual escuro, trilhas orbitais e destaques suficientes para ser agradável em observação passiva.
5. Câmera pan/zoom suave com limites úteis, centralização inicial e seleção/foco básico opcional se pequeno em custo; não implementar inspector completo (Fase 2).
6. Controles discretos para pausar, retomar, escolher 1x / 100x / 10k x e reiniciar novo universo via seed, com proteção contra reset acidental.
7. Salvar/carregar versão de seed, tempo simulado, escala e configuração de câmera no navegador. Recarregar deve retornar ao mesmo sistema e tempo aproximado salvo; o tempo **não** precisa avançar enquanto aba está fechada.
8. Pelo menos uma passagem visual interessante: sutis cintilações, trilhas e asteroides sem simular falsas colisões.
9. Acessibilidade mínima: legibilidade da UI, botões acessíveis, controles utilizáveis com mouse e teclado onde adequado; respeito a `prefers-reduced-motion` quando possível.
10. Documentar simplificações físicas, comandos, limites e como demonstração humana funciona.

## Critérios de aceite executáveis

- **A1**: mesma seed gera os mesmos corpos, órbitas e IDs após reload; seeds diferentes resultam em sistemas distintos.
- **A2**: tempo de simulação depende de clock e warp, nunca do FPS; pausa congela o estado, sem saltos ao retomar.
- **A3**: posição orbital em tempos arbitrários não é `NaN`/infinita; órbita fechada retorna aproximadamente após um período; solver funciona para excentricidades variadas válidas.
- **A4**: fullscreen/resize/DPR/zoom/pan não distorcem nem escondem controles cruciais; roda em navegador desktop.
- **A5**: reload preserva seed e tempo salvo com identificação inequívoca do mesmo universo.
- **A6**: testes automatizados cobrem geração, órbitas, clock e serialização; build/typecheck/lint/test passam.
- **A7**: agente realiza ensaio observado de 30 minutos ou equivalente instrumentado justificável **mais** verificação visual manual; reporta FPS/memória quando mensuráveis, sem inventar medições.
- **A8**: nenhum controle obrigatório de jogo, civilização, foguete ou economia foi adicionado nesta fase.

## Não fazer

- Civilização, satélites artificiais, missões, lançamentos, economia ou eventos narrativos.
- N-body global ou integrações numéricas caras sem necessidade.
- UI complexa tipo jogo, mapa galáctico, 3D, React por padrão.
- Simulação offline obrigatória ou replay completo.

## Plano sugerido ao agente (flexível)

1. Scaffold, testes e CI básico (GitHub Actions opcional, recomendado).
2. Seed, estado, modelos matemáticos e testes físicos.
3. Clock + câmera + Canvas, observabilidade dos parâmetros.
4. Controles e persistência versionada.
5. Polimento visual, ensaio de estabilidade e README de execução.
6. PR de entrega, checklist A1–A8 e handoff.

## Demonstração do humano

1. Iniciar servidor local com comando indicado no README.
2. Abrir no browser, alternar fullscreen, ampliar/diminuir zoom e pan.
3. Alterar warp e pausar; comparar velocidade aparente.
4. Copiar/anotar seed, recarregar e confirmar que é o mesmo universo.
5. Criar uma segunda seed e comparar configuração planetária.
6. Deixar executando e avaliar se seria agradável como screensaver.

## Definição de concluído

PR revisado pela orquestradora, critérios A1–A8 com evidências, bloqueios corrigidos ou aceitos explicitamente pelo humano e branch integrado. **Não** iniciar Fase 2 automaticamente.
