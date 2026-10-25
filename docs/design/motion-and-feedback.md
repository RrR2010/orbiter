# Movimento, linhas e feedback

## Semântica de camadas

| Camada | Aparência proposta | Vida útil |
|---|---|---|
| Órbita de corpo | linha fina discreta com indicação estática de direção | enquanto órbita válida |
| Trajetória passada recente | contínua com cauda/fade | janela temporal definida e descartada ao fim físico |
| Previsão de coast | tracejado separado e legendado | enquanto estado/fonte válida; não prevê empuxo futuro |
| Propulsão ativa | sinal/efeito limitado ao estado de queima | somente durante burn real |
| Órbita selecionada | destaque fino ciano + marcadores de direção | enquanto seleção/órbita válida |

Amostras/efeitos não sobrevivem a impacto, perda física ou troca de identidade. Ao deixar a missão, caches visuais devem invalidar seleção ou expirar. Setas discretas tornam o sentido inteligível também em pausa/reduced motion; gradiente de direção é apenas reforço. Nenhuma linha pode representar órbita inexistente.

## Feedback

Preparação/lançamento/inserção/resultado/falha: pequenos avisos contextuais, sem modal. Modo cinematográfico opcional só aumenta ênfase visual, não agenda eventos. Respeitar `prefers-reduced-motion`, pausa e warp: movimento decorativo não deve fingir avanço simulado.

## Modo ambiente

Inatividade reduz chrome visual; modo dedicado oculta painéis opcionais; ações de recuperação e avisos relevantes continuam disponíveis. Testar com teclado, fullscreen e pointer.
