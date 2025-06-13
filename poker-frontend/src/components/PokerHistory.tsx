import React from "react";
import { HandData } from "@/lib/api";

interface PokerHistoryProps {
  hands: HandData[];
}

const PokerHistory: React.FC<PokerHistoryProps> = ({ hands }) => {
  if (!hands || hands.length === 0) {
    return (
      <div className="text-gray-400 text-center py-4 px-2 sm:px-4">
        No hands found. Start a new game!
      </div>
    );
  }

  // Sort hands by most recent
  const sortedHands = [...hands].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="mt-8 px-4 sm:px-6 lg:px-8 py-6 bg-gray-900 rounded-xl shadow-2xl border border-gray-700 max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-6 text-center tracking-wide">
        Hand History
      </h2>
      <ul className="space-y-6">
        {sortedHands.map((hand) => (
          <li
            key={hand.id}
            className="bg-gray-800 p-4 sm:p-5 rounded-lg shadow-md border border-gray-700 transition-all duration-300 hover:bg-gray-700"
          >
            <p className="text-base sm:text-lg mb-1">
              <strong className="text-blue-400 font-semibold">Hand ID:</strong>{" "}
              <span className="text-gray-300">{hand.id}</span>
            </p>
            <p className="text-base sm:text-lg mb-1">
              <strong className="text-blue-400 font-semibold">Created:</strong>{" "}
              <span className="text-gray-300">{new Date(hand.created_at).toLocaleString()}</span>
            </p>

            {/* Stacks */}
            <div className="mt-3 space-y-2">
              <p className="text-base sm:text-lg">
                <strong className="text-blue-400 font-semibold">Stacks:</strong>
              </p>
              <pre className="bg-gray-700 p-3 rounded-md text-xs sm:text-sm font-mono text-green-300 overflow-auto max-h-40 whitespace-pre-wrap break-words">
                {JSON.stringify(hand.stack_settings, null, 2)}
              </pre>
            </div>

            {/* Roles */}
            <div className="mt-3 space-y-2">
              <p className="text-base sm:text-lg">
                <strong className="text-blue-400 font-semibold">Roles:</strong>
              </p>
              <pre className="bg-gray-700 p-3 rounded-md text-xs sm:text-sm font-mono text-green-300 overflow-auto max-h-40 whitespace-pre-wrap break-words">
                {JSON.stringify(hand.player_roles, null, 2)}
              </pre>
            </div>

            {/* Hole Cards */}
            <div className="mt-3 space-y-2">
              <p className="text-base sm:text-lg">
                <strong className="text-blue-400 font-semibold">Hole Cards:</strong>
              </p>
              <pre className="bg-gray-700 p-3 rounded-md text-xs sm:text-sm font-mono text-green-300 overflow-auto max-h-40 whitespace-pre-wrap break-words">
                {JSON.stringify(hand.hole_cards, null, 2)}
              </pre>
            </div>

            {/* Actions */}
            <p className="text-base sm:text-lg mt-3 mb-1">
              <strong className="text-blue-400 font-semibold">Actions:</strong>{" "}
              <span className="text-gray-300">{hand.action_sequence}</span>
            </p>

            {/* Winnings */}
            <div className="mt-3 space-y-2">
              <p className="text-base sm:text-lg">
                <strong className="text-blue-400 font-semibold">Winnings:</strong>
              </p>
              <pre className="bg-gray-700 p-3 rounded-md text-xs sm:text-sm font-mono text-green-300 overflow-auto max-h-40 whitespace-pre-wrap break-words">
                {JSON.stringify(hand.winnings, null, 2)}
              </pre>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PokerHistory;
