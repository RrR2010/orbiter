# Orbiter — Agent Operating Contract (autonomous phase delivery)

## Leitura obrigatória

1. `docs/PROJECT_STATUS.md` — fase autorizada, estado e bloqueios.
2. `docs/PRODUCT_VISION.md` — experiência e prioridades.
3. `docs/ARCHITECTURE.md` — limites e contratos.
4. `docs/ROADMAP.md` e brief `docs/phases/PHASE_XX.md` — critérios de aceite.
5. `docs/WORKFLOW.md`, `docs/BACKLOG.md`, `docs/DECISIONS.md`.

## Contrato de autonomia

**A autorização de execução de uma fase inclui implementar, testar, corrigir, revisar o próprio PR e fazer merge na main**, sem retorno à orquestradora a cada iteração, quando TODOS os critérios do brief e os gates técnicos estiverem satisfeitos. Nenhuma autorização adicional é necessária para refatorações reversíveis, correção de bugs, ajustes de testes, dependências justificadas e melhorias de UX dentro do escopo.

O executor é responsável por conduzir a fase até o fim, não só entregar código. O humano avalia a experiência em testes funcionais pontuais quando a validação automatizada/navegador não for suficiente. Não inventar evidências ou declarar testes não realizados.

## Regras não negociáveis

- Implementar **apenas** a fase autorizada. Não iniciar a seguinte automaticamente.
- Separar simulação, visualização, UI e persistência; render não produz consequências físicas.
- Física híbrida transparente, unidades SI no motor, aproximações documentadas.
- Seed e clock determinísticos; não utilizar `Math.random()` na simulação; estado independente de FPS.
- Testes correspondentes às regras, incluindo limites, regressões e persistência.
- Não ocultar bugs, falhas CI ou funções incompletas; nunca simular sucesso.
- Nunca forçar push, sobrescrever mudanças de terceiros ou incluir segredos.
- Código, comentários, identificadores e docstrings em inglês; documentação/handoff em português.
- Atualizar o backlog ao descobrir ideias fora do escopo, sem implementá-las implicitamente.
- Registrar decisões técnicas transversais em `docs/DECISIONS.md` com justificativa.
- Proteger compatibilidade de saves; migração/teste obrigatório se o formato mudar.

## Limites que exigem escalonamento

**PARE e escale** quando houver: mudança funcional relevante fora do brief; necessidade de novo PR/dependência de fase prévia; risco de apagar/corromper universos existentes sem migração segura; remoção de segurança/testes; mudança de arquitetura estrutural incompatível; dependência de segredo, credencial ou aprovação externa; bloqueio CI/repo não resolvível com manutenção de escopo; desacordo material com o product owner.

**Não escale** escolha de nomes, bibliotecas compatíveis, organização interna, melhoria de performance, fix de bugs, revisão de teste ou detalhes reversíveis. Documente e prossiga.

## Loop completo de execução

1. Ler documentos; conferir `main` e estado real; abrir branch da fase.
2. Implementar em incrementos, com testes e documentação; fazer decisões técnicas autonomamente.
3. Rodar `npm ci`, lint, typecheck, tests, build e audit; reparar falhas até gates verdes; atualizar lockfile se dependências mudarem.
4. Abrir PR com checklist, evidências e handoff. Review pode ser feito pelo próprio executor; abrir feedback de code review adicional quando possível, sem inventar aprovação de revisor independente.
5. Validar no navegador (diretamente, ou guiando o humano quando indisponível), registrando limitações e exceções de critérios aprovadas pelo humano.
6. Se escopo e qualidade forem atendidos, CI obrigatório estiver verde, PR mergeável e alterações documentadas, **fazer merge por squash na main**. Não depender de novo chamado da orquestradora.
7. Fechar issue, atualizar `docs/PROJECT_STATUS.md` como fase integrada, com commit/PR, riscos e próximas ações; caso a atualização precise ser feita após merge, usar um PR pequeno de follow-up e integrá-lo sob as mesmas regras.
8. Entregar relatório ao humano, incluindo link do commit integrado e feedback funcional desejado.
9. **Parar:** a próxima fase só é autorizada pela orquestradora. Nenhuma execução adicional por inferência do roadmap.

## Gates de merge autônomo

- Critérios de aceite PASSOU, ou exceção **expressamente aceita pelo humano** e documentada (não autoaprovar a própria exceção).
- CI verde no HEAD relevante; nenhum conflito de merge ou review bloqueante.
- `npm audit` sem vulnerabilidades conhecidas relevantes ou risco formalmente escalado/aceito; nenhum bypass silencioso.
- Testes necessários executados de verdade e resultados registrados.
- Documentação, backlog, ADR e release/handoff coerentes com implementação.
- Sem perda irreversível de dados, segredos ou mudanças inesperadas no escopo.
- PR integrado via método suportado pela configuração do repositório; se regras do GitHub exigirem revisão externa, respeitá-las.

## Decisão sob ambiguidade

Escolha a menor solução reversível coerente com visão e critérios; documente e siga. Peça intervenção somente para os limites de escalonamento acima.

## CI econômico (obrigatório)

GitHub Actions é um recurso de validação **final**, não de desenvolvimento. Não executar automaticamente por push/commit/abertura ou atualização de PR. Trabalhar com testes locais (`npm run validate`, `npm audit`), smoke tests e revisão completos primeiro. Apenas quando a branch estiver pronta para merge, executar manualmente `Orbiter Final CI` via `workflow_dispatch` no HEAD final; confirmar check verde desse commit e então integrar. Se houver alteração posterior de código, repetir validação local e disparar novo CI final somente quando pronto; nunca tratar check de SHA antigo como suficiente. Se branch protection exigir checks automáticos ou não reconhecer checks manuais, escalar a configuração em vez de burlar. Não iniciar Actions desnecessários nem usar jobs de CI como substituto para testes locais.

## Documentação As-Built obrigatória

- `docs/systems/README.md` é o índice de contratos técnicos **implementados atualmente**. Consultá-lo junto de `docs/ARCHITECTURE.md` antes de alterar sistemas existentes.
- Cada subsistema relevante possui uma especificação viva em `docs/systems/<system>.md`, baseada no código e testes reais, não nas intenções do roadmap.
- Ao criar ou alterar comportamento, API, estado persistido, dependências ou invariantes, atualizar **no mesmo trabalho** a respectiva As-Built e o índice. Documentar simplificações, limitações e referências a arquivos/testes.
- Separação: `docs/phases/` registra **o solicitado**; `docs/systems/` registra **o que existe**; handoff registra **como foi validado e entregue**; ADR explica **por que se decidiu**. Em conflito com As-Built, verificar código/testes e corrigir a documentação.
- Não duplicar descrições integrais em múltiplos arquivos nem afirmar funcionalidades não verificadas. Qualquer divergência encontrada deve ser explicitada.
- **Exceção transitória de documentação retroativa:** agentes das Fases 1–2 e 3 podem editar exclusivamente os arquivos As-Built de sua responsabilidade, diretamente na `main`, com commits pequenos e sem alterar código, saves ou demais arquivos. Devem executar sequencialmente ou fazer pull/rebase antes de cada push; nunca usar force push. As regras normais de PR continuam valendo para desenvolvimento de produto.

## Linguagem visual e Discovery funcional

Antes de desenvolver uma fase com impacto importante em UX, o agente deve entrevistar brevemente o Product Owner para refinar o comportamento desejado (não pedir decisões técnicas). Consolidar as escolhas em documentação versionada e implementar dentro do escopo autorizado. Propor alternativas e trade-offs visuais. Para adicionar UI ou telemetria, consultar `docs/design/README.md` e padrões aplicáveis (assim que forem criados na Fase 4); atualizá-los quando alterar comportamento visual. Toda nova feature deve integrar simulação, view model, UI e testes sem inventar valores ou fatos; manter modo ambiente não intrusivo.
