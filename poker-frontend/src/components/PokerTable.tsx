"use client";

import React from "react";

interface Player {
  name: string;
  stack: number;
  cards: string[];
  isActive: boolean;
  isDealer: boolean;
  isSB: boolean;
  isBB: boolean;
  bet: number;
  lastAction?: string;
}

interface PokerTableProps {
  players: Player[];
  communityCards: string[];
  pot: number;
  currentPlayer: number;
}

const PokerTable: React.FC<PokerTableProps> = ({
  players,
  communityCards,
  pot,
  currentPlayer,
}) => {
  const getCardDetails = (card: string) => {
    if (!card) return { suit: "", color: "" };
    const suit = card.at(-1);
    let suitClass = "";
    let colorClass = "";

    switch (suit) {
      case "h":
        suitClass = "hearts";
        colorClass = "text-red-500";
        break;
      case "d":
        suitClass = "diamonds";
        colorClass = "text-red-500";
        break;
      case "c":
        suitClass = "clubs";
        colorClass = "text-gray-900";
        break;
      case "s":
        suitClass = "spades";
        colorClass = "text-gray-900";
        break;
    }

    return { suit: suitClass, color: colorClass };
  };

  const renderCard = (card: string, index: number) => {
    if (!card) {
      return (
        <div
          key={index}
          className="w-12 h-16 bg-gray-700 rounded-md flex items-center justify-center text-gray-500 text-sm border border-gray-600"
        />
      );
    }

    const rank = card.slice(0, -1);
    const { suit, color } = getCardDetails(card);

    return (
      <div
        key={index}
        className={`w-12 h-16 bg-white rounded-md flex flex-col items-center justify-center text-xl font-bold border border-gray-300 ${color}`}
      >
        <span>{rank}</span>
        <span>
          {suit === "hearts"
            ? "♥"
            : suit === "diamonds"
            ? "♦"
            : suit === "clubs"
            ? "♣"
            : "♠"}
        </span>
      </div>
    );
  };

  // Use inline styles because Tailwind does not support arbitrary percentages
  const playerPositions = [
    { top: "80%", left: "50%" },
    { top: "60%", left: "85%" },
    { top: "20%", left: "85%" },
    { top: "0%", left: "50%" },
    { top: "20%", left: "15%" },
    { top: "60%", left: "15%" },
  ];

  return (
    <div className="relative w-full max-w-5xl h-[500px] bg-green-800 rounded-full mx-auto my-8 border-8 border-green-900">
      {/* Pot */}
      {pot > 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-700 text-white p-4 rounded-full font-bold text-xl">
          Pot: ${pot}
        </div>
      )}

      {/* Community Cards */}
      <div className="absolute top-[35%] left-1/2 -translate-x-1/2 flex gap-2">
        {communityCards.map((card, index) => renderCard(card, index))}
        {Array(5 - communityCards.length)
          .fill(null)
          .map((_, index) => (
            <div
              key={`empty-${index}`}
              className="w-12 h-16 bg-gray-700 rounded-md border border-dashed border-gray-500"
            />
          ))}
      </div>

      {/* Players */}
      {players.map((player, index) => {
        const pos = playerPositions[index % playerPositions.length];

        return (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center space-y-1"
            style={{ top: pos.top, left: pos.left }}
          >
            {/* Avatar */}
            <div className="w-12 h-12 bg-gray-700 rounded-full text-white flex items-center justify-center text-lg font-bold">
              {player.name[0]}
            </div>

            {/* Info */}
            <div className="bg-black bg-opacity-40 text-white px-2 py-1 text-sm rounded">
              {player.name}: ${player.stack}
            </div>

            {/* Tags */}
            <div className="flex space-x-1 text-xs">
              {player.isDealer && (
                <span className="bg-yellow-500 text-black px-1 rounded">D</span>
              )}
              {player.isSB && (
                <span className="bg-blue-500 text-white px-1 rounded">SB</span>
              )}
              {player.isBB && (
                <span className="bg-red-500 text-white px-1 rounded">BB</span>
              )}
            </div>

            {/* Cards */}
            <div className="flex gap-1 mt-1">{player.cards.map(renderCard)}</div>

            {/* Bet */}
            {player.bet > 0 && (
              <div className="text-white text-xs mt-1">${player.bet}</div>
            )}

            {/* Last Action */}
            {player.lastAction && (
              <div className="text-gray-200 text-xs italic">
                {player.lastAction}
              </div>
            )}

            {/* Current Player Indicator */}
            {index === currentPlayer && (
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping mt-1" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PokerTable;
