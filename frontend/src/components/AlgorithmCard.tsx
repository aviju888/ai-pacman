import React from 'react';
import { BookOpen, ThumbsUp, ThumbsDown, Settings } from 'lucide-react';
import type { Algorithm } from '../types';

interface AlgorithmCardProps {
  algorithm: Algorithm;
  selected?: boolean;
  onClick?: () => void;
}

export const AlgorithmCard: React.FC<AlgorithmCardProps> = ({
  algorithm,
  selected = false,
  onClick,
}) => {
  return (
    <div
      className={`
        p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
        ${selected
          ? 'border-blue-500 bg-blue-900/30'
          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
        }
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold text-white">{algorithm.name}</h3>
          <span className="text-xs px-2 py-0.5 bg-gray-700 rounded text-gray-300">
            {algorithm.category}
          </span>
        </div>
        <BookOpen className="w-5 h-5 text-gray-500" />
      </div>

      <p className="text-sm text-gray-400 mb-3">{algorithm.description}</p>

      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <ThumbsUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-400">
            {algorithm.pros.slice(0, 2).join(', ')}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <ThumbsDown className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-400">
            {algorithm.cons.slice(0, 2).join(', ')}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Settings className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-400">
            {algorithm.parameters.join(', ')}
          </div>
        </div>
      </div>

      <div className="mt-3 p-2 bg-gray-900 rounded font-mono text-xs text-green-400 overflow-x-auto">
        {algorithm.equation}
      </div>
    </div>
  );
};
