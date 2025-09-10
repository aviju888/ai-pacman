# UC Berkeley AI Pacman - Reinforcement Learning Project



## 📋 Table of Contents

- [Overview](#overview)
- [Project Architecture](#project-architecture)
- [Core Components](#core-components)
- [AI Agents](#ai-agents)
- [Installation & Setup](#installation--setup)
- [Usage Examples](#usage-examples)
- [Testing & Grading](#testing--grading)
- [Understanding the Code](#understanding-the-code)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This project implements and compares different reinforcement learning algorithms in the Pacman environment:

- **Value Iteration**: Model-based approach using dynamic programming
- **Q-Learning**: Model-free temporal difference learning
- **Approximate Q-Learning**: Q-Learning with function approximation
- **Deep Q-Learning**: Neural network-based Q-Learning with experience replay

The project includes both gridworld environments for learning fundamentals and the full Pacman game for practical application.

## 🏗️ Project Architecture

### Core System Components

```
UCB - AI Pacman/
├── Game Engine
│   ├── pacman.py          # Main game controller and CLI interface
│   ├── game.py            # Core game mechanics and state management
│   ├── layout.py          # Game board layout handling
│   └── graphicsDisplay.py # Visual rendering system
│
├── Learning Environments
│   ├── gridworld.py       # Simple MDP environment for testing
│   ├── environment.py     # Abstract environment interface
│   └── mdp.py            # Markov Decision Process framework
│
├── AI Agents
│   ├── valueIterationAgents.py    # Value Iteration implementation
│   ├── qlearningAgents.py         # Q-Learning algorithms
│   ├── learningAgents.py          # Base classes for learning agents
│   ├── deepQLearningAgents.py     # Deep Q-Network implementation
│   └── pacmanAgents.py            # Basic Pacman agents
│
├── Neural Networks
│   ├── nn.py              # Neural network building blocks
│   ├── model.py           # Model architectures
│   └── backend.py         # Training utilities and replay memory
│
├── Feature Extraction
│   ├── featureExtractors.py       # Feature extraction for approximation
│   └── analysis.py               # Parameter analysis for gridworld
│
├── Testing & Evaluation
│   ├── autograder.py      # Automated testing system
│   ├── grading.py         # Grading utilities
│   └── test_cases/        # Test suites for each question
│
└── Utilities
    ├── util.py            # Helper functions and data structures
    ├── textDisplay.py     # Text-based display
    └── ghostAgents.py     # Ghost behavior implementations
```

## 🔧 Core Components

### 1. Game State Management (`game.py`, `pacman.py`)

The game state system tracks:
- **Agent Positions**: Pacman and ghost locations
- **Food Distribution**: Remaining food pellets and power capsules  
- **Game Dynamics**: Score, time, win/lose conditions
- **Action Spaces**: Legal moves for each agent

Key classes:
- `GameState`: Immutable game state representation
- `Agent`: Abstract base class for all agents
- `Configuration`: Position and direction tracking

### 2. Markov Decision Process Framework (`mdp.py`)

Provides the mathematical foundation for decision-making:

```python
class MarkovDecisionProcess:
    def getStates(self)                          # All possible states
    def getPossibleActions(self, state)          # Available actions
    def getTransitionStatesAndProbs(self, state, action)  # Transition model
    def getReward(self, state, action, nextState)         # Reward function
    def isTerminal(self, state)                  # Terminal state check
```

### 3. Learning Environment (`environment.py`, `gridworld.py`)

- **Environment Interface**: Abstract class defining interaction protocol
- **Gridworld**: Simple grid-based MDP for testing and visualization
- **State Transitions**: Probabilistic state changes with noise
- **Reward Structure**: Configurable reward functions

## 🤖 AI Agents

### Value Iteration Agent (`valueIterationAgents.py`)

**Algorithm**: Dynamic Programming approach to solve MDPs

```python
# Core Value Iteration Update
for iteration in range(self.iterations):
    for state in self.mdp.getStates():
        if not self.mdp.isTerminal(state):
            qValues = [self.computeQValueFromValues(state, action) 
                      for action in self.mdp.getPossibleActions(state)]
            self.values[state] = max(qValues) if qValues else 0.0
```

**Key Features**:
- Model-based: Requires complete knowledge of MDP
- Guaranteed convergence to optimal policy
- Computes value function for all states simultaneously

**Usage**:
```bash
python gridworld.py -a value -i 100 -k 10
```

### Q-Learning Agent (`qlearningAgents.py`)

**Algorithm**: Model-free temporal difference learning

```python
# Q-Learning Update Rule
sample = reward + self.discount * self.computeValueFromQValues(nextState)
self.qValues[(state, action)] = (1 - self.alpha) * oldValue + self.alpha * sample
```

**Key Features**:
- **Exploration vs Exploitation**: ε-greedy action selection
- **Learning Rate**: Controls how quickly new information overwrites old
- **Discount Factor**: Balances immediate vs future rewards
- **No Model Required**: Learns directly from experience

**Variants**:
- `QLearningAgent`: Basic Q-Learning
- `PacmanQAgent`: Pacman-specific implementation with training phases
- `ApproximateQAgent`: Function approximation for large state spaces

### Deep Q-Learning Agent (`deepQLearningAgents.py`)

**Algorithm**: Neural network-based Q-Learning with experience replay

**Architecture**:
```python
State Features → Neural Network → Q-Values for each action
```

**Advanced Features**:
- **Experience Replay**: Stores and samples past experiences
- **Target Network**: Stabilizes training with periodic updates
- **Double Q-Learning**: Reduces overestimation bias
- **Feature Extraction**: Converts game state to neural network input

**State Representation**:
- Pacman position (2D coordinates)
- Ghost positions (2D coordinates × number of ghosts)
- Food/capsule grid (flattened boolean array)

## 🚀 Installation & Setup

### Prerequisites

```bash
# Python 3.6+ required
python --version

# Install dependencies (if using deep learning features)
pip install numpy
```

### Quick Start

1. **Clone or download the project files**
2. **Navigate to project directory**:
   ```bash
   cd "UCB - AI Pacman"
   ```
3. **Test the installation**:
   ```bash
   python pacman.py
   ```

## 💡 Usage Examples

### Basic Pacman Game

```bash
# Play manually with keyboard controls (WASD or arrow keys)
python pacman.py

# Run with specific layout
python pacman.py --layout smallClassic

# Use different ghost types
python pacman.py --ghosts DirectionalGhost
```

### Gridworld Experiments

```bash
# Value Iteration with visualization
python gridworld.py -a value -i 100 -g BridgeGrid

# Q-Learning in gridworld
python gridworld.py -a q -k 100 -n 0.2 -e 0.1 -l 0.8

# Manual control in gridworld
python gridworld.py -m
```

### Reinforcement Learning in Pacman

```bash
# Train Q-Learning agent
python pacman.py -p PacmanQAgent -x 2000 -n 2010 -l smallGrid

# Test trained agent
python pacman.py -p PacmanQAgent -n 10 -l smallGrid

# Approximate Q-Learning with features
python pacman.py -p ApproximateQAgent -a extractor=SimpleExtractor -x 50 -n 60

# Deep Q-Learning (if neural network components available)
python pacman.py -p PacmanDeepQAgent -x 1000 -n 1010 -l smallGrid
```

### Parameter Tuning

```bash
# Adjust learning parameters
python pacman.py -p PacmanQAgent -a epsilon=0.1,alpha=0.3,gamma=0.8

# Control exploration
python pacman.py -p PacmanQAgent -a epsilon=0.05  # Less exploration
python pacman.py -p PacmanQAgent -a epsilon=0.3   # More exploration

# Modify learning rate
python pacman.py -p PacmanQAgent -a alpha=0.1   # Slower learning
python pacman.py -p PacmanQAgent -a alpha=0.5   # Faster learning
```

## 🧪 Testing & Grading

### Automated Testing

```bash
# Run all tests
python autograder.py

# Test specific question
python autograder.py -q q1

# Run specific test case
python autograder.py -t test_cases/q1/1-tinygrid

# Generate solution files (for development)
python autograder.py --generate-solutions
```

### Test Structure

The project includes 6 main questions:

1. **Q1**: Value Iteration implementation
2. **Q2**: Analysis questions (parameter tuning)
3. **Q3**: Q-Learning implementation  
4. **Q4**: Q-Learning in Pacman
5. **Q5**: Approximate Q-Learning
6. **Q6**: Feature extraction and analysis

### Manual Testing

```bash
# Test Value Iteration
python gridworld.py -a value -i 5 -k 3

# Test Q-Learning convergence
python crawler.py

# Verify Pacman Q-Learning
python pacman.py -p PacmanQAgent -x 2000 -n 2010 -l smallGrid -q
```

## 📚 Understanding the Code

### Key Algorithms Implemented

#### 1. Value Iteration
```python
# Bellman equation for optimal value function
V*(s) = max_a Σ_{s'} T(s,a,s')[R(s,a,s') + γV*(s')]
```

#### 2. Q-Learning Update
```python
# Temporal difference update
Q(s,a) ← Q(s,a) + α[R(s,a,s') + γ max_a' Q(s',a') - Q(s,a)]
```

#### 3. Policy Extraction
```python
# Greedy policy from Q-values
π*(s) = argmax_a Q*(s,a)
```

### Important Parameters

- **α (alpha)**: Learning rate (0.0-1.0)
  - Higher values learn faster but may be unstable
  - Lower values learn slower but more stable

- **ε (epsilon)**: Exploration rate (0.0-1.0)  
  - Higher values explore more (random actions)
  - Lower values exploit more (greedy actions)

- **γ (gamma)**: Discount factor (0.0-1.0)
  - Higher values consider future rewards more
  - Lower values focus on immediate rewards

- **Training Episodes**: Number of learning episodes
  - More episodes generally improve performance
  - Diminishing returns after convergence

### State Representation

#### Gridworld States
- Simple (x,y) coordinate tuples
- Terminal states marked specially

#### Pacman States
- Complex objects containing:
  - Agent positions and orientations
  - Food grid (boolean matrix)
  - Capsule locations
  - Score and game status

### Action Spaces

#### Gridworld Actions
- `'north', 'south', 'east', 'west'`
- `'exit'` for terminal states

#### Pacman Actions  
- `Directions.NORTH, SOUTH, EAST, WEST, STOP`
- Legal actions depend on walls and game state

## 🔬 Advanced Features

### Feature Extraction (`featureExtractors.py`)

For approximate Q-learning, features extract relevant information:

```python
class SimpleExtractor(FeatureExtractor):
    def getFeatures(self, state, action):
        features = util.Counter()
        features["bias"] = 1.0
        features["#-of-ghosts-1-step-away"] = ghostCount
        features["eats-food"] = 1.0 if foodEaten else 0.0
        return features
```

### Neural Networks (`nn.py`, `model.py`)

Deep Q-Learning uses neural networks to approximate Q-functions:

- **Linear Layers**: Fully connected transformations
- **ReLU Activation**: Non-linear activation functions  
- **Batch Processing**: Efficient computation
- **Gradient Descent**: Parameter optimization

### Experience Replay (`backend.py`)

Stores agent experiences for stable learning:

```python
class ReplayMemory:
    def store(self, state, action, reward, next_state, done):
        # Store experience tuple
    
    def sample(self, batch_size):
        # Sample random batch for training
```

## 🐛 Troubleshooting

### Common Issues

1. **Import Errors**
   ```bash
   # Ensure you're in the correct directory
   cd "UCB - AI Pacman"
   python pacman.py
   ```

2. **Graphics Issues**
   ```bash
   # Use text display if graphics fail
   python pacman.py -t
   
   # Or quiet mode for no display
   python pacman.py -q
   ```

3. **Slow Training**
   ```bash
   # Reduce training episodes for testing
   python pacman.py -p PacmanQAgent -x 100 -n 110
   
   # Use smaller layouts
   python pacman.py -l smallGrid
   ```

4. **Memory Issues with Deep Q-Learning**
   ```bash
   # Reduce replay memory size
   # Modify deepQLearningAgents.py: ReplayMemory(10000)
   ```

### Performance Tips

1. **Faster Training**: Use `-q` flag to disable graphics
2. **Parameter Tuning**: Start with default parameters, then adjust
3. **Layout Selection**: Use smaller layouts for faster experimentation
4. **Batch Testing**: Use autograder for systematic evaluation

### Debug Mode

```bash
# Enable verbose output
python pacman.py -p PacmanQAgent -x 10 -n 20 -l smallGrid

# Print Q-values during training (modify agent code)
# Add print statements in update() method
```

## 📖 Educational Objectives

This project teaches:

1. **Markov Decision Processes**: Mathematical framework for sequential decision making
2. **Dynamic Programming**: Value iteration and policy iteration algorithms  
3. **Temporal Difference Learning**: Q-learning and SARSA algorithms
4. **Function Approximation**: Handling large state spaces with features
5. **Deep Reinforcement Learning**: Neural network-based value functions
6. **Exploration vs Exploitation**: Balancing learning and performance
7. **Parameter Sensitivity**: Understanding hyperparameter effects

## 🎓 Assignment Questions

The project typically includes these learning objectives:

- **Q1**: Implement value iteration algorithm
- **Q2**: Analyze MDP parameters (discount, noise, living reward)  
- **Q3**: Implement Q-learning algorithm
- **Q4**: Apply Q-learning to Pacman game
- **Q5**: Implement approximate Q-learning with function approximation
- **Q6**: Design and test feature extractors

Each question builds understanding of reinforcement learning concepts while providing hands-on implementation experience.

---

## 🏆 Credits

**Original Development**: UC Berkeley Intro to AI

**Educational Purpose**: This implementation is designed for learning reinforcement learning concepts in an engaging, visual environment.

**License**: Educational use only - please follow UC Berkeley's academic integrity policies.
