# Visão de produto

## Premissa

Orbiter é um screensaver interativo de ecossistema interestelar: universo autônomo que evolui quando ninguém interage, visualmente interessante nos segundos e minutos, narrativamente interessante em horas. Não é um jogo de comandos obrigatórios.

## Experiência prioritária

1. **Beleza passiva:** fullscreen escuro, órbitas legíveis, movimento fluido, câmera discreta e HUD não intrusivo.
2. **Curiosidade ativa:** clicar em corpos/naves mostra identidade, trajetória e histórico; acompanhar entidades.
3. **Consequências persistentes:** lançamento custa recursos; falha pode gerar detritos; descoberta altera estratégia; infraestrutura gera novas rotas.
4. **Narrativa emergente:** fatos registrados e selecionados para destaque; diretor narrativo **não** inventa resultados.
5. **Coerência científica compreensível:** simplificações assumidas, sem pretender N-body global em tempo real.

## Escopo inicial aprovado

- Uma estrela; conjunto procedural de planetas e luas; cinturão de asteroides.
- Uma civilização inicial em um mundo com condições adequadas.
- Física híbrida; mundo persistido entre sessões.
- Renderização 2D top-down em browser; observação + intervenções opcionais.
- Evolução tecnológica e missões entram gradualmente conforme roadmap.

## Fora de escopo inicial

Multiplayer, galáxia navegável, vida orgânica detalhada, 3D, editor completo de foguetes, multiplayer político, modelos de linguagem em runtime, guerra estratégica e economia com milhares de produtos.

## Camadas futuras

Astronomia e planetas; civilização e tecnologia; missões e confiabilidade; recursos/indústria/logística; história, descobertas e legado. Não implementar antes da fase correspondente.

## Princípios de design

- A história nasce do estado e das regras; o desenho apenas a revela.
- Ampliar zoom deve revelar informação sem criar inconsistente mudança física.
- Camadas estatísticas/agregadas para grande volume; detalhe individual para entidades relevantes.
- Todos os eventos importantes precisam de causas rastreáveis.
- Mudança do tempo de observação não pode pular consequências essenciais.
- Sem usuário, o universo continua; com usuário, a inspeção jamais precisa impedir o progresso.

## Critérios de sucesso por escala

- Segundos: animações de órbita e eventos legíveis, sem movimentos abruptos.
- Minutos: alguma novidade contextual, com cadência ajustada e sem acontecimentos gratuitos.
- Horas: progresso histórico visível, acumulado e consultável.
- Entre sessões: o mesmo universo retorna de forma íntegra. Simulação offline fica para decisão futura.

## Antiobjetivos

Bolinhas genéricas sem contexto; efeitos visuais fingindo simulação; eventos aleatórios sem consequência; crescimento de features que impossibilita execução estável.
