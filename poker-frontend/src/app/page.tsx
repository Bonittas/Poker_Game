"use client";

import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import PokerForm from "@/components/PokerForm";
import PokerLog from "@/components/PokerLog";
import PokerHistory from "@/components/PokerHistory";
import PokerTable from "@/components/PokerTable";
import { apiService, HandData, HandCreateRequest } from "@/lib/api";
import { Card } from "@/components/ui/card";
import './globals.css';
const PLAYERS = ["Player1", "Player2", "Player3", "Player4", "Player5", "Player6"];
const BIG_BLIND_SIZE = 40;
const SMALL_BLIND_SIZE = BIG_BLIND_SIZE / 2;

// Define card deck
const SUITS = ["h", "d", "c", "s"];
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];

// Define types for game state
interface GameState {
  isHandActive: boolean;
  currentPlayer: number;
  currentBet: number;
  currentStreet: "preflop" | "flop" | "turn" | "river";
  playerStacks: number[];
  playerCards: string[][];
  communityCards: string[];
  playerActions: string[][];
  disabledActions: string[];
  dealerPosition: number;
  actionSequence: string;
  pot: number;
  playerBets: number[];
  lastActions: string[];
}

// Define player type for PokerTable component
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

const Home: NextPage = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [handHistory, setHandHistory] = useState<HandData[]>([]);
  const [isFirstHand, setIsFirstHand] = useState(true);
  const [gameState, setGameState] = useState<GameState>({
    isHandActive: false,
    currentPlayer: 0,
    currentBet: 0,
    currentStreet: "preflop",
    playerStacks: PLAYERS.map(() => 1000),
    playerCards: PLAYERS.map(() => []),
    communityCards: [],
    playerActions: PLAYERS.map(() => []),
    disabledActions: ["check", "call", "bet", "raise", "allin"],
    dealerPosition: 0,
    actionSequence: "",
    pot: 0,
    playerBets: PLAYERS.map(() => 0),
    lastActions: PLAYERS.map(() => ""),
  });

  useEffect(() => {
    const fetchHandHistory = async () => {
      try {
        const hands = await apiService.getAllHands();
        setHandHistory(hands || []);
      } catch (error) {
        console.error("Failed to fetch hand history:", error);
      }
    };
    fetchHandHistory();
  }, []);

  const getRandomCard = (dealtCards: string[]): string => {
    let card: string;
    do {
      const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
      const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
      card = rank + suit;
    } while (dealtCards.includes(card));
    return card;
  };

  const handleReset = () => {
    const dealtCards: string[] = [];
    const playerCards: string[][] = PLAYERS.map(() => {
      const card1 = getRandomCard(dealtCards);
      dealtCards.push(card1);
      const card2 = getRandomCard(dealtCards);
      dealtCards.push(card2);
      return [card1, card2];
    });

    const dealerPos = isFirstHand
      ? 0
      : (gameState.dealerPosition + 1) % PLAYERS.length;
    const sbPos = (dealerPos + 1) % PLAYERS.length;
    const bbPos = (dealerPos + 2) % PLAYERS.length;
    const firstToActPos = (dealerPos + 3) % PLAYERS.length;

    const newPlayerStacks = [...gameState.playerStacks];
    newPlayerStacks[sbPos] -= SMALL_BLIND_SIZE;
    newPlayerStacks[bbPos] -= BIG_BLIND_SIZE;

    const newPlayerBets = PLAYERS.map(() => 0);
    newPlayerBets[sbPos] = SMALL_BLIND_SIZE;
    newPlayerBets[bbPos] = BIG_BLIND_SIZE;

    setGameState({
      isHandActive: true,
      currentPlayer: firstToActPos,
      currentBet: BIG_BLIND_SIZE,
      currentStreet: "preflop",
      playerStacks: newPlayerStacks,
      playerCards: playerCards,
      communityCards: [],
      playerActions: PLAYERS.map(() => []),
      disabledActions: ["check"],
      dealerPosition: dealerPos,
      actionSequence: "",
      pot: SMALL_BLIND_SIZE + BIG_BLIND_SIZE,
      playerBets: newPlayerBets,
      lastActions: PLAYERS.map((_, i): string => {
        if (i === sbPos) return "SB";
        if (i === bbPos) return "BB";
        return "";
      }),
    });

    const newLogs = [
      `New hand started. Dealer: ${PLAYERS[dealerPos]}`,
      `${PLAYERS[sbPos]} posts small blind: ${SMALL_BLIND_SIZE}`,
      `${PLAYERS[bbPos]} posts big blind: ${BIG_BLIND_SIZE}`,
      `${PLAYERS[firstToActPos]} to act`,
    ];
    setLogs(newLogs);

    if (isFirstHand) {
      setIsFirstHand(false);
    }
  };

  const handleAction = (action: string, amount?: number) => {
    if (!gameState.isHandActive) return;

    const {
      currentPlayer,
      currentBet,
      playerStacks,
      actionSequence,
      playerBets,
      pot,
    } = gameState;
    const playerName = PLAYERS[currentPlayer];
    let newLogs = [...logs];
    let newActionSequence = actionSequence;
    let newPlayerStacks = [...playerStacks];
    let newPlayerBets = [...playerBets];
    let newPot = pot;
    let newLastActions = [...gameState.lastActions];

    switch (action) {
      case "fold":
        newLogs.push(`${playerName} folds`);
        newActionSequence += newActionSequence ? " f" : "f";
        newLastActions[currentPlayer] = "Fold";
        break;
      case "check":
        newLogs.push(`${playerName} checks`);
        newActionSequence += newActionSequence ? " x" : "x";
        newLastActions[currentPlayer] = "Check";
        break;
      case "call":
        const callAmount = currentBet - playerBets[currentPlayer];
        newLogs.push(`${playerName} calls ${callAmount}`);
        newPlayerStacks[currentPlayer] -= callAmount;
        newPlayerBets[currentPlayer] += callAmount;
        newPot += callAmount;
        newActionSequence += newActionSequence ? " c" : "c";
        newLastActions[currentPlayer] = "Call";
        break;
      case "bet":
        if (amount !== undefined) {
          newLogs.push(`${playerName} bets ${amount}`);
          newPlayerStacks[currentPlayer] -= amount;
          newPlayerBets[currentPlayer] += amount;
          newPot += amount;
          newActionSequence += newActionSequence
            ? ` b${amount}`
            : `b${amount}`;
          newLastActions[currentPlayer] = `Bet ${amount}`;
        }
        break;
      case "raise":
        if (amount !== undefined) {
          const raiseAmount = amount - playerBets[currentPlayer];
          newLogs.push(`${playerName} raises to ${amount}`);
          newPlayerStacks[currentPlayer] -= raiseAmount;
          newPlayerBets[currentPlayer] += raiseAmount;
          newPot += raiseAmount;
          newActionSequence += newActionSequence
            ? ` r${amount}`
            : `r${amount}`;
          newLastActions[currentPlayer] = `Raise ${amount}`;
        }
        break;
      case "allin":
        const allInAmount = playerStacks[currentPlayer];
        newLogs.push(`${playerName} goes all-in for ${allInAmount}`);
        newPlayerBets[currentPlayer] += allInAmount;
        newPlayerStacks[currentPlayer] = 0;
        newPot += allInAmount;
        newActionSequence += newActionSequence ? " allin" : "allin";
        newLastActions[currentPlayer] = "All-In";
        break;
    }

    const nextPlayer = (currentPlayer + 1) % PLAYERS.length;
    let newStreet = gameState.currentStreet;
    let newCommunityCards = [...gameState.communityCards];

    if (nextPlayer === gameState.dealerPosition) {
      const dealtCards = [...gameState.playerCards.flat(), ...gameState.communityCards];
      switch (newStreet) {
        case "preflop":
          newStreet = "flop";
          const flop1 = getRandomCard(dealtCards);
          const updatedDealtCards1 = [...dealtCards, flop1];
          const flop2 = getRandomCard(updatedDealtCards1);
          const updatedDealtCards2 = [...updatedDealtCards1, flop2];
          const flop3 = getRandomCard(updatedDealtCards2);
          newCommunityCards = [flop1, flop2, flop3];
          newLogs.push(`Flop: ${flop1} ${flop2} ${flop3}`);
          newActionSequence += ` / Flop: [${flop1},${flop2},${flop3}]`;
          newPlayerBets = PLAYERS.map(() => 0);
          break;
        case "flop":
          newStreet = "turn";
          const allDealtCards = [...dealtCards, ...newCommunityCards];
          const turn = getRandomCard(allDealtCards);
          newCommunityCards = [...newCommunityCards, turn];
          newLogs.push(`Turn: ${turn}`);
          newActionSequence += ` / Turn: [${turn}]`;
          newPlayerBets = PLAYERS.map(() => 0);
          break;
        case "turn":
          newStreet = "river";
          const allDealtCardsWithTurn = [...dealtCards, ...newCommunityCards];
          const river = getRandomCard(allDealtCardsWithTurn);
          newCommunityCards = [...newCommunityCards, river];
          newLogs.push(`River: ${river}`);
          newActionSequence += ` / River: [${river}]`;
          newPlayerBets = PLAYERS.map(() => 0);
          break;
        case "river":
          newLogs.push("Hand complete - saving to history");
          saveCompletedHand(newActionSequence, newPlayerStacks);
          setGameState({
            ...gameState,
            isHandActive: false,
            communityCards: newCommunityCards,
            currentStreet: newStreet,
            playerStacks: newPlayerStacks,
            actionSequence: newActionSequence,
            pot: newPot,
            playerBets: newPlayerBets,
            lastActions: newLastActions,
          });
          setLogs(newLogs);
          return;
      }
    }

    setGameState({
      ...gameState,
      currentPlayer: nextPlayer,
      communityCards: newCommunityCards,
      currentStreet: newStreet,
      playerStacks: newPlayerStacks,
      actionSequence: newActionSequence,
      pot: newPot,
      playerBets: newPlayerBets,
      lastActions: newLastActions,
    });

    setLogs(newLogs);
  };

  const saveCompletedHand = async (
    actionSequence: string,
    finalStacks: number[]
  ) => {
    try {
      const handData: HandCreateRequest = {
        stack_settings: PLAYERS.reduce((acc, player, index) => {
          acc[player] = finalStacks[index];
          return acc;
        }, {} as Record<string, number>),
        player_roles: {
          dealer: PLAYERS[gameState.dealerPosition],
          sb: PLAYERS[(gameState.dealerPosition + 1) % PLAYERS.length],
          bb: PLAYERS[(gameState.dealerPosition + 2) % PLAYERS.length],
        },
        hole_cards: PLAYERS.reduce((acc, player, index) => {
          acc[player] = gameState.playerCards[index].map((card) => {
            const rank = card[0].toUpperCase();
            const suit = card[1].toLowerCase();
            if (!"23456789TJQKA".includes(rank) || !"hdcs".includes(suit)) {
              throw new Error(`Invalid card: ${card}`);
            }
            return `${rank}${suit}`;
          });
          return acc;
        }, {} as Record<string, string[]>),
        action_sequence: actionSequence,
      };

      console.log("Sending handData:", JSON.stringify(handData, null, 2));

      const savedHand = await apiService.createHand(handData);
      if (savedHand) {
        setHandHistory((prev) => [savedHand, ...prev]);
      } else {
        console.warn("No hand returned from API");
      }
    } catch (error) {
      console.error("Failed to save hand:", error);
    }
  };

  const tablePlayers: Player[] = PLAYERS.map((name, index) => ({
    name,
    stack: gameState.playerStacks[index],
    cards: gameState.isHandActive ? gameState.playerCards[index] : [],
    isActive: index === gameState.currentPlayer,
    isDealer: index === gameState.dealerPosition,
    isSB: index === (gameState.dealerPosition + 1) % PLAYERS.length,
    isBB: index === (gameState.dealerPosition + 2) % PLAYERS.length,
    bet: gameState.playerBets[index],
    lastAction: gameState.lastActions[index],
  }));

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center my-8 text-foreground">
        Poker Game Simulator
      </h1>

      <Card className="mb-6 bg-card border-border shadow-sm">
        <div className="p-6">
          <PokerTable
            players={tablePlayers}
            communityCards={gameState.communityCards}
            pot={gameState.pot}
            currentPlayer={gameState.currentPlayer}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="bg-card border-border shadow-sm">
            <div className="p-6">
              <PokerForm
                onAction={handleAction}
                onReset={handleReset}
                isFirstHand={isFirstHand}
                disabledActions={gameState.disabledActions}
                currentBet={gameState.currentBet}
                bigBlindSize={BIG_BLIND_SIZE}
              />
            </div>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <div className="p-6">
              <PokerLog logs={logs} />
            </div>
          </Card>
        </div>

        <PokerHistory hands={handHistory} />
      </div>
    </main>
  );
};

export default Home;