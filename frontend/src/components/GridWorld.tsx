import React from 'react';
import type { GridData } from '../types';

interface GridWorldProps {
  gridData: GridData;
  policy?: Record<string, string>;
  showValues?: boolean;
  showQValues?: boolean;
  title?: string;
}

const CELL_SIZE = 60;

const getArrowForAction = (action: string): string => {
  switch (action) {
    case 'north': return '↑';
    case 'south': return '↓';
    case 'east': return '→';
    case 'west': return '←';
    case 'exit': return '✓';
    default: return '';
  }
};

const getValueColor = (value: number): string => {
  if (value > 0.5) return 'bg-green-600';
  if (value > 0) return 'bg-green-400';
  if (value > -0.5) return 'bg-yellow-500';
  if (value > -1) return 'bg-orange-500';
  return 'bg-red-600';
};

export const GridWorld: React.FC<GridWorldProps> = ({
  gridData,
  policy = {},
  showValues = true,
  showQValues = false,
  title,
}) => {
  const { width, height, states, walls } = gridData;

  // Create a 2D grid representation
  const grid: (typeof states[0] | 'wall' | null)[][] = Array(width)
    .fill(null)
    .map(() => Array(height).fill(null));

  // Fill in walls
  walls.forEach(({ x, y }) => {
    grid[x][y] = 'wall';
  });

  // Fill in states
  states.forEach((state) => {
    grid[state.x][state.y] = state;
  });

  return (
    <div className="flex flex-col items-center">
      {title && (
        <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
      )}
      <div
        className="grid gap-1 bg-gray-800 p-2 rounded-lg"
        style={{
          gridTemplateColumns: `repeat(${width}, ${CELL_SIZE}px)`,
        }}
      >
        {/* Render from top to bottom (reverse y) */}
        {Array.from({ length: height }).map((_, rowIdx) => {
          const y = height - 1 - rowIdx;
          return Array.from({ length: width }).map((_, x) => {
            const cell = grid[x][y];

            if (cell === 'wall') {
              return (
                <div
                  key={`${x}-${y}`}
                  className="bg-gray-700 rounded"
                  style={{ width: CELL_SIZE, height: CELL_SIZE }}
                />
              );
            }

            if (cell === null) {
              return (
                <div
                  key={`${x}-${y}`}
                  className="bg-gray-900 rounded opacity-50"
                  style={{ width: CELL_SIZE, height: CELL_SIZE }}
                />
              );
            }

            const state = cell;
            const stateKey = `(${x}, ${y})`;
            const action = policy[stateKey];
            const isTerminal = state.type === 'terminal';

            return (
              <div
                key={`${x}-${y}`}
                className={`
                  relative flex flex-col items-center justify-center rounded
                  text-xs font-mono transition-all duration-300
                  ${isTerminal
                    ? state.reward > 0
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                    : showValues && state.value !== undefined
                      ? getValueColor(state.value)
                      : 'bg-blue-900'
                  }
                  ${state.value !== undefined ? 'text-white' : 'text-gray-300'}
                `}
                style={{ width: CELL_SIZE, height: CELL_SIZE }}
                title={`State: (${x}, ${y})\nValue: ${state.value?.toFixed(2) ?? 'N/A'}\nReward: ${state.reward}`}
              >
                {isTerminal ? (
                  <span className="text-lg font-bold">
                    {state.reward > 0 ? `+${state.reward}` : state.reward}
                  </span>
                ) : (
                  <>
                    {showValues && state.value !== undefined && (
                      <span className="text-xs">
                        {state.value.toFixed(2)}
                      </span>
                    )}
                    {action && (
                      <span className="text-xl font-bold mt-1">
                        {getArrowForAction(action)}
                      </span>
                    )}
                    {showQValues && state.qValues && (
                      <div className="absolute inset-0 flex flex-col text-[8px] p-0.5">
                        <div className="flex-1 flex items-start justify-center">
                          {state.qValues.north?.toFixed(1)}
                        </div>
                        <div className="flex justify-between">
                          <span>{state.qValues.west?.toFixed(1)}</span>
                          <span>{state.qValues.east?.toFixed(1)}</span>
                        </div>
                        <div className="flex-1 flex items-end justify-center">
                          {state.qValues.south?.toFixed(1)}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          });
        })}
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Noise: {(gridData.noise * 100).toFixed(0)}% | Living Reward: {gridData.livingReward}
      </div>
    </div>
  );
};
