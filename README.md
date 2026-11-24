# SwarmX – Interactive PSO Studio

An interactive tool for learning and experimenting with **Particle Swarm Optimization (PSO)**. Change the algorithm's parameters, run different optimization problems, and see how particles move towards the best solution at each iteration.

**Live Demo:** https://swarmx-pso-us33.vercel.app/


## About the Project

Particle Swarm Optimization is easier to understand when you can actually see how it works. Instead of just reading equations, SwarmX lets you run the algorithm and follow the calculations behind every particle's movement.

You can experiment with different benchmark functions, adjust PSO parameters, and observe how the swarm behaves. Each iteration uses the actual PSO algorithm, not predefined particle movements.

There is also a hand-calculation section where you can enter values manually and compare the results with the algorithm's output.

## Features

### PSO Simulator
- Implements the Global Best Particle Swarm Optimization algorithm.
- Uses seeded random values so experiments can be reproduced.
- Supports five benchmark functions: Sphere, Rastrigin, Rosenbrock, Ackley, and Booth.
- Supports both minimization and maximization.
- Adjustable parameters including number of particles, iterations, inertia weight (w), cognitive coefficient (c1), social coefficient (c2), velocity, velocity limit, and search boundaries.
- Includes presets for quickly testing different configurations.
- Play, pause, step forward, step backward, reset, and restart controls.
- Stores iteration history so previous states can be revisited without recalculating or changing earlier results.

### Visualizations
- 2D heatmap showing the search space and particle positions.
- Particle trails to track movement across iterations.
- Velocity arrows, personal best, and global best markers.
- Zoom, pan, and coordinate inspection.
- Interactive 3D surface visualization using Plotly.
- Convergence and swarm diversity charts.
- Live statistics during execution.

### Particle Calculations
- View the calculations for individual particles.
- See inertia, cognitive, and social components separately.
- Displays the actual values substituted into the PSO equations.
- Follow how velocity and position are updated at each step.

### Learning Mode
- Contains 12 guided learning steps.
- Beginner and Expert explanations.
- Explains the algorithm through the simulation rather than just theory.

### Particle Tracking
- Select any particle and inspect its movement throughout the run.
- View its complete position history.
- Plot its trajectory.
- Export particle data as CSV.

### Hand Calculation
- Includes a textbook PSO example.
- Allows manual editing of particle positions, velocities, and algorithm parameters.
- Calculates velocity and position updates using the standard PSO equations.
- Compares manual calculations with the actual engine output using a tolerance of `1e-9`.

### Compare Experiments
- Run two different PSO configurations using the same random seed.
- Compare their performance and convergence.
- Generates a summary of the results.
- Export comparison data as CSV.

### Additional Features
- Save experiments and replay them later using browser storage.
- Learning Outcomes section with 10 unlockable outcomes.
- An 8-question knowledge test.
- A 20-seed challenge to test the algorithm's success rate.
- Light and dark themes.

## PSO Equations

The velocity and position of each particle are updated using:

```text
v(t+1) = w * v(t)
       + c1 * r1 * (pBest - x(t))
       + c2 * r2 * (gBest - x(t))

x(t+1) = x(t) + v(t+1)
```

Where:

- `w` – Inertia weight
- `c1` – Cognitive coefficient
- `c2` – Social coefficient
- `r1`, `r2` – Random values between 0 and 1
- `pBest` – Best position found by an individual particle
- `gBest` – Best position found by the entire swarm

Velocity is restricted to the range `[-vmax, vmax]`. If a particle moves outside the search boundaries, its position is clamped to the boundary and the corresponding velocity component is set to zero.

All particles in an iteration use the global best position from the end of the previous iteration. This keeps the update process synchronous.

## How the Algorithm Works

The implementation follows the standard Global Best PSO procedure:

1. **Initialization:** Generate random particle positions and velocities using the selected seed.
2. **Fitness Evaluation:** Evaluate each particle's position and initialize its personal best.
3. **Global Best:** Find the best position among all particles.
4. **Velocity Update:** Calculate the inertia, cognitive, and social components for each particle.
5. **Position Update:** Update velocity, apply velocity limits, and calculate the new position.
6. **Boundary Handling:** Keep particles within the selected search range.
7. **Personal Best Update:** Evaluate the new position and update pBest when an improvement is found.
8. **Global Best Update:** Find the best personal best across the swarm.
9. **Repeat:** Continue until the selected iteration limit is reached.

## Hand Calculation Example

Consider a particle with the following initial values:

| Parameter | Value |
|---|---|
| Position | (2, 3) |
| Velocity | (0.5, -0.2) |
| Personal Best | (1, 1) |
| Global Best | (0, 0) |
| Inertia (w) | 0.7 |
| Cognitive (c1) | 1.5 |
| Social (c2) | 1.5 |
| Random values (r1, r2) | (0.4, 0.6) |

Using the PSO equations:

| Component | X | Y |
|---|---:|---:|
| Inertia | 0.35 | -0.14 |
| Cognitive | -0.6 | -1.2 |
| Social | -1.8 | -2.7 |
| New Velocity | -2.05 | -4.04 |
| New Position | -0.05 | -1.04 |

For the Sphere function:

```text
f(x, y) = x² + y²

f(-0.05, -1.04) = 1.0841
```

The Hand Calculation section performs these calculations and checks them against the PSO engine output.

## Technologies Used

- **HTML** – Application structure
- **CSS** – Styling and responsive layout
- **JavaScript** – PSO engine and application logic
- **Canvas API** – 2D visualization and charts
- **Plotly.js** – Interactive 3D surface visualization

The project is built using vanilla HTML, CSS, and JavaScript. No frontend framework or build setup is required.

## Project Structure

```text
SwarmX/
│
├── index.html          # Main HTML application
├── style.css           # Styling and responsive layout
├── app.js              # Application logic and PSO visualization
├── engine.js           # PSO algorithm implementation
├── engine.test.js      # Unit tests for the PSO engine
├── package.json        # Project dependencies and scripts
├── .gitignore          # Git ignored files configuration
├── README.md           # Project documentation
└── swarmx-pso-repo.zip # Project archive
```

The PSO engine functions (`init`, `step`, and `run`) are kept separate from the DOM-related code, making the algorithm easier to understand and test independently.

## Running Locally

You don't need to install any dependencies or configure a development environment.

1. Clone or download this repository.
2. Open the project folder.
3. Open `index.html` in a modern web browser.

An internet connection is required for the external web font and Plotly.js used in the 3D visualization.

## Deployment

**Vercel**
1. Import the GitHub repository.
2. Select **Other** as the framework preset.
3. Leave the build command empty.
4. Deploy the project.

**GitHub Pages**
1. Open the repository settings.
2. Go to Pages.
3. Select deployment from the main branch.
4. Choose the root folder and save.

**Google Drive Link**
https://drive.google.com/file/d/1ftAYP-cD6puM3RniHHq4wBfqXKCcqaIA/view?usp=sharing

## Screenshots


### PSO Simulator
<img width="1896" height="946" alt="image" src="https://github.com/user-attachments/assets/6742cd37-9eae-44a6-aaab-acdd0e5ba0ea" />
