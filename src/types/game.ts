export type Suit = "spades" | "clubs" | "diamonds" | "hearts";
export type Rank = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
export type Difficulty = "easy" | "medium" | "hard";

export interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
}

export interface Player {
  id: string;
  name: string;
  isHuman: boolean;
  hand: Card[];
  passed: boolean;
}

export interface PlayedMove {
  playerId: string;
  cards: Card[];
  type: MoveType;
}

export type MoveType =
  | "single"
  | "pair"
  | "doublePairs"
  | "triple"
  | "straight"
  | "threePairs"
  | "fourPairs"
  | "fourKind"
  | "pairTriple"
  | "invalid";

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  lastMove: PlayedMove | null;
  tableCards: Card[];
  winnerId: string | null;
  finishedPlayerIds: string[];
  difficulty: Difficulty;
  startedAt: string;
}

export interface Ranking {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalPoints: number;
  playerScores: Record<string, number>;
}
