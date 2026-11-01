# Contratos To-Be de referência — Fase 6 (não implementados)

Tipos abaixo são **pseudocontratos TypeScript de proposta**. Não importar em produção sem revisão/testes. Unidades físicas SI; `number` em double; tempos simulados absolutos; fonte de verdade nunca depende de camera ou FPS.

```ts
type EntityId = string;
type FrameId = string;
type Seconds = number;
type Vector2 = Readonly<{ x: number; y: number }>;
type StateVector = Readonly<{
  entityId: EntityId; epochS: Seconds; frameId: FrameId;
  positionM: Vector2; velocityMs: Vector2;
  massKg?: number; fuelKg?: number;
}>;
interface ReferenceFrames {
  transform(state: StateVector, target: FrameId): StateVector;
  centralBody(frame: FrameId): EntityId | null;
}
interface StateProvider {
  at(entityId: EntityId, epochS: Seconds, frameId: FrameId): StateVector | null;
}
type TrajectoryKind = 'osculating' | 'planned' | 'predicted' | 'realized';
interface TrajectoryProvider {
  sample(entityId: EntityId, kind: TrajectoryKind, fromS: Seconds, untilS: Seconds, frameId: FrameId): readonly StateVector[];
}
type OperationKind = 'launch' | 'burn' | 'coast' | 'handoff' | 'measure' | 'transmit' | 'capture' | 'land';
type Operation = Readonly<{
  id: string; kind: OperationKind; targetId?: EntityId;
  preconditions: readonly string[]; params: Readonly<Record<string, unknown>>;
  onSuccess?: string; onFailure?: string;
}>;
type Autonomy = 'fixed' | 'branching' | 'intent' | 'deliberative';
interface MissionPlan {
  id: string; ownerId: EntityId; vehicleId: EntityId;
  autonomy: Autonomy; startOperationId: string;
  operations: Readonly<Record<string, Operation>>;
}
interface ManeuverSolver {
  solve(goal: Readonly<Record<string, unknown>>, estimate: StateVector, vehicle: VehicleCapabilities): Readonly<{ burns: readonly Operation[]; feasibility: string; model: string }>;
}
interface VehicleCapabilities {
  canPerform(kind: OperationKind): boolean;
  availableFuelKg: number; powerJ?: number; commsAvailable?: boolean;
}
interface Dynamics {
  propagate(state: StateVector, toS: Seconds, environment: Readonly<unknown>, command?: Readonly<unknown>): StateVector;
}
type DomainEvent = Readonly<{ id: string; epochS: Seconds; kind: string; entityIds: readonly EntityId[]; causeId?: string; payload: unknown }>;
interface EventQueue {
  advance(toS: Seconds, budget: number): readonly DomainEvent[];
}
type TelemetryDatum = Readonly<{ value: number | string | null; unit?: string; frameId?: FrameId; epochS: Seconds; source: string; meaning: string }>;
interface ObservationProvider {
  telemetry(entityId: EntityId, epochS: Seconds): Readonly<Record<string, TelemetryDatum>>;
  selectable(entityId: EntityId): boolean;
}
interface CivilizationKnowledge {
  estimate(civilizationId: EntityId, quantityId: string, epochS: Seconds): Readonly<{ value: number; uncertainty: number }> | null;
}
```

## Dependências e fluxo causal

```text
WorldTruth + ReferenceFrames ──────> Dynamics/Propagator ──> Physical checkpoints
         │                                  ^                         │
         └──> Sensors/Observations ──> Knowledge per civilization      │
                                             │                         v
Civilization/Tech/Resources ───────────────> Goal -> Solver -> MissionPlan
                                                   │                 │
                                         Guidance/Control <─ Operation executor
                                                   │                 │
                                             Vehicle limits ──> EventQueue
                                                                     │
                            StateProvider + TrajectoryProvider <────┘
                                          │
                               Telemetry/Selection/Camera
                                          │
                                  Canvas/HUD/UI (read-only)
```

**Separações duras:** world truth não é estado estimado; solver não é guidance; missão não é veículo; previsão não é realizado; scheduler confirma eventos e não desenha; câmera não produz consequências. Posições no referencial de destino incluem **translação de velocidade do origin frame**, não apenas deslocamento espacial.

## Duas missões, um mesmo executor — exemplo contratual

| Etapa | Local: satélite | Interplanetário: flyby |
|---|---|---|
| 1 | `launch(surface, ascentSolver)` | `launch(surface, ascentSolver)` |
| 2 | `burn(insertionSolver)` | `burn(insertion/escapeSolver)` |
| 3 | `coast(planetFrame)` | `handoff(solarFrame)` + `coast(solarFrame)` |
| 4 | `measure(orbitAchieved)` | `burn(midcourseSolver)` + `coast` + `measure(closestApproach)` |
| 5 | `transmit(result)` | `transmit(science)` quando link e capacidade permitirem |

A ordem e os solvers diferem; **estado, controle de combustível, relógio, eventos, observação e executor são comuns**. A saída de cada operação fornece checkpoint físico, consumo, outcome e próximo nó. Um evento `plan.proposed` não é `burn.executed` nem `science.received`.

## Quatro políticas de autonomia

- **Fixa:** nós e comandos preparados antes da partida; falha termina ou segue contingência previamente codificada.
- **Ramificada:** escolhe entre arestas autorizadas por estado medido, confiança e recursos; nenhuma nova solução arbitrária.
- **Por intenção:** preserva objetivo (ex.: alcançar órbita) e pode pedir ao solver novo plano a partir da estimativa atual, com orçamento limitado e logs.
- **Deliberativa:** prioriza objetivos concorrentes com riscos, combustível, energia, tempo de computação e autorização; decisões auditáveis, não onisciência.

A autoridade do solo é separada da autonomia embarcada. Comunicação verifica alcance, janela, latência, entrega e ack; ordens somente se tornam executáveis após chegada. Estimativas incluem timestamp e incerteza; sensores/tecnologia podem introduzir erro determinístico, sem reduzir a precisão numérica do estado verdadeiro.

## Compatibilidade e implementação incremental

Adaptadores iniciais: `FlightState` local → `StateVector(frameId=planetId)`; `Mission.flight` → `MissionPlan` observado; `MissionTimeline.manifest` → checkpoint/event projection; `positionsAt` → `StateProvider` celestial. IDs legados permanecem estáveis enquanto a compatibilidade for testada. Não pressupor que snapshots locais e heliocêntricos são intercambiáveis.
