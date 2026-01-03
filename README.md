# AI-Pacman: Reinforcement Learning Demo

An interactive web-based demonstration of reinforcement learning algorithms using the classic Pacman game. Based on the UC Berkeley AI Pacman Projects.

## Quick Start

```bash
# 1. Install dependencies
./run.sh install

# 2. Start the development servers
./run.sh dev

# 3. Open http://localhost:3000 in your browser
```

## Project Structure

```
ai-pacman/
├── backend/                    # Python backend (Flask API + RL algorithms)
│   ├── api.py                 # Flask REST API server
│   ├── run.sh                 # Backend runner script
│   ├── requirements.txt       # Python dependencies
│   │
│   ├── # Game Engine
│   ├── pacman.py              # Main game controller
│   ├── game.py                # Core game mechanics
│   ├── layout.py              # Game board layouts
│   │
│   ├── # RL Algorithms
│   ├── valueIterationAgents.py    # Value Iteration
│   ├── qlearningAgents.py         # Q-Learning & Approximate Q-Learning
│   ├── deepQLearningAgents.py     # Deep Q-Network (DQN)
│   ├── learningAgents.py          # Base agent classes
│   │
│   ├── # Environments
│   ├── gridworld.py           # Simple MDP gridworld
│   ├── mdp.py                 # MDP framework
│   ├── environment.py         # Environment interface
│   │
│   ├── layouts/               # Pacman game layouts
│   └── test_cases/            # Autograder test cases
│
├── frontend/                   # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── App.tsx            # Main application
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom hooks (API)
│   │   └── types/             # TypeScript types
│   ├── package.json
│   └── vite.config.ts
│
├── run.sh                      # Main runner script
└── README.md
```

## Features

### Web Demo (Frontend)

The interactive web interface allows you to:

- **Value Iteration**: Visualize how dynamic programming computes optimal policies
- **Q-Learning**: Watch agents learn through exploration and experience
- **Pacman Games**: Train and test RL agents on the actual Pacman game
- **Algorithm Comparison**: Compare Value Iteration vs Q-Learning side by side

### Algorithms Implemented

| Algorithm | Type | Description |
|-----------|------|-------------|
| **Value Iteration** | Model-Based | Dynamic programming approach using the Bellman equation |
| **Q-Learning** | Model-Free | Temporal difference learning from experience |
| **Approximate Q-Learning** | Function Approximation | Q-Learning with feature extraction |
| **Deep Q-Learning** | Deep Learning | Neural network-based Q-value approximation |

## Usage

### Full Stack Development

```bash
# Start both backend and frontend
./run.sh dev
```

- Backend API: http://localhost:5000
- Frontend: http://localhost:3000

### Backend Only

```bash
# Start the Flask API server
./run.sh backend

# Or use the backend's own script
cd backend && ./run.sh api
```

### Frontend Only

```bash
# Start the Vite dev server
./run.sh frontend

# Or directly
cd frontend && npm run dev
```

### Classic CLI Mode

You can still run the original Python scripts directly:

```bash
# Play Pacman interactively
./run.sh pacman

# Train a Q-Learning agent
./run.sh pacman -p PacmanQAgent -x 2000 -n 2010 -l smallGrid

# Run Gridworld
./run.sh gridworld

# Run autograder tests
./run.sh test
```

## API Endpoints

The Flask backend exposes these REST endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/layouts` | GET | List available layouts |
| `/api/agents` | GET | List available agents |
| `/api/algorithms` | GET | Get algorithm details |
| `/api/layout/<name>` | GET | Get specific layout |
| `/api/value-iteration` | POST | Run value iteration |
| `/api/qlearning/start` | POST | Train Q-learning agent |
| `/api/pacman/run` | POST | Run Pacman games |
| `/api/demo/compare` | POST | Compare algorithms |

## Dependencies

### Backend (Python 3.8+)
- Flask
- Flask-CORS
- NumPy
- Matplotlib

### Frontend (Node.js 18+)
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)

## Installation

### Option 1: Using the run script

```bash
./run.sh install
```

### Option 2: Manual installation

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

## RL Concepts Demonstrated

### Value Function
The expected cumulative reward from a state following the optimal policy:
```
V(s) = max_a Σ P(s'|s,a)[R(s,a,s') + γV(s')]
```

### Q-Learning Update
Model-free update rule for action values:
```
Q(s,a) ← Q(s,a) + α[r + γ max_a' Q(s',a') - Q(s,a)]
```

### Key Parameters
- **γ (gamma)**: Discount factor - how much to value future rewards
- **α (alpha)**: Learning rate - how quickly to update estimates
- **ε (epsilon)**: Exploration rate - probability of random action

## Attribution

Based on the UC Berkeley AI Pacman Projects:
- Original projects: http://ai.berkeley.edu
- Primary creators: John DeNero and Dan Klein
- Student autograding: Brad Miller, Nick Hay, and Pieter Abbeel

## License

Educational use only. See original UC Berkeley licensing terms.
