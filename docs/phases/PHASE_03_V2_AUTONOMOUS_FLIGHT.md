# Phase 3 — V2 Autonomous Flight & Simulation Fidelity Contract

Status: V2 implemented and locally validated (4/4 reported by the product owner on 2026-10-25); pre-merge audit and outstanding gates pending. Supersedes the compatibility and fixed-duration guidance provisions of PHASE_03_VISUAL_FLIGHT_PLAN.md. No Phase 4 work authorized.

## Intent

Replace the experimental V1 mission flight model and strategic save. No migration or preservation of earlier Orbiter worlds is required. Reset simulated worlds, missions and camera state through a new explicitly versioned save namespace. Never accidentally consume the old save and misrepresent historical launches as V2.

## Deterministic contract

The same seed, technology, vehicle capability, mission objective, initial physical state and simulated time must give the same result **regardless of camera, LOD, selected object, rendering FPS, warp level, background tab or CPU load**. The camera affects only which events receive full visualization; the outcome authority cannot read visibility, camera or wall-clock time. Random deviations are sampled from a mission-scoped seeded stream once and stored in the mission plan; no frame-time RNG.

Do **not** directly snap an invisible rocket to a desired orbit with random perturbations if an observer could later obtain a different outcome by focusing it. Instead use a common event/trajectory solver for all missions, with fast analytical propagation and a cheap deterministic planning model; the focused scene may replay/fill the trajectory visually without changing its result.

## Three compute regimes (not three outcome models)

1. **Ballistic / rails:** no engine or atmosphere; keplerian conic propagation at arbitrary time. Satellite count scales with visible orbital queries, not number of elapsed integration steps.
2. **Active maneuver (on rails + events):** planner determines target orbit, delta-v and maneuver epoch; guidance/executor estimates thrust duration, direction, fuel usage and feasibility, stores before/after conic checkpoints. A finite-burn numerical integration may be required for long burns/near-surface. Its work is event-budgeted and can be performed independent of rendering. All missions use the same authoritative algorithm.
3. **Visual focus:** if selected/near LOD, render intermediate physical states and thruster flames, trajectory preview and goal telemetry at appropriate interpolation resolution. Reconstruct intermediate samples from immutable checkpoints; never modify the authoritative simulation or RNG.

Warp x1, x100, x10000, x100000, x1000000 changes only target simulated time and presentation. Background inactive flights still process event checkpoints (launch, cutoff, apoapsis burn, failure, insertion), not simply receive a guaranteed goal orbit. Hard cap processed events per frame with outstanding time debt; never skip events.

For massive future ecosystems, batch deterministic mission plans per system/epoch and process events via priority queue. Use analytical coasts for inactive orbital objects. Define performance benchmarks for 1, 100, 1000 and 10000 active/historical objects; profiles must be measured before claiming capacity.

## Flight V2 entities

- MissionPlan: missionId, seed stream, objective {targetPeM,targetApM,inclination2D?,tolerance}, launch window, vehicleId, technology tier, launchSiteId, reliability samples.
- Vehicle: dryMass, propellantMass, thrust, Isp, throttle range, stages (versioned), local r/v and phase.
- GuidanceController: `ascentVertical → gravityTurn → raiseApoapsis → coastToBurn → raisePeriapsis → trim → achieve|partial|abort|impact`; decisions from current state and target error, with constraints.
- BurnNode: atSimTime, direction, targetDeltaV, propellant budget, tolerance, expected post-burn conic. Burn ends from goal/available fuel, not fixed number of seconds. Burn duration derives from TWR and mass flow.
- FlightCheckpoint: time, conic/state r/v, mass/fuel, event type, outcome and causal explanation. Keyframes for visualization are derived only.
- MissionResult: physically orbiting? goal achieved? operational satellite? failure reason? partial success? Distinguish operational fact from objective achievement.

No full aerodynamic/thermal simulation in Phase 3 (vacuum model). No close range n-body or interplanetary patched conics yet. A 2D launch site is planet-fixed in the rendered plane; keep the physical 2D approximation documented.

## Example control loop (conceptual)

