# SwarmX – Interactive PSO Studio

*Explore. Optimize. Visualize.*

SwarmX is a browser-based tool that teaches **Particle Swarm Optimization (PSO)**. You pick a benchmark problem, change the parameters, and step through the real algorithm while watching the swarm move, with the full velocity and position arithmetic shown for every particle.

**Live demo:** https://YOUR-SITE.netlify.app  
**Demo video:** https://YOUR-VIDEO-LINK

## Problem statement

Optimization algorithms are hard to understand from equations alone. This project makes PSO visible and checkable: every number on screen comes from a real run of the algorithm, and a hand-calculation mode verifies the engine against plain formulas.

## Features

- Real global-best PSO engine (no pre-generated movements), seeded so runs are reproducible
- Five benchmark functions: Sphere, Rastrigin, Rosenbrock, Ackley, Booth (minimize or maximize)
- Controls: particles, iterations, w, c1, c2, initial velocity, velocity limit, bounds, seed, speed, presets
- Play, pause, next, previous, reset, restart; history is stored so earlier iterations are never rewritten
- 2D heatmap with trails, velocity arrows, pBest and gBest markers, zoom, pan, hover coordinates
- Interactive 3D surface (Plotly) with particles, gBest and known optimum
- Convergence and diversity charts, plus live statistics
- Per-particle calculation panel with the actual values substituted into the equations
- 12-step Learning Mode with Beginner and Expert explanations
- Particle Tracking: full history of any particle, trajectory plot, CSV export
- Hand Calculation tab: textbook example, editable inputs, comparison against the engine
- Compare tab: two configurations on the same seed, auto-generated summary, CSV export
- Save and replay experiments (stored in the browser)
- Learning Outcomes tab: ten outcomes that unlock as you use the tool, an 8-question knowledge check, and a 20-seed success-rate challenge that runs the real engine
- Light and dark theme

## Equations

```
v(t+1) = w·v(t) + c1·r1·(pBest − x(t)) + c2·r2·(gBest − x(t))
x(t+1) = x(t) + v(t+1)
```

w is inertia, c1 the cognitive coefficient, c2 the social coefficient, r1 and r2 random numbers in [0,1] drawn per particle and per dimension. Velocity is clamped to ±vmax. If a position leaves the bounds it is clamped to the boundary and that velocity component is set to 0. gBest is synchronous: all particles in an iteration use the gBest from the end of the previous one.

## Workflow

1. Initialize positions and velocities (seeded random).
2. Evaluate fitness; set pBest to the start position; set gBest to the best.
3. For each particle: compute inertia, cognitive and social terms, update velocity, clamp, move, clamp, evaluate, update pBest.
4. Update gBest from the pBests.
5. Repeat until the iteration limit.

## Hand-calculation example

Particle at (2, 3), velocity (0.5, −0.2), pBest (1, 1), gBest (0, 0), w = 0.7, c1 = c2 = 1.5, r1 = 0.4, r2 = 0.6, Sphere function:

| | x | y |
|---|---|---|
| inertia | 0.35 | −0.14 |
| cognitive | −0.6 | −1.2 |
| social | −1.8 | −2.7 |
| new velocity | −2.05 | −4.04 |
| new position | −0.05 | −1.04 |

New fitness = 0.0025 + 1.0816 = 1.0841. The Hand Calculation tab reproduces this and compares it with the engine within a 1e-9 tolerance.

## Technologies

HTML, CSS and vanilla JavaScript in a single file; Canvas for the 2D view and charts; Plotly.js (CDN) for the 3D surface.

## Project structure

```
index.html            page layout and tabs
css/style.css         theme and colours
js/engine.js          PSO engine and benchmark functions (no DOM code)
js/app.js             UI: simulator, charts, learning mode, outcomes, saved runs
tests/engine.test.js  unit tests for the engine (Node, no dependencies)
package.json          defines `npm test`
README.md
```

## Run locally

Open `index.html` in a modern browser (the files must stay in the folders shown above). An internet connection is needed for the web font and the 3D tab.

## Testing

```bash
node tests/engine.test.js
```

Ten tests check the textbook velocity and position update, pBest and gBest updates, maximization, velocity clamping, boundary clamping, seed reproducibility, the known optimum of all five functions, and convergence on Sphere. The UI has no automated tests; it was checked by hand.

## Deployment

Netlify: drag the folder onto https://app.netlify.com/drop. Vercel: import the repository, framework preset "Other", no build command. GitHub Pages: Settings, Pages, deploy from the main branch root.

## Screenshots

Add screenshots of the Simulator, 3D tab and Hand Calculation tab here.
