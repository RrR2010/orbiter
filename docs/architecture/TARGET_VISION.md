# Orbiter — Arquitetura-alvo e modelo mental de longo prazo

**Status:** visão normativa de destino, NÃO descrição As-Built nem autorização para reescrever sistemas. A realidade implementada consta em [systems](../systems/README.md). A auditoria da próxima fase decidirá sequência técnica, riscos e bibliotecas.

## Identidade do produto

Simulador autônomo 2D de programas aeroespaciais e evolução científica, observável passivamente como screensaver e explorável como Mission Control. Universo físico coerente; civilizações com conhecimento parcial e capacidades diferentes; histórias surgem de operações e resultados persistentes. KSP é referência para consequências físico-engenheirais e ciência, MechJeb para solvers, guidance e operações; não copiar UI, código ou licenças sem análise.

## Princípio maior: compor antes de especializar

**Nova funcionalidade não justifica por si só nova engine, câmera, inspector, estado orbital, telemetria ou persistência.** Antes de criar algo, verificar se o contrato existente deve ser generalizado, corrigido ou estendido para uso por outros tipos de entidade. Especialização legítima encapsula diferenças reais (propulsão atmosférica vs coast solar, por exemplo), preservando estados e serviços comuns. Não forçar abstração se a semântica diferir; justificar desvios e registrar ADR.

Regra de revisão obrigatória: **reutilizar → generalizar/refatorar → adicionar capacidade composta → criar subsistema paralelo somente com justificativa explícita**, testes de integração e plano de convergência.

## Contratos de destino

1. **World Truth:** corpos, efemérides, gravidade, atmosfera simplificada, ambiente, recursos, fenômenos e regras físicas absolutas; independente de conhecimento de civ.
2. **Entity State & Reference Frames:** estado cinemático temporal, IDs, referencial, posição/velocidade, massa/energia/propelente/integridade quando aplicáveis. Transformações coerentes, sem saltos de posição ou velocidade por conveniência visual.
3. **Dynamics & Propagation:** propagação analítica para coast adequado e integração finita para empuxo/massa/arrasto simplificado; análise orbital universal e SOI/handoffs; precisão numérica é exigência da engine, não dificuldade de jogo.
4. **Vehicle Components:** motores, tanques, estágios, baterias, geração solar, antenas, controle, sensores, cargas científicas e, mais tarde, suporte tripulado. Capacidades derivadas da composição, não de tipo de missão.
5. **Maneuver Solvers & Guidance:** solvers produzem planos verificáveis (circularização, AP/PE, escape, Lambert/transferência, correção, captura, descida); guidance/control executam dentro de limitações do veículo. Planejamento não é a execução.
6. **Mission Operations:** operações com pré-condições, parâmetros, resultados, recursos, eventos, contingências e recuperação. Planos podem formar grafos/máquinas de estados, não só listas lineares.
7. **Mission Autonomy:** plano fixo; plano com ramificações; planejamento por intenção com reavaliação; autonomia deliberativa baseada em recursos/risco/objetivos. Separar autoridade da missão, capacidade de planejamento e de execução. Comunicação/atraso limitam decisões externas.
8. **Civilization Knowledge:** observações, estimativas, incerteza, hipóteses e descobertas (contrapostas à verdade do mundo); ciência reduz incerteza ou descobre fatos; tecnologia desbloqueia capacidade de medir/planejar/executar. Erros simulados são de sensores, modelos e execução, não bugs numéricos.
9. **Multiple Civilizations:** identidades, cores, propriedade de entidades, conhecimento, tecnologia, especialização e prioridades independentes. Origem e relações são decisões de produto futuras; evitar global único de civilização.
10. **Universal Observation:** entidade selecionável/seguível, trajectory provider, telemetry provider, câmeras e vistas independentes. Planetas, naves, estações e satélites usam os mesmos contratos de observação. Distinguem órbita osculante, prevista, planejada, realizada e propulsão.
11. **Presentation:** HUD/Design System, sprites, partículas, áudio e PiP reagem a fatos e estados sem alterá-los. Modo ambiente, observatório e eventual sandbox leem a mesma simulação.
12. **Clock, Scheduler & Persistence:** evolução determinística sob warp e particionamento, marcos previstos versus eventos confirmados, snapshots e migrações versionadas, replay/testes de compatibilidade.

## Riqueza científica — escopo progressivo

- Veículo: massa, propelente, empuxo, Isp, delta-v, energia e geração, integridade, sensores, comunicação, precisão de navegação; tripulação depois (saúde, fadiga, moral, treinamento, suporte à vida).
- Ambiente: mu/massa/raio, atmosfera e densidade simplificadas, radiação, recursos, fenômenos científicos e acessibilidade de medições.
- Incerteza: propriedades estimadas com erro; resultados reais calculados a partir da verdade física. Evitar ciência como mero bônus por raridade de recurso.
- Mais de uma civilização e diversidade visual/tecnológica como evolução planejada, não pressupor política ou origens.
- Observação futura: inventário de missões ativas e tecnologias, eventos previstos, spotlight/warp opt-in, achievements históricos, PiP, rotas e manobras; controles 10×, 100×, 1.000× etc, ease-in/out de warp sem perder eventos; preservar 1× internamente.
- Física-alvo: órbitas/transferências realistas com aproximações documentadas; propulsão finita, massa variável e arrasto/atmosfera simplificada. Não exigir aerodinâmica CFD, corpos deformáveis, clima ou termodinâmica integral.

## Não confundir papéis

- **World truth** não é observação da civilização.
- **Solver** propõe, **guidance** comanda, **propagador** resolve, **scheduler** ordena eventos, **render** mostra.
- **Missão** é objetivo e plano; **veículo** é entidade física; **trajetória** é derivada de estado/modelo/referencial.
- AP/PE pertencem à análise orbital com corpo e referencial explícitos; não ao tipo de missão.
- O voo interplanetário é um plano que compõe lançamento → órbita → escape → transferência → correção → encontro/captura, não uma nave gerada magicamente fora da SOI.

## Critérios para considerar a transição concluída

- Uma missão local e outra interplanetária percorrem o mesmo pipeline físico/operacional, divergindo em planos/solvers e capacidades necessárias.
- Não existe telemetria, câmera, seleção ou renderer de trajetória paralelos por classe de missão sem justificativa física/UX documentada.
- Mudanças de referencial são conservativas dentro de tolerâncias; eventos e saves reproduzíveis em warp/recarga.
- Solvers podem ser substituídos sem alterar civilização, HUD e infraestrutura de eventos.
- Civilizações distintas usam a mesma engine sob capacidades/conhecimentos próprios.
- Novas features verificam primeiro contratos compartilhados e atualizam As-Built/design e testes.

## Governança e processo

Este documento descreve **destino**, enquanto `docs/systems/` descreve **presente**. Checklist de transição em [TRANSITION_CHECKLIST.md](TRANSITION_CHECKLIST.md). Nenhum checkbox deve ser marcado por intenção; exigir testes, links e evidência. Mudanças de destino precisam de ADR e alinhamento funcional. Não transformar a auditoria em reescrita.
