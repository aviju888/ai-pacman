"""
Flask API Server for AI-Pacman Demo
Exposes reinforcement learning agents and game functionality
"""

import sys
import os
import json
import random
import threading
import time
from flask import Flask, jsonify, request
from flask_cors import CORS

# Import game modules
import layout
import pacman
import game
import gridworld
import util
from valueIterationAgents import ValueIterationAgent
from qlearningAgents import QLearningAgent, PacmanQAgent, ApproximateQAgent
from learningAgents import ValueEstimationAgent, ReinforcementAgent
from featureExtractors import SimpleExtractor, IdentityExtractor
import textDisplay
import ghostAgents

app = Flask(__name__)
CORS(app)

# Store active training sessions
training_sessions = {}
session_lock = threading.Lock()


def get_available_layouts():
    """Get list of available layout files"""
    layouts_dir = os.path.join(os.path.dirname(__file__), 'layouts')
    layouts = []
    if os.path.exists(layouts_dir):
        for f in os.listdir(layouts_dir):
            if f.endswith('.lay'):
                layouts.append(f.replace('.lay', ''))
    return sorted(layouts)


def get_gridworld_grids():
    """Get available gridworld configurations"""
    return ['BookGrid', 'BridgeGrid', 'CliffGrid', 'MazeGrid', 'DiscountGrid']


def serialize_game_state(state):
    """Convert game state to JSON-serializable dict"""
    if state is None:
        return None

    try:
        data = state.data
        return {
            'score': state.getScore(),
            'pacmanPosition': list(state.getPacmanPosition()) if hasattr(state, 'getPacmanPosition') else None,
            'ghostPositions': [list(pos) for pos in state.getGhostPositions()] if hasattr(state, 'getGhostPositions') else [],
            'food': [[data.food[x][y] for y in range(data.food.height)] for x in range(data.food.width)] if hasattr(data, 'food') else [],
            'capsules': [list(c) for c in state.getCapsules()] if hasattr(state, 'getCapsules') else [],
            'isWin': state.isWin(),
            'isLose': state.isLose(),
            'width': data.layout.width if hasattr(data, 'layout') else 0,
            'height': data.layout.height if hasattr(data, 'layout') else 0,
            'walls': [[data.layout.walls[x][y] for y in range(data.layout.height)] for x in range(data.layout.width)] if hasattr(data, 'layout') else []
        }
    except Exception as e:
        return {'error': str(e)}


def serialize_gridworld_state(gw, state, agent=None, values=None, q_values=None):
    """Convert gridworld state to JSON-serializable dict"""
    states = gw.getStates()
    grid_data = {
        'width': gw.grid.width,
        'height': gw.grid.height,
        'currentState': list(state) if state and state != gw.grid.terminalState else None,
        'isTerminal': state == gw.grid.terminalState,
        'states': [],
        'livingReward': gw.livingReward,
        'noise': gw.noise
    }

    for s in states:
        if s == gw.grid.terminalState:
            continue
        x, y = s
        cell = gw.grid[x][y]
        state_info = {
            'x': x,
            'y': y,
            'type': 'terminal' if isinstance(cell, (int, float)) else 'normal',
            'reward': cell if isinstance(cell, (int, float)) else gw.livingReward,
            'actions': list(gw.getPossibleActions(s))
        }

        if values is not None and s in values:
            state_info['value'] = values[s]

        if q_values is not None:
            state_info['qValues'] = {}
            for action in gw.getPossibleActions(s):
                if (s, action) in q_values:
                    state_info['qValues'][action] = q_values[(s, action)]

        grid_data['states'].append(state_info)

    # Add wall info
    grid_data['walls'] = []
    for x in range(gw.grid.width):
        for y in range(gw.grid.height):
            if gw.grid[x][y] == '#':
                grid_data['walls'].append({'x': x, 'y': y})

    return grid_data


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'AI-Pacman API is running'})


@app.route('/api/layouts', methods=['GET'])
def list_layouts():
    """List available Pacman layouts"""
    return jsonify({
        'layouts': get_available_layouts(),
        'gridworlds': get_gridworld_grids()
    })


@app.route('/api/agents', methods=['GET'])
def list_agents():
    """List available RL agents"""
    return jsonify({
        'pacman_agents': [
            {'id': 'PacmanQAgent', 'name': 'Q-Learning Agent', 'description': 'Model-free temporal difference learning'},
            {'id': 'ApproximateQAgent', 'name': 'Approximate Q-Learning Agent', 'description': 'Feature-based function approximation'},
            {'id': 'random', 'name': 'Random Agent', 'description': 'Makes random moves'}
        ],
        'gridworld_agents': [
            {'id': 'ValueIterationAgent', 'name': 'Value Iteration', 'description': 'Model-based dynamic programming'},
            {'id': 'QLearningAgent', 'name': 'Q-Learning', 'description': 'Model-free temporal difference learning'}
        ]
    })


