# Persistência estratégica V2 — As-Built (Fase 3)

## Escopo e vínculo legado
Este arquivo é proprietário da **persistência da civilização e missões**. Para save astronômico/câmera e contratos das Fases 1–2 consultar [persistência geral](persistence.md); este documento não substitui nem edita o contrato legado. A versão V2 foi um reset deliberado: não há migração de dados V1.

## Chaves e gravação
Em `src/main.ts`: `CIV_KEY='orbiter.civilization.v2'`, save astronômico `SAVE_KEY='orbiter.world.v2'` definido em `src/persistence/save.ts`, observatório `orbiter.observatory.v2` em `src/ui/observatory.ts`, e checkbox `orbiter.watch-launch.v2`. `persist()` escreve a civilização via `serializeCivilization(civilization)` e em seguida mundo/tempo/warp/câmera via `serializeSave`; não há transação atômica entre as chaves. Ocorre periodicamente (~5 s reais) e ao sair da página; troca de seed reinicializa estado e salva, com confirmação do usuário. O follow transitório de missão e seu offset não são salvos na civilização.

## Esquema e recuperação
`serializeCivilization(c)` é `JSON.stringify(c)`; armazena stage, conhecimento, recursos, horários, serial, eventos e até 60 missões com `AutonomousFlightResultV2` completo, incluindo plano, estados, checkpoints e desfecho. `parseCivilization(raw,world,time)` exige versão 2, ID fixo, seed igual, planeta natal existente, campos numéricos finitos, estágio 0–4, serial válido, listas limitadas e status corretos; rejeita voos cuja versão declarada não é 2. Rejeita civilização cujo `time` é posterior ao tempo astronômico fornecido; dados inválidos retornam `createCivilization(world,time)` sem recontar missões passadas. Se save estratégico estiver atrasado em relação ao tempo do mundo, o scheduler retoma a evolução a partir de seu estado.

## Limites e testes
Validação estrutural estratégica não verifica recursivamente todos os campos internos de cada checkpoint/resultado, nem realiza escrita atômica/rollback; um JSON formalmente plausível mas corrompido internamente pode passar validação. `src/persistence/save.ts` valida separadamente versão/seed/time/warp/câmera do save de mundo. Sem backup, import/export, migração V1 ou avanço offline. `tests/civilization.test.ts` comprova recarga equivalente, seed divergente, limites e reset com save ausente; `tests/v2-reset.test.ts` rejeita versão legada e preserva checkpoints ao serializar. Contratos de eventos: [scheduler](mission-scheduler.md).

## Extensão em desenvolvimento — Fase 5A (branch, ainda não integrada)

Campo aditivo `Civilization.science` para estimativas gravitacionais e IDs de observações já recebidas. Saves V2 antigos sem o campo recebem priors determinísticos, sem alteração de missões, eventos, recursos ou do clock. Registros científicos existentes são validados ao carregar; formato malformado segue a política de rejeição já existente (reinicialização estratégica), um risco a revisar antes do merge. `tests/scientific-knowledge.test.ts` cobre legado, continuidade e deduplicação. A fase permanece em desenvolvimento e o contrato final será revisado depois da integração.

## Extensão em desenvolvimento — Fase 5C (2026-10-30)

O formato V2 atual serializa `science` e `scienceInbox` no objeto `Civilization`. O scheduler processa recepções pendentes como eventos cronológicos antes de eventos estratégicos simultâneos; salvamento/recarregamento intermediário mantém a recepção futura, sem concessão prematura de conhecimento. Testes: `tests/interplanetary-science-persistence.test.ts` e `tests/interplanetary-scheduler-reception.test.ts`. Conforme ADR-0017, saves de desenvolvimento de versões anteriores são descartáveis e não exigem migração. A integração física das missões científicas permanece pendente.
