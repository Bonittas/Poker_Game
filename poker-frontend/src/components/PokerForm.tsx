"use client";

import React, { useState } from 'react';
import '../app/globals.css';

// Define types for the component props and state
interface PokerFormProps {
  onAction: (action: string, amount?: number) => void;
  onReset: () => void;
  isFirstHand: boolean;
  disabledActions: string[];
  currentBet: number;
  bigBlindSize: number;
}

const PokerForm: React.FC<PokerFormProps> = ({
  onAction,
  onReset,
  isFirstHand,
  disabledActions,
  bigBlindSize
}) => {
  const [betAmount, setBetAmount] = useState<number>(bigBlindSize);
  const [stackSize, setStackSize] = useState<number>(1000);

  const handleAmountChange = (increment: boolean) => {
    if (increment) {
      setBetAmount(prev => prev + bigBlindSize);
    } else {
      setBetAmount(prev => Math.max(bigBlindSize, prev - bigBlindSize));
    }
  };

  const handleStackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setStackSize(value);
    }
  };

  const isDisabled = (action: string): boolean => {
    return disabledActions.includes(action);
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
      <div className="mb-4">
        <h2 className="mb-2 text-xl font-semibold text-red-500">Setup</h2>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            className="border rounded px-3 py-2 w-32 bg-gray-800 text-white border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Stack"
            value={stackSize}
            onChange={handleStackChange}
            min={100}
          />
          <button
            onClick={onReset}
            className="px-4 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition duration-200"
          >
            {isFirstHand ? 'Start Game' : 'Reset Hand'}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 text-white">Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onAction('fold')}
            disabled={isDisabled('fold')}
            className={`px-4 py-2 font-semibold text-white rounded transition duration-200 ${isDisabled('fold') ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
          >
            Fold
          </button>
          <button
            onClick={() => onAction('check')}
            disabled={isDisabled('check')}
            className={`px-4 py-2 font-semibold text-white rounded transition duration-200 ${isDisabled('check') ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-500 hover:bg-gray-600'}`}
          >
            Check
          </button>
          <button
            onClick={() => onAction('call')}
            disabled={isDisabled('call')}
            className={`px-4 py-2 font-semibold text-white rounded transition duration-200 ${isDisabled('call') ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            Call
          </button>
          <button
            onClick={() => onAction('bet', betAmount)}
            disabled={isDisabled('bet')}
            className={`px-4 py-2 font-semibold text-white rounded transition duration-200 ${isDisabled('bet') ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            Bet
          </button>
          <button
            onClick={() => onAction('raise', betAmount)}
            disabled={isDisabled('raise')}
            className={`px-4 py-2 font-semibold text-white rounded transition duration-200 ${isDisabled('raise') ? 'bg-gray-600 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'}`}
          >
            Raise
          </button>
          <button
            onClick={() => onAction('allin')}
            disabled={isDisabled('allin')}
            className={`px-4 py-2 font-semibold text-white rounded transition duration-200 ${isDisabled('allin') ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            All-in
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 text-white">Bet Amount</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleAmountChange(false)}
            className="px-3 py-1 font-semibold text-white bg-gray-700 rounded hover:bg-gray-600 transition duration-200"
          >
            -
          </button>
          <div className="flex items-center justify-center w-16 h-10 bg-blue-600 text-white rounded-lg">
            {betAmount}
          </div>
          <button
            onClick={() => handleAmountChange(true)}
            className="px-3 py-1 font-semibold text-white bg-gray-700 rounded hover:bg-gray-600 transition duration-200"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default PokerForm;