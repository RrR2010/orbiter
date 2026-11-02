# Phase 7 M0 baseline evidence (before M1)

Branch: `phase-07-m0-m1-universal-frames`. All measurements below were supplied by a local PowerShell run on 2026-11-01, before changing any physics code.

## Deterministic test evidence

- `phase7-m0-baseline.test.ts`: 2/2 pass (flight plan/checkpoints, SOI position and velocity).
- `phase7-m0-regression.test.ts`: 4/4 pass (Lambert, midcourse fuel, delayed science/save, resolved mission reload).
- `phase7-m0-outcomes.test.ts`: 3/3 pass (failed insertion impact, physical transfer miss/no fuel, radio boundary).
- `phase7-m0-temporal.test.ts`: 2/2 pass (single vs partitioned vs budget=1, warp/pause).
- `phase7-m0-boundaries.test.ts`: 3/3 pass (stable circular orbit classification, flyby/miss/impact-risk geometric boundaries, valid/malformed/incomplete/obsolete V2 saves).
- Total: **14/14** M0 tests passed. Each test fixes its own seed and epoch; numeric tolerances are expressed in the assertions.

These tests are regression *invariants*, not yet a full numerical golden snapshot for every required scenario. The added boundary tests cover **classification** of circular orbits and positive/negative flyby geometry, but do not simulate a complete successful insertion or positive flyby end-to-end. A complete numerical golden-output fixture remains open. Do not describe these invariant tests as full numerical golden snapshots or mark the original M0 acceptance criterion fully satisfied.

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

## Post-M1 compatibility checkpoint (2026-11-01)

After the shared frame layer and SOI adapter were integrated, local `npm run validate` passed lint, typecheck, tests and build: **224/224 tests, 4/4 gates**. The dedicated M1 frame suite passed **5/5** tests, including round-trip and continuity against the legacy SOI handoff. No intentional physics or save-schema change occurred.

Post-integration strategic benchmark, same three seeds and 1,400-day horizon:

| Seed | elapsedMs | events | probeTimelines | projections | maxMissions | maxEvents | saveBytes | heapUsedMB |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| phase-five-real-vehicle | 140.79 | 1431 | 1 | 114 | 60 | 120 | 789428 | 14.8 |
| orbiter-002 | 163.27 | 1430 | 1 | 111 | 60 | 120 | 811189 | 24.6 |
| phase-five-injection | 133.03 | 1433 | 1 | 114 | 60 | 120 | 768465 | 26.5 |

Functional counters and serialized save sizes match the baseline. Single-run elapsed-time increases are observations, **not** a statistically established performance regression. Browser smoke and final CI remain pending.

## Physical golden discovery checkpoint (2026-11-02)

Local validation before adding the positive-flyby fixture: **229/229 tests, 4/4 gates**. The completed powered orbital insertion (`phase7-discovery-1`, seed `phase-five-injection`) achieved its goal with terminal fuel 472.93820321595604 kg at 2705.2783419502125 s. `tests/phase7-m0-orbital-golden.test.ts` freezes this result and validates orbital geometry and frame round-trip.

The 48-window Lambert physical-transfer search produced **27 propagated transfers**, **16 infeasible windows** and **5 coast solver nonconvergence errors**. One genuine positive-altitude flyby was found: departure 500000 s, arrival 2500000 s, closest distance 85800547.14968894 m, closest altitude 73084420.15089561 m. `tests/phase7-m0-flyby-golden.test.ts` freezes this result; it still requires local validation. The exploratory test deliberately records nonconvergence separately from physical misses; no production solver behavior was changed.

The five reproducible nonconvergence windows (departure/arrival, seconds) are 1000000/3000000, 1500000/4000000, 1500000/4500000, 2000000/4500000 and 2000000/5500000. This is a **known numerical limitation** of the current coast propagator, not evidence of a frame regression. A complete M0 scenario matrix, browser smoke, final CI and merge remain open.