1. Select goal (suborbital survey, circular low orbit, high ellipse, high apoapsis, orbital return) and vehicle from technology, resource and feasibility constraints.
2. Solve a launch window and desired ascent guidance. Numerically advance thrust around gravity turn until predicted apoapsis is within tolerance, otherwise stop on failure/fuel safety.
3. Coast analytically to apoapsis; calculate desired prograde delta-v to raise periapsis and feasibility with rocket equation.
4. Execute finite burn with mission-time increments and feedback (remaining delta-v/target error), then compute osculating elements; perform bounded trim corrections if justified.
5. Record target achieved, partial operational orbit, suborbital impact or hardware failure. Preserve diagnostic reason and resources consumed.
6. Renderer draws physical samples from checkpoints, and plays important nearby events long enough in **real time** to perceive them. Visual hold affects presentation only.

## Reset implementation

- Delete legacy `FlightPlan` interpretation and legacy mission visualization/fallback and replace with V2 APIs in a coordinated commit.
- Introduce new keys (e.g. `orbiter.world.v2`, `orbiter.civilization.v2`) with explicit versioned validation; do not read V1 keys. Optionally expose one-time "Reset universe" UI for clarity. Old localStorage keys may be left unused or removed deliberately; never silently import.
- Remove obsolete tests/contracts, add new deterministic behavior tests. Do not keep dead V1 compatibility code.
- Maintain existing main/Phase 2 camera/planetarium behaviors unless explicitly superseded.
- Keep PR #7 draft. No GitHub Actions during development. After local validation, browser smoke, audit and all other gates: one final manual workflow dispatch on final HEAD, then merge.

## Gates

- Same seed/goal/vehicle/time gives identical outcomes at x1 and x1m, focused/unfocused and across reload.
- Controlled demonstrations include successful Pe/Ap tolerance, insufficient fuel (partial), collision/reentry, two distinct ascent paths.
- Physical events and finite burn visualization share the same checkpoints and never teleport satellite results.
- Resources and tech advancement influence vehicle capability, mission choices, failure likelihood and launch cadence.
- No frame-time integration of sleeping satellites; max time per frame is bounded at 1e6 and large simulation populations.

## As built — Phase 3 checkpoint (2026-10-25)

**Implemented and witnessed:** deterministic single-home-world civilization, research and resources, technology-dependent rocket capability, seed-scoped V2 mission plans, physical ascent, analytic coasts, finite apoapsis burns with intermediate telemetry, stable and partial orbits, suborbital scientific successes, failure/impact checkpoints, persistent mission history, and zoom-based planet/rocket/satellite rendering. Flight plans have v2 results and checkpoints. The UI supports watching preparation (warp-to-1× at event), independent one-shot focus and continuous follow, drag offset while following bodies **or missions**, selected-mission orbital conic highlight with AP/PE markers, and DevTools `orbiterDebug()`.

**Validation evidence:** last user-reported `npm run validate`: lint PASS, typecheck PASS, tests PASS, build PASS. User visually confirmed pan offset and selected-orbit AP/PE. Earlier user evidence included target-reaching orbit, stable partial orbits, suborbital survey, vehicle impact and failure. Those are qualitative scenario witnesses, not a quantified cross-seed benchmark.

**Limits / exceptions requiring future work:**

- The simulated flight is still a **2D two-body vacuum** approximation, not full MechJeb, atmospheric physics or N-body orbital guidance.
- Guidance and vehicle balancing can fail to achieve high periapsis targets; mixed success/failure is intentional, but systematic distribution across seeds has not been performance-benchmarked.
- Visual burn state interpolates immutable checkpoints; it is not integrated at render-frame rate.
- The codebase still contains `src/simulation/spaceflight/flight.ts` legacy V1 and its legacy-focused tests for reference. Those should be assessed for removal; do not claim complete V1 dead-code removal. Runtime V2 saves do not read the former V1 namespace.
- Orbital rendering and histories cap visible/recent objects; benchmark at 1/100/1000/10000 objects is not yet evidenced. No assertion that million-fold warp is performant with thousands of vehicles.

**Gate status:** local 4/4 and browser UX smoke reported by human; independent dependency/security audit (`npm audit`), quantified long-run performance, merge readiness / repository policy and final Actions workflow success are **not yet evidenced**. Keep PR #7 in draft and no Actions until remaining preflight checks have passed. Phase 4 not authorized.
