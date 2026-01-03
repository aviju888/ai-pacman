export interface GridState {
  x: number;
  y: number;
  type: 'normal' | 'terminal';
  reward: number;
  actions: string[];
  value?: number;
  qValues?: Record<string, number>;
}

export interface GridData {
  width: number;
  height: number;
  currentState: [number, number] | null;
  isTerminal: boolean;
  states: GridState[];
  walls: { x: number; y: number }[];
  livingReward: number;
  noise: number;
}

export interface ValueIterationResult {
  grid: string;
  iterations: number;
  discount: number;
  noise: number;
  livingReward: number;
  gridData: GridData;
  values: Record<string, number>;
  policy: Record<string, string>;
}

export interface QLearningResult {
  grid: string;
  episodes: number;
  epsilon: number;
  alpha: number;
  discount: number;
  trainingHistory: { episode: number; totalReward: number; steps: number }[];
  gridData: GridData;
  values: Record<string, number>;
  policy: Record<string, string>;
}

export interface Algorithm {
  id: string;
  name: string;
  category: string;
  description: string;
  pros: string[];
  cons: string[];
  parameters: string[];
  equation: string;
}

export interface PacmanGameResult {
  layout: string;
  agent: string;
  numTraining: number;
  numGames: number;
  games: {
    gameIndex: number;
    score: number;
    isWin: boolean;
    isLose: boolean;
  }[];
  summary: {
    wins: number;
    losses: number;
    avgScore: number;
  };
}
