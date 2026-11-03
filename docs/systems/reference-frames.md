# Reference frames and universal kinematic state (Phase 7 M1)

## Scope and actual behavior

`src/simulation/reference-frames.ts` defines a shared, immutable `StateVector` with `entityId`, `frameId`, `epochS`, `positionM`, `velocityMs`, and optional `massKg`/`fuelKg`. All values use SI units. `solar` is the heliocentric inertial frame; `body:<id>` is a translating, **non-rotating** inertial frame centered on a body. Epochs are absolute simulation seconds, not durations relative to a launch.

`frameOrigin(world, frameId, epochS)` evaluates the existing Keplerian ephemerides recursively, adding the parent's inertial position and velocity. Planetary velocity uses the same symmetric finite-difference convention as the pre-M1 handoff (`min(1, orbit.period/1e6)` seconds). Moon velocities include their parent velocities. The star's origin and velocity are zero.

`transformState(world, state, target)` adds the source-frame origin and subtracts the target-frame origin for **both** position and velocity at the **same epoch**. It performs no propagation, acceleration, burn, SOI decision, or rotation. An identity transformation validates the state and frame and returns the original state exactly, avoiding avoidable floating-point cancellation.

## Adapters and integration

- `fromLocalFlight(entityId, planetId, flight)`: maps a legacy planet-centered `FlightState` into the common contract.
- `fromHeliocentricProbe(entityId, flight)`: maps a legacy heliocentric probe checkpoint.
- `toLocalFlight(state)`: reconstructs the legacy `FlightState` shape when mass and fuel are present; callers must know the intended frame.
- `celestialState(world, bodyId, epochS, target)`: reports celestial position/velocity without inventing vehicle resources.
- `handoffToHeliocentric` in `src/simulation/interplanetary-handoff.ts` keeps its preexisting SOI boundary and resource validation, but delegates coordinate conversion to the shared transform.

Only the SOI handoff is wired into the existing execution path in M1. Flight guidance, Lambert, mission scheduling, renderer, telemetry, strategic persistence and save schema remain unchanged. Other adapters are currently opt-in, not a wholesale migration of mission pipelines.

## Invariants and tests

`tests/phase7-m1-reference-frames.test.ts` covers round-trip, identity precision, SOI equivalence, celestial origin, invalid input and deterministic query order. Phase 7 M0 tests plus the existing suite guard local/interplanetary outcomes and save/reload. On 2026-11-01 local PowerShell validation after handoff integration reported 224/224 tests, 4/4 gates passing.

Numerical transformations are subject to floating-point cancellation when local coordinates are combined with astronomical distances. The tests use absolute tolerances appropriate to the selected fixture; identity is exact. The reference-frame layer does **not** resolve rotating frames, body orientation, barycentric dynamics, relativistic effects, or numerical long-duration integration.

## Performance evidence

The pre-M1 strategic benchmark (1,400 days) measured 102.19 / 90.65 / 76.47 ms for seeds `phase-five-real-vehicle`, `orbiter-002`, `phase-five-injection`. After SOI integration, the same seeds measured 140.79 / 163.27 / 133.03 ms. The functional outputs and save sizes matched exactly (1431/1430/1433 events; 114/111/114 projections; 789428/811189/768465 bytes). Single-run timings are not statistically sufficient to attribute a performance regression. This benchmark excludes browser Canvas/FPS.

## Remaining work

Before the M1 gate closes: complete numerical golden-fixture coverage gaps noted in the M0 baseline, reconcile phase status/checklist and ADR, and perform the human browser smoke and final CI on the final HEAD. Do not interpret this adapter milestone as the M2–M7 unified engine.
