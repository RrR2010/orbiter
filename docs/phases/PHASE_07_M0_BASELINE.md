# Phase 7 M0 baseline evidence (before M1)

Branch: `phase-07-m0-m1-universal-frames`. All measurements below were supplied by a local PowerShell run on 2026-11-01, before changing any physics code.

## Deterministic test evidence

- `phase7-m0-baseline.test.ts`: 2/2 pass (flight plan/checkpoints, SOI position and velocity).
- `phase7-m0-regression.test.ts`: 4/4 pass (Lambert, midcourse fuel, delayed science/save, resolved mission reload).
- `phase7-m0-outcomes.test.ts`: 3/3 pass (failed insertion impact, physical transfer miss/no fuel, radio boundary).
- `phase7-m0-temporal.test.ts`: 2/2 pass (single vs partitioned vs budget=1, warp/pause).
- Total: **11/11** tests passed. Each test fixes its own seed and epoch; numeric tolerances are expressed in the assertions.

These tests are regression *invariants*, not yet a full numerical golden snapshot for every required scenario. Remaining coverage includes positive/negative flyby outcomes, successful circular insertion, incomplete/malformed V2 saves and a complete quantitative output fixture. Do not mark M0 fully accepted until these gaps are addressed.

## Pre-M1 strategic benchmark

Command: `node scripts/benchmark-phase5.mjs`; 1,400 simulated days; excludes browser Canvas and FPS.

| Seed | elapsedMs | events | probeTimelines | projections | maxMissions | maxEvents | saveBytes | heapUsedMB |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| phase-five-real-vehicle | 102.19 | 1431 | 1 | 114 | 60 | 120 | 789428 | 16.2 |
| orbiter-002 | 90.65 | 1430 | 1 | 111 | 60 | 120 | 811189 | 26.2 |
| phase-five-injection | 76.47 | 1433 | 1 | 114 | 60 | 120 | 768465 | 27.5 |

CPU and heap are environment-dependent; event counts, projections, mission counts and serialized bytes are deterministic checks for identical code and runtime. The benchmark includes save/reload equality. Browser smoke is a separate gate.

## Functional decision

The PO explicitly approved incompatible changes to old saves where necessary for a clean architecture. Never automatically delete browser storage. The current M0 fixtures still protect existing V2 behavior as historical regression evidence.
