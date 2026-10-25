# Design system — Orbiter

**Status:** diretrizes aprovadas no Discovery da Fase 4; componentes/tokens efetivamente implementados devem ser auditados e atualizados antes do aceite A2.

- [Discovery aprovado](DISCOVERY_PHASE_04.md)
- [Linguagem visual](visual-language.md)
- [HUD de missões](mission-hud.md)
- [Iconografia](iconography.md)
- [Movimento e feedback](motion-and-feedback.md)

## Contrato de implementação

`regra simulada → telemetria derivada (somente leitura) → apresentação visual → teste`.

Não usar a interface como origem de fatos físicos. Todo elemento visual novo deve indicar a fonte real de dados, tratamento N/D, estados de exibição e teste associado. Parâmetros estéticos configuráveis não modificam outcomes de simulação. Tokens abaixo são alvos de design até conferidos com CSS/Canvas implementados; não representam APIs já existentes.

## Portas de qualidade

Aprovação visual humana, responsividade e legibilidade, teclado, pausa/warp, reduced motion, contraste, modo ambiente, ausência de órbitas falsas e compatibilidade de saves V2.
