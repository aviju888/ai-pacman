import React, { useState, useEffect } from 'react';
import {
  Brain,
  Play,
  Settings,
  BarChart3,
  GitCompare,
  Loader2,
  AlertCircle,
  CheckCircle,
  Ghost
} from 'lucide-react';
import { useApi } from './hooks/useApi';
import { GridWorld } from './components/GridWorld';
import { AlgorithmCard } from './components/AlgorithmCard';
import { ParameterSlider } from './components/ParameterSlider';
import { TrainingChart } from './components/TrainingChart';
import type { Algorithm, ValueIterationResult, QLearningResult, PacmanGameResult } from './types';

type Tab = 'overview' | 'value-iteration' | 'qlearning' | 'pacman' | 'compare';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [gridworlds, setGridworlds] = useState<string[]>([]);
  const [layouts, setLayouts] = useState<string[]>([]);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

  // Value Iteration state
  const [viGrid, setViGrid] = useState('BookGrid');
  const [viIterations, setViIterations] = useState(100);
  const [viDiscount, setViDiscount] = useState(0.9);
  const [viNoise, setViNoise] = useState(0.2);
  const [viLivingReward, setViLivingReward] = useState(0);
  const [viResult, setViResult] = useState<ValueIterationResult | null>(null);

  // Q-Learning state
  const [qlGrid, setQlGrid] = useState('BookGrid');
  const [qlEpisodes, setQlEpisodes] = useState(100);
  const [qlEpsilon, setQlEpsilon] = useState(0.3);
  const [qlAlpha, setQlAlpha] = useState(0.5);
  const [qlDiscount, setQlDiscount] = useState(0.9);
  const [qlResult, setQlResult] = useState<QLearningResult | null>(null);

  // Pacman state
  const [pacmanLayout, setPacmanLayout] = useState('smallGrid');
  const [pacmanAgent, setPacmanAgent] = useState('PacmanQAgent');
  const [pacmanTraining, setPacmanTraining] = useState(50);
  const [pacmanGames, setPacmanGames] = useState(5);
  const [pacmanResult, setPacmanResult] = useState<PacmanGameResult | null>(null);

  // Compare state
  const [compareGrid, setCompareGrid] = useState('BookGrid');
  const [compareResult, setCompareResult] = useState<{
    grid: string;
    comparisons: { algorithm: string; values: Record<string, number>; policy: Record<string, string> }[];
  } | null>(null);

  const api = useApi();

  // Check API connection and load initial data
  useEffect(() => {
    const init = async () => {
      const health = await api.healthCheck();
      setApiConnected(health !== null);

      if (health) {
        const layoutsData = await api.getLayouts();
        if (layoutsData) {
          setGridworlds(layoutsData.gridworlds);
          setLayouts(layoutsData.layouts);
        }

        const algoData = await api.getAlgorithms();
        if (algoData) {
          setAlgorithms(algoData.algorithms);
        }
      }
    };
    init();
  }, []);

  const runValueIteration = async () => {
    const result = await api.runValueIteration({
      grid: viGrid,
      iterations: viIterations,
      discount: viDiscount,
      noise: viNoise,
      livingReward: viLivingReward,
    });
    if (result) setViResult(result);
  };

  const runQLearning = async () => {
    const result = await api.runQLearning({
      grid: qlGrid,
      episodes: qlEpisodes,
      epsilon: qlEpsilon,
      alpha: qlAlpha,
      discount: qlDiscount,
    });
    if (result) setQlResult(result);
  };

  const runPacman = async () => {
    const result = await api.runPacmanGame({
      layout: pacmanLayout,
      agent: pacmanAgent,
      numTraining: pacmanTraining,
      numGames: pacmanGames,
    });
    if (result) setPacmanResult(result);
  };

  const runCompare = async () => {
    const result = await api.compareAlgorithms({
      grid: compareGrid,
      iterations: 100,
      episodes: 100,
    });
    if (result) setCompareResult(result);
  };

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: Brain },
    { id: 'value-iteration' as Tab, label: 'Value Iteration', icon: BarChart3 },
    { id: 'qlearning' as Tab, label: 'Q-Learning', icon: Settings },
    { id: 'pacman' as Tab, label: 'Pacman', icon: Ghost },
    { id: 'compare' as Tab, label: 'Compare', icon: GitCompare },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[12px] border-r-gray-900 ml-1" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI-Pacman</h1>
                <p className="text-xs text-gray-400">Reinforcement Learning Demo</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {apiConnected === null ? (
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              ) : apiConnected ? (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  API Connected
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  API Disconnected
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                  border-b-2 -mb-px
                  ${activeTab === tab.id
                    ? 'text-blue-400 border-blue-400'
                    : 'text-gray-400 border-transparent hover:text-gray-300'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {api.error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{api.error}</span>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4">
                Learn Reinforcement Learning with Pacman
              </h2>
              <p className="text-gray-400">
                This interactive demo showcases various reinforcement learning algorithms
                implemented in Python. Explore how agents learn to make optimal decisions
                through experience, from simple gridworlds to the classic Pacman game.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {algorithms.map((algo) => (
                <AlgorithmCard key={algo.id} algorithm={algo} />
              ))}
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Getting Started</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="text-blue-400 font-semibold mb-2">1. Value Iteration</div>
                  <p className="text-gray-400">
                    Start with the Value Iteration tab to see how dynamic programming
                    computes optimal policies when the environment is fully known.
                  </p>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="text-green-400 font-semibold mb-2">2. Q-Learning</div>
                  <p className="text-gray-400">
                    Explore Q-Learning to see how agents learn from experience
                    without knowing the environment dynamics.
                  </p>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="text-yellow-400 font-semibold mb-2">3. Pacman</div>
                  <p className="text-gray-400">
                    Watch trained agents play Pacman and see how these algorithms
                    scale to more complex environments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Value Iteration Tab */}
        {activeTab === 'value-iteration' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Parameters</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Grid</label>
                    <select
                      value={viGrid}
                      onChange={(e) => setViGrid(e.target.value)}
                      className="w-full bg-gray-700 text-white rounded px-3 py-2"
                    >
                      {gridworlds.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <ParameterSlider
                    label="Iterations"
                    value={viIterations}
                    min={1}
                    max={500}
                    step={1}
                    onChange={setViIterations}
                    description="Number of value iteration sweeps"
                  />
                  <ParameterSlider
                    label="Discount (γ)"
                    value={viDiscount}
                    min={0}
                    max={1}
                    onChange={setViDiscount}
                    description="How much to value future rewards"
                  />
                  <ParameterSlider
                    label="Noise"
                    value={viNoise}
                    min={0}
                    max={0.5}
                    onChange={setViNoise}
                    description="Probability of unintended action"
                  />
                  <ParameterSlider
                    label="Living Reward"
                    value={viLivingReward}
                    min={-2}
                    max={2}
                    onChange={setViLivingReward}
                    description="Reward for each step taken"
                  />
                </div>
                <button
                  onClick={runValueIteration}
                  disabled={api.loading}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                >
                  {api.loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Run Value Iteration
                </button>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-2">How it works</h4>
                <p className="text-xs text-gray-400">
                  Value Iteration computes the optimal value for each state by iteratively
                  applying the Bellman equation. The value represents the expected cumulative
                  reward from that state when following the optimal policy. Arrows show the
                  best action to take from each state.
                </p>
              </div>
            </div>

            <div className="lg:col-span-2">
              {viResult ? (
                <div className="flex flex-col items-center">
                  <GridWorld
                    gridData={viResult.gridData}
                    policy={viResult.policy}
                    showValues={true}
                    title={`${viResult.grid} - ${viResult.iterations} iterations`}
                  />
                  <div className="mt-4 text-sm text-gray-400">
                    Discount: {viResult.discount} | Noise: {(viResult.noise * 100).toFixed(0)}%
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Configure parameters and run Value Iteration</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Q-Learning Tab */}
        {activeTab === 'qlearning' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Parameters</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Grid</label>
                    <select
                      value={qlGrid}
                      onChange={(e) => setQlGrid(e.target.value)}
                      className="w-full bg-gray-700 text-white rounded px-3 py-2"
                    >
                      {gridworlds.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <ParameterSlider
                    label="Episodes"
                    value={qlEpisodes}
                    min={10}
                    max={500}
                    step={10}
                    onChange={setQlEpisodes}
                    description="Number of training episodes"
                  />
                  <ParameterSlider
                    label="Epsilon (ε)"
                    value={qlEpsilon}
                    min={0}
                    max={1}
                    onChange={setQlEpsilon}
                    description="Exploration rate"
                  />
                  <ParameterSlider
                    label="Alpha (α)"
                    value={qlAlpha}
                    min={0}
                    max={1}
                    onChange={setQlAlpha}
                    description="Learning rate"
                  />
                  <ParameterSlider
                    label="Discount (γ)"
                    value={qlDiscount}
                    min={0}
                    max={1}
                    onChange={setQlDiscount}
                    description="Discount factor"
                  />
                </div>
                <button
                  onClick={runQLearning}
                  disabled={api.loading}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                >
                  {api.loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Train Q-Learning Agent
                </button>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-2">How it works</h4>
                <p className="text-xs text-gray-400">
                  Q-Learning is a model-free algorithm that learns action values (Q-values)
                  through experience. The agent explores the environment using an ε-greedy
                  policy and updates Q-values based on observed rewards. No knowledge of
                  transition probabilities is required.
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {qlResult ? (
                <>
                  <div className="flex flex-col items-center">
                    <GridWorld
                      gridData={qlResult.gridData}
                      policy={qlResult.policy}
                      showValues={true}
                      title={`${qlResult.grid} - ${qlResult.episodes} episodes`}
                    />
                  </div>
                  {qlResult.trainingHistory.length > 0 && (
                    <TrainingChart
                      data={qlResult.trainingHistory}
                      title="Training Progress"
                    />
                  )}
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Configure parameters and train a Q-Learning agent</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pacman Tab */}
        {activeTab === 'pacman' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Game Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Layout</label>
                    <select
                      value={pacmanLayout}
                      onChange={(e) => setPacmanLayout(e.target.value)}
                      className="w-full bg-gray-700 text-white rounded px-3 py-2"
                    >
                      {layouts.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Agent</label>
                    <select
                      value={pacmanAgent}
                      onChange={(e) => setPacmanAgent(e.target.value)}
                      className="w-full bg-gray-700 text-white rounded px-3 py-2"
                    >
                      <option value="PacmanQAgent">Q-Learning Agent</option>
                      <option value="ApproximateQAgent">Approximate Q-Learning</option>
                      <option value="random">Random Agent</option>
                    </select>
                  </div>
                  <ParameterSlider
                    label="Training Games"
                    value={pacmanTraining}
                    min={0}
                    max={200}
                    step={10}
                    onChange={setPacmanTraining}
                    description="Number of training games"
                  />
                  <ParameterSlider
                    label="Test Games"
                    value={pacmanGames}
                    min={1}
                    max={20}
                    step={1}
                    onChange={setPacmanGames}
                    description="Number of test games to run"
                  />
                </div>
                <button
                  onClick={runPacman}
                  disabled={api.loading}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                >
                  {api.loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Run Pacman
                </button>
              </div>
            </div>

            <div className="lg:col-span-2">
              {pacmanResult ? (
                <div className="space-y-6">
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Results Summary</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-green-900/30 p-4 rounded-lg">
                        <div className="text-3xl font-bold text-green-400">
                          {pacmanResult.summary.wins}
                        </div>
                        <div className="text-sm text-gray-400">Wins</div>
                      </div>
                      <div className="bg-red-900/30 p-4 rounded-lg">
                        <div className="text-3xl font-bold text-red-400">
                          {pacmanResult.summary.losses}
                        </div>
                        <div className="text-sm text-gray-400">Losses</div>
                      </div>
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <div className="text-3xl font-bold text-blue-400">
                          {pacmanResult.summary.avgScore.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-400">Avg Score</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Game Results</h3>
                    <div className="space-y-2">
                      {pacmanResult.games.map((game) => (
                        <div
                          key={game.gameIndex}
                          className={`flex justify-between items-center p-3 rounded ${
                            game.isWin ? 'bg-green-900/20' : 'bg-red-900/20'
                          }`}
                        >
                          <span className="text-gray-300">Game {game.gameIndex + 1}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-400">Score: {game.score}</span>
                            <span className={game.isWin ? 'text-green-400' : 'text-red-400'}>
                              {game.isWin ? 'WIN' : 'LOSE'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Ghost className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Configure settings and run Pacman games</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compare Tab */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Grid</label>
                  <select
                    value={compareGrid}
                    onChange={(e) => setCompareGrid(e.target.value)}
                    className="bg-gray-700 text-white rounded px-3 py-2"
                  >
                    {gridworlds.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={runCompare}
                  disabled={api.loading}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors mt-5"
                >
                  {api.loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <GitCompare className="w-4 h-4" />
                  )}
                  Compare Algorithms
                </button>
              </div>
            </div>

            {compareResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {compareResult.comparisons.map((comp) => (
                  <div key={comp.algorithm} className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">{comp.algorithm}</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-400">
                            <th className="text-left py-2">State</th>
                            <th className="text-right py-2">Value</th>
                            <th className="text-right py-2">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(comp.values).slice(0, 10).map(([state, value]) => (
                            <tr key={state} className="border-t border-gray-700">
                              <td className="py-2 text-gray-300">{state}</td>
                              <td className="py-2 text-right text-blue-400">
                                {typeof value === 'number' ? value.toFixed(3) : value}
                              </td>
                              <td className="py-2 text-right text-green-400">
                                {comp.policy[state] || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!compareResult && (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <GitCompare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a grid and compare Value Iteration vs Q-Learning</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>
              Based on the UC Berkeley AI Pacman Projects.
              Educational reinforcement learning demonstration.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