@app.route('/api/layout/<layout_name>', methods=['GET'])
def get_layout(layout_name):
    """Get layout details"""
    try:
        lay = layout.getLayout(layout_name)
        if lay is None:
            return jsonify({'error': f'Layout {layout_name} not found'}), 404

        walls = [[lay.walls[x][y] for y in range(lay.height)] for x in range(lay.width)]
        food = [[lay.food[x][y] for y in range(lay.height)] for x in range(lay.width)]

        return jsonify({
            'name': layout_name,
            'width': lay.width,
            'height': lay.height,
            'walls': walls,
            'food': food,
            'capsules': [list(c) for c in lay.capsules],
            'numGhosts': lay.numGhosts,
            'pacmanStart': list(lay.agentPositions[0][1]) if lay.agentPositions else None,
            'ghostStarts': [list(pos[1]) for pos in lay.agentPositions[1:]] if len(lay.agentPositions) > 1 else []
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/value-iteration', methods=['POST'])
def run_value_iteration():
    """Run value iteration on gridworld"""
    data = request.json or {}
    grid_name = data.get('grid', 'BookGrid')
    iterations = data.get('iterations', 100)
    discount = data.get('discount', 0.9)
    noise = data.get('noise', 0.2)
    living_reward = data.get('livingReward', 0.0)

    try:
        # Get the grid function
        grid_func = getattr(gridworld, f'get{grid_name}', None)
        if grid_func is None:
            return jsonify({'error': f'Grid {grid_name} not found'}), 404

        gw = grid_func()
        gw.setNoise(noise)
        gw.setLivingReward(living_reward)

        # Run value iteration
        agent = ValueIterationAgent(gw, discount=discount, iterations=iterations)

        # Collect values and policy
        values = {}
        policy = {}
        q_values = {}

        for state in gw.getStates():
            if state != gw.grid.terminalState:
                values[state] = agent.getValue(state)
                best_action = agent.getAction(state)
                if best_action:
                    policy[str(state)] = best_action

                for action in gw.getPossibleActions(state):
                    q_values[(state, action)] = agent.getQValue(state, action)

        # Serialize results
        result = {
            'grid': grid_name,
            'iterations': iterations,
            'discount': discount,
            'noise': noise,
            'livingReward': living_reward,
            'gridData': serialize_gridworld_state(gw, None, agent, values, q_values),
            'values': {str(k): v for k, v in values.items()},
            'policy': policy
        }

        return jsonify(result)
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500


@app.route('/api/qlearning/start', methods=['POST'])
def start_qlearning():
    """Start a Q-learning training session"""
    data = request.json or {}
    grid_name = data.get('grid', 'BookGrid')
    episodes = data.get('episodes', 100)
    epsilon = data.get('epsilon', 0.3)
    alpha = data.get('alpha', 0.5)
    discount = data.get('discount', 0.9)
    noise = data.get('noise', 0.2)
    living_reward = data.get('livingReward', 0.0)

    try:
        # Get the grid
        grid_func = getattr(gridworld, f'get{grid_name}', None)
        if grid_func is None:
            return jsonify({'error': f'Grid {grid_name} not found'}), 404

        gw = grid_func()
        gw.setNoise(noise)
        gw.setLivingReward(living_reward)

        # Create environment
        env = gridworld.GridworldEnvironment(gw)

        # Create Q-learning agent
        agent = QLearningAgent(
            actionFn=lambda state: gw.getPossibleActions(state),
            epsilon=epsilon,
            alpha=alpha,
            gamma=discount
        )

        # Run training
        results = []
        for episode in range(episodes):
            agent.startEpisode()
            state = env.getCurrentState()
            total_reward = 0
            steps = 0

            while True:
                actions = gw.getPossibleActions(state)
                if not actions:
                    break

                action = agent.getAction(state)
                if action is None:
                    break

                next_state, reward = env.doAction(action)
                agent.update(state, action, next_state, reward)
                agent.episodeRewards += reward

                total_reward += reward
                steps += 1
                state = next_state

                if state == gw.grid.terminalState or steps > 100:
                    break

            agent.stopEpisode()
            env.reset()

            # Store episode result
            if episode % max(1, episodes // 20) == 0:  # Store every 5% of episodes
                results.append({
                    'episode': episode,
                    'totalReward': total_reward,
                    'steps': steps
                })

        # Get final Q-values and policy
        q_values = {}
        values = {}
        policy = {}

        for state in gw.getStates():
            if state != gw.grid.terminalState:
                actions = gw.getPossibleActions(state)
                if actions:
                    q_vals = [agent.getQValue(state, a) for a in actions]
                    values[state] = max(q_vals) if q_vals else 0
                    policy[str(state)] = agent.getPolicy(state)

                    for action in actions:
                        q_values[(state, action)] = agent.getQValue(state, action)

        return jsonify({
            'grid': grid_name,
            'episodes': episodes,
            'epsilon': epsilon,
            'alpha': alpha,
            'discount': discount,
            'trainingHistory': results,
            'gridData': serialize_gridworld_state(gw, None, agent, values, q_values),
            'values': {str(k): v for k, v in values.items()},
            'policy': policy
        })
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500


@app.route('/api/pacman/run', methods=['POST'])
def run_pacman_game():
    """Run a Pacman game with specified agent"""
    data = request.json or {}
    layout_name = data.get('layout', 'smallGrid')
    agent_type = data.get('agent', 'PacmanQAgent')
    num_training = data.get('numTraining', 10)
    num_games = data.get('numGames', 1)
    epsilon = data.get('epsilon', 0.05)
    alpha = data.get('alpha', 0.2)
    discount = data.get('discount', 0.8)

    try:
        lay = layout.getLayout(layout_name)
        if lay is None:
            return jsonify({'error': f'Layout {layout_name} not found'}), 404

        # Create appropriate agent
        if agent_type == 'PacmanQAgent':
            agent = PacmanQAgent(
                epsilon=epsilon,
                alpha=alpha,
                gamma=discount,
                numTraining=num_training
            )
        elif agent_type == 'ApproximateQAgent':
            agent = ApproximateQAgent(
                extractor='SimpleExtractor',
                epsilon=epsilon,
                alpha=alpha,
                gamma=discount,
                numTraining=num_training
            )
        else:
            # Random agent
            from pacmanAgents import RandomAgent
            agent = RandomAgent()

        # Run games
        ghosts = [ghostAgents.RandomGhost(i + 1) for i in range(lay.numGhosts)]
        display = textDisplay.NullGraphics()

        games = pacman.runGames(
            lay,
            agent,
            ghosts,
            display,
            numGames=num_training + num_games,
            record=False,
            numTraining=num_training,
            catchExceptions=True,
            timeout=30
        )

        # Collect results
        test_games = games[num_training:] if len(games) > num_training else games
        results = {
            'layout': layout_name,
            'agent': agent_type,
            'numTraining': num_training,
            'numGames': num_games,
            'games': [],
            'summary': {
                'wins': sum(1 for g in test_games if g.state.isWin()),
                'losses': sum(1 for g in test_games if g.state.isLose()),
                'avgScore': sum(g.state.getScore() for g in test_games) / len(test_games) if test_games else 0
            }
        }

        for i, g in enumerate(test_games):
            results['games'].append({
                'gameIndex': i,
                'score': g.state.getScore(),
                'isWin': g.state.isWin(),
                'isLose': g.state.isLose(),
                'finalState': serialize_game_state(g.state)
            })

        return jsonify(results)
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500


@app.route('/api/algorithms', methods=['GET'])
def get_algorithms():
    """Get detailed info about available RL algorithms"""
    return jsonify({
        'algorithms': [
            {
                'id': 'value_iteration',
                'name': 'Value Iteration',
                'category': 'Model-Based',
                'description': 'Dynamic programming approach that computes optimal values by iteratively updating state values based on the Bellman equation.',
                'pros': ['Guaranteed to converge to optimal policy', 'Exact solution', 'Works with complete MDP knowledge'],
                'cons': ['Requires complete model of environment', 'Computationally expensive for large state spaces'],
                'parameters': ['discount (γ)', 'iterations'],
                'equation': 'V(s) = max_a Σ P(s\'|s,a)[R(s,a,s\') + γV(s\')]'
            },
            {
                'id': 'qlearning',
                'name': 'Q-Learning',
                'category': 'Model-Free',
                'description': 'Off-policy temporal difference learning algorithm that learns action-value function directly from experience.',
                'pros': ['No model required', 'Learns from exploration', 'Can handle unknown environments'],
                'cons': ['May converge slowly', 'Exploration-exploitation tradeoff', 'Large Q-table for complex states'],
                'parameters': ['learning rate (α)', 'discount (γ)', 'exploration rate (ε)'],
                'equation': 'Q(s,a) ← Q(s,a) + α[r + γ max_a\' Q(s\',a\') - Q(s,a)]'
            },
            {
                'id': 'approximate_qlearning',
                'name': 'Approximate Q-Learning',
                'category': 'Function Approximation',
                'description': 'Q-learning with feature-based function approximation, using weighted sum of features instead of tabular Q-values.',
                'pros': ['Scales to large state spaces', 'Generalizes across similar states', 'More practical for complex problems'],
                'cons': ['Feature engineering required', 'May not converge in all cases', 'Linear approximation limitations'],
                'parameters': ['learning rate (α)', 'discount (γ)', 'exploration rate (ε)', 'features'],
                'equation': 'Q(s,a) = Σ w_i × f_i(s,a)'
            },
            {
                'id': 'deep_qlearning',
                'name': 'Deep Q-Learning (DQN)',
                'category': 'Deep Learning',
                'description': 'Uses neural networks to approximate Q-values, enabling learning in high-dimensional state spaces.',
                'pros': ['Handles complex state representations', 'No manual feature engineering', 'End-to-end learning'],
                'cons': ['Requires significant training data', 'Computationally expensive', 'Hyperparameter sensitive'],
                'parameters': ['learning rate', 'discount (γ)', 'replay buffer size', 'target network update rate'],
                'equation': 'Q(s,a;θ) via neural network with experience replay and target networks'
            }
        ]
    })


@app.route('/api/demo/compare', methods=['POST'])
def compare_algorithms():
    """Compare multiple algorithms on the same problem"""
    data = request.json or {}
    grid_name = data.get('grid', 'BookGrid')
    iterations = data.get('iterations', 100)
    episodes = data.get('episodes', 100)

    results = {
        'grid': grid_name,
        'comparisons': []
    }

    try:
        # Get the grid
        grid_func = getattr(gridworld, f'get{grid_name}', None)
        if grid_func is None:
            return jsonify({'error': f'Grid {grid_name} not found'}), 404

        gw = grid_func()

        # Run Value Iteration
        vi_agent = ValueIterationAgent(gw, discount=0.9, iterations=iterations)
        vi_values = {}
        vi_policy = {}
        for state in gw.getStates():
            if state != gw.grid.terminalState:
                vi_values[str(state)] = vi_agent.getValue(state)
                action = vi_agent.getAction(state)
                if action:
                    vi_policy[str(state)] = action

        results['comparisons'].append({
            'algorithm': 'Value Iteration',
            'iterations': iterations,
            'values': vi_values,
            'policy': vi_policy
        })

        # Run Q-Learning
        env = gridworld.GridworldEnvironment(gw)
        ql_agent = QLearningAgent(
            actionFn=lambda state: gw.getPossibleActions(state),
            epsilon=0.3,
            alpha=0.5,
            gamma=0.9
        )

        for _ in range(episodes):
            ql_agent.startEpisode()
            state = env.getCurrentState()
            while state != gw.grid.terminalState:
                action = ql_agent.getAction(state)
                if action is None:
                    break
                next_state, reward = env.doAction(action)
                ql_agent.update(state, action, next_state, reward)
                ql_agent.episodeRewards += reward
                state = next_state
            ql_agent.stopEpisode()
            env.reset()

        ql_values = {}
        ql_policy = {}
        for state in gw.getStates():
            if state != gw.grid.terminalState:
                actions = gw.getPossibleActions(state)
                if actions:
                    q_vals = [ql_agent.getQValue(state, a) for a in actions]
                    ql_values[str(state)] = max(q_vals) if q_vals else 0
                    ql_policy[str(state)] = ql_agent.getPolicy(state)

        results['comparisons'].append({
            'algorithm': 'Q-Learning',
            'episodes': episodes,
            'values': ql_values,
            'policy': ql_policy
        })

        return jsonify(results)
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=5001, help='Port to run on (default: 5001)')
    args = parser.parse_args()

    print("Starting AI-Pacman API Server...")
    print(f"Running on http://localhost:{args.port}")
    print()
    print("Available endpoints:")
    print("  GET  /api/health - Health check")
    print("  GET  /api/layouts - List available layouts")
    print("  GET  /api/agents - List available agents")
    print("  GET  /api/layout/<name> - Get layout details")
    print("  GET  /api/algorithms - Get algorithm details")
    print("  POST /api/value-iteration - Run value iteration")
    print("  POST /api/qlearning/start - Run Q-learning training")
    print("  POST /api/pacman/run - Run Pacman game")
    print("  POST /api/demo/compare - Compare algorithms")
    print()
    app.run(host='0.0.0.0', port=args.port, debug=True)
