"use client";

import React from 'react';

interface PokerLogProps {
  logs: string[];
}

const PokerLog: React.FC<PokerLogProps> = ({ logs }) => {
  return (
    <div className="p-4 bg-gray-900 rounded-lg shadow-md border border-gray-700 max-w-md w-full mx-auto h-72 sm:h-80 md:h-96 overflow-hidden flex flex-col">
      <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white text-center border-b border-gray-600 pb-2">
        Play Log
      </h2>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pr-1 space-y-2">
        {logs.length === 0 ? (
          <p className="text-gray-400 italic text-center">No actions yet. Start a new hand to begin playing.</p>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className="p-2 bg-gray-800 rounded-md shadow-sm text-gray-300 text-sm sm:text-base"
            >
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PokerLog;
