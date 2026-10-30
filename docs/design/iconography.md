# Iconografia de veículos e símbolos

- Silhuetas vetoriais originais para classes **realmente existentes** no modelo: lançador, sonda/satélite, estágio ou fragmento apenas se houver essa identidade.
- Em zoom afastado, substituir detalhes por glifos técnicos de mesma identidade. O marcador selecionado usa halo/contorno; ativo e perdido possuem codificação por forma/estado, não só cor.
- Orientação acompanha estado físico 2D quando houver vetor confiável. Não girar sprite como se indicasse atitude 3D simulada.
- Manter tamanho mínimo clicável e limitar máximo visual para não sugerir dimensão física real.
- Manter canvas hit testing e centro de glifo coerentes, inclusive com fallback sem atlas carregado.

## Pipeline de extensão

Definir tipo real no modelo → mapear a glifo próximo/distante → revisar escala/contraste/seleção → validar 3 situações reais (subida, órbita, impacto ou estado ausente). SVG/Canvas são opções, não compromisso de engine nova.

## Ícones instrumentais SVG — Fase 4

`src/ui/hud-icons.ts` define glifos originais, fechados e reutilizáveis por chave semântica: `altitude`, `velocity`, `fuel`, `apoapsis`, `periapsis`, `mass`, `deltaV`, `isp`. São SVGs de geometria fixa, criados no namespace SVG, com `aria-hidden` e rótulos textuais adjacentes; não representam medidas físicas por si mesmos. O mesmo catálogo poderá sustentar instrumentos futuros sem biblioteca externa.

**Direção futura sugerida pelo PO:** atlas/sprite sheet de naves com LOD, preservando glifo vetorial como fallback e hit test no Canvas. A arte definitiva e o tier de sprite ainda não foram entregues.
