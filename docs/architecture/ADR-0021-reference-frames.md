# ADR-0021: Universal inertial frames

Status: Implemented in the Phase 7 branch, pending merge.

## Decision

Introduce a common StateVector with entity ID, frame ID, absolute epoch, SI position and velocity, and optional vehicle resources. Use solar and body-centered nonrotating inertial frames. Resolve frame origins using existing Kepler ephemerides and translate both position and velocity. Identity transforms preserve exact coordinates. Provide adapters for local V2 flights, heliocentric probes, and celestial bodies.

Only the existing sphere-of-influence handoff delegates to this service in M1. Its boundary and resource validations remain unchanged. Do not modify guidance, solvers, scheduling, rendering, saves, or browser storage.

## Tradeoffs

Large heliocentric coordinates cause floating-point cancellation during round trips; tolerances must be explicit and scale-aware. Rotating frames and the universal state provider are deferred. The handoff integration can be rolled back independently.

## Evidence and outstanding gates

Local validation after integration: 224/224 tests, lint/typecheck/tests/build 4/4. Strategic benchmark functional counters and save bytes match the pre-M1 baseline. Single-run CPU measurements are inconclusive. Full numerical golden fixtures, browser smoke, final CI and PR merge remain pending. M2 and later are not authorized.

See docs/systems/reference-frames.md and docs/phases/PHASE_07_M0_BASELINE.md.
