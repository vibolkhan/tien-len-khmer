import type {
  Card,
  Difficulty,
  GameState,
  MoveType,
  PlayedMove,
  Player,
  Rank,
  Suit,
} from "../types/game";

const suits: Suit[] = ["spades", "clubs", "diamonds", "hearts"];
const ranks: Rank[] = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

const suitPower: Record<Suit, number> = {
  spades: 1,
  clubs: 2,
  diamonds: 3,
  hearts: 4,
};

function cardPower(card: Card) {
  return card.rank * 10 + suitPower[card.suit];
}

export function createDeck(): Card[] {
  return ranks.flatMap((rank) =>
    suits.map((suit) => ({
      id: `${rank}-${suit}`,
      rank,
      suit,
    })),
  );
}

export function sortCards(cards: Card[]) {
  return [...cards].sort((a, b) => cardPower(a) - cardPower(b));
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function groupByRank(cards: Card[]) {
  const map = new Map<Rank, Card[]>();

  cards.forEach((card) => {
    const group = map.get(card.rank) || [];
    group.push(card);
    map.set(card.rank, group);
  });

  return map;
}

function isStraight(cards: Card[]) {
  const sorted = sortCards(cards);

  if (sorted.length < 3) return false;
  if (sorted.some((card) => card.rank === 15)) return false; // 2 cannot be in straight

  const ranks = sorted.map((card) => card.rank);
  const uniqueRanks = new Set(ranks);

  // Cannot have duplicate rank in straight
  if (uniqueRanks.size !== ranks.length) return false;

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].rank !== sorted[i - 1].rank + 1) {
      return false;
    }
  }

  return true;
}

function isConsecutivePairs(cards: Card[], pairCount: number) {
  if (cards.length !== pairCount * 2) return false;

  const groups = [...groupByRank(cards).entries()].sort((a, b) => a[0] - b[0]);

  if (groups.length !== pairCount) return false;

  if (groups.some(([rank, group]) => rank === 15 || group.length !== 2)) {
    return false;
  }

  for (let i = 1; i < groups.length; i++) {
    if (groups[i][0] !== groups[i - 1][0] + 1) return false;
  }

  return true;
}

function isDoublePairs(cards: Card[]) {
  return isConsecutivePairs(cards, 2);
}

function isPairTriple(cards: Card[]) {
  if (cards.length !== 5) return false;

  const groupSizes = [...groupByRank(cards).values()]
    .map((group) => group.length)
    .sort((a, b) => a - b);

  return groupSizes.length === 2 && groupSizes[0] === 2 && groupSizes[1] === 3;
}

function getPairTripleValue(cards: Card[]) {
  const groups = [...groupByRank(cards).entries()];

  const triple = groups.find(([, group]) => group.length === 3);
  const pair = groups.find(([, group]) => group.length === 2);

  return {
    tripleRank: triple?.[0] ?? 0,
    pairRank: pair?.[0] ?? 0,
  };
}

export function detectMoveType(cards: Card[]): MoveType {
  const groups = [...groupByRank(cards).values()];

  if (cards.length === 1) return "single";

  if (cards.length === 2 && groups.length === 1) {
    return "pair";
  }

  if (cards.length === 3 && groups.length === 1) {
    return "triple";
  }

  if (cards.length === 4 && groups.length === 1) {
    return "fourKind";
  }

  if (isDoublePairs(cards)) {
    return "doublePairs";
  }

  if (isPairTriple(cards)) {
    return "pairTriple";
  }

  if (isStraight(cards)) {
    return "straight";
  }

  if (isConsecutivePairs(cards, 3)) {
    return "threePairs";
  }

  if (isConsecutivePairs(cards, 4)) {
    return "fourPairs";
  }

  return "invalid";
}

function moveValue(cards: Card[]) {
  return cardPower(sortCards(cards).at(-1)!);
}

function isBomb(type: MoveType) {
  return type === "fourKind" || type === "threePairs" || type === "fourPairs";
}

function canPairTripleBeat(selected: Card[], lastCards: Card[]) {
  const selectedValue = getPairTripleValue(selected);
  const lastValue = getPairTripleValue(lastCards);

  if (selectedValue.tripleRank !== lastValue.tripleRank) {
    return selectedValue.tripleRank > lastValue.tripleRank;
  }

  return selectedValue.pairRank > lastValue.pairRank;
}

export function canBeat(
  selected: Card[],
  lastMove: PlayedMove | null,
): boolean {
  const selectedType = detectMoveType(selected);
  if (selectedType === "invalid") return false;

  if (!lastMove) return true;

  const lastType = lastMove.type;

  if (selectedType === "pairTriple" && lastType === "pairTriple") {
    return canPairTripleBeat(selected, lastMove.cards);
  }

  if (selectedType === lastType && selected.length === lastMove.cards.length) {
    return moveValue(selected) > moveValue(lastMove.cards);
  }

  const lastHasSingleTwo =
    lastType === "single" && lastMove.cards[0].rank === 15;
  const lastHasPairTwo =
    lastType === "pair" && lastMove.cards.every((card) => card.rank === 15);

  if (
    lastHasSingleTwo &&
    ["threePairs", "fourKind", "fourPairs"].includes(selectedType)
  ) {
    return true;
  }

  if (lastHasPairTwo && selectedType === "fourPairs") {
    return true;
  }

  if (isBomb(selectedType) && isBomb(lastType)) {
    const bombPower: Partial<Record<MoveType, number>> = {
      threePairs: 1,
      fourKind: 2,
      fourPairs: 3,
    };

    const selectedBombPower = bombPower[selectedType] ?? 0;
    const lastBombPower = bombPower[lastType] ?? 0;

    if (selectedBombPower > lastBombPower) {
      return true;
    }

    if (selectedBombPower === lastBombPower) {
      return moveValue(selected) > moveValue(lastMove.cards);
    }
  }

  return false;
}

export function createNewGame(difficulty: Difficulty): GameState {
  const deck = shuffle(createDeck());

  const players: Player[] = [
    { id: "human", name: "You", isHuman: true, hand: [], passed: false },
    { id: "bot1", name: "Bot 1", isHuman: false, hand: [], passed: false },
    { id: "bot2", name: "Bot 2", isHuman: false, hand: [], passed: false },
    { id: "bot3", name: "Bot 3", isHuman: false, hand: [], passed: false },
  ];

  players.forEach((player, index) => {
    player.hand = sortCards(deck.slice(index * 13, index * 13 + 13));
  });

  const firstPlayerIndex = players.findIndex((player) =>
    player.hand.some((card) => card.rank === 3 && card.suit === "spades"),
  );

  return {
    players,
    currentPlayerIndex: firstPlayerIndex >= 0 ? firstPlayerIndex : 0,
    lastMove: null,
    tableCards: [],
    winnerId: null,
    finishedPlayerIds: [],
    difficulty,
    startedAt: new Date().toISOString(),
  };
}

export function playCards(
  game: GameState,
  playerId: string,
  cards: Card[],
): GameState {
  const player = game.players.find((p) => p.id === playerId);
  if (!player) return game;

  if (!canBeat(cards, game.lastMove)) return game;

  player.hand = player.hand.filter(
    (card) => !cards.some((selected) => selected.id === card.id),
  );
  player.passed = false;

  game.lastMove = {
    playerId,
    cards,
    type: detectMoveType(cards),
  };

  game.tableCards = cards;

  if (player.hand.length === 0) {
    finishPlayer(game, playerId);
  }

  if (game.finishedPlayerIds.length >= game.players.length) {
    return game;
  }

  return nextTurn(game);
}

export function passTurn(game: GameState): GameState {
  if (!game.lastMove || game.finishedPlayerIds.length >= game.players.length) return game;

  const player = game.players[game.currentPlayerIndex];
  player.passed = true;

  const availablePlayers = game.players.filter(
    (player) => !player.passed && player.hand.length > 0,
  );

  if (availablePlayers.length <= 1) {
    game.players.forEach((player) => {
      player.passed = false;
    });

    game.lastMove = null;
    game.tableCards = [];
  }

  return nextTurn(game);
}

function finishPlayer(game: GameState, playerId: string) {
  if (!game.finishedPlayerIds.includes(playerId)) {
    game.finishedPlayerIds.push(playerId);
  }

  if (!game.winnerId) {
    game.winnerId = playerId;
  }

  const unfinishedPlayers = game.players.filter(
    (player) => !game.finishedPlayerIds.includes(player.id),
  );

  if (unfinishedPlayers.length === 1) {
    game.finishedPlayerIds.push(unfinishedPlayers[0].id);
  }
}

export function nextTurn(game: GameState): GameState {
  let nextIndex = game.currentPlayerIndex;

  for (let i = 0; i < game.players.length; i++) {
    nextIndex = (nextIndex + 1) % game.players.length;
    const nextPlayer = game.players[nextIndex];

    if (
      !nextPlayer.passed &&
      nextPlayer.hand.length > 0 &&
      !game.finishedPlayerIds.includes(nextPlayer.id)
    ) {
      game.currentPlayerIndex = nextIndex;
      return game;
    }
  }

  return game;
}

function pushUniqueMove(moves: Card[][], move: Card[]) {
  const ids = sortCards(move)
    .map((card) => card.id)
    .join("|");

  const alreadyExists = moves.some((existingMove) => {
    const existingIds = sortCards(existingMove)
      .map((card) => card.id)
      .join("|");
    return existingIds === ids;
  });

  if (!alreadyExists) {
    moves.push(move);
  }
}

function getPossibleMoves(hand: Card[], game: GameState): Card[][] {
  const moves: Card[][] = [];
  const groupedByRank = [...groupByRank(hand).entries()].sort(
    (a, b) => a[0] - b[0],
  );

  // Singles
  hand.forEach((card) => pushUniqueMove(moves, [card]));

  // Pairs, triples, four of a kind
  groupedByRank.forEach(([, group]) => {
    const sortedGroup = sortCards(group);

    if (sortedGroup.length >= 2) pushUniqueMove(moves, sortedGroup.slice(0, 2));
    if (sortedGroup.length >= 3) pushUniqueMove(moves, sortedGroup.slice(0, 3));
    if (sortedGroup.length === 4)
      pushUniqueMove(moves, sortedGroup.slice(0, 4));
  });

  // Straights: same suit only, no 2
  suits.forEach((suit) => {
    const suitedCards = sortCards(
      hand.filter((card) => card.suit === suit && card.rank !== 15),
    );

    for (let start = 0; start < suitedCards.length; start++) {
      const run = [suitedCards[start]];

      for (let i = start + 1; i < suitedCards.length; i++) {
        const last = run.at(-1)!;

        if (suitedCards[i].rank === last.rank + 1) {
          run.push(suitedCards[i]);

          if (run.length >= 3) {
            pushUniqueMove(moves, [...run]);
          }
        } else if (suitedCards[i].rank > last.rank + 1) {
          break;
        }
      }
    }
  });

  // Consecutive pairs: doublePairs, threePairs, fourPairs
  const pairGroups = groupedByRank
    .filter(([rank, cards]) => rank !== 15 && cards.length >= 2)
    .map(([rank, cards]) => ({
      rank,
      cards: sortCards(cards).slice(0, 2),
    }));

  for (let start = 0; start < pairGroups.length; start++) {
    const run = [pairGroups[start]];

    for (let i = start + 1; i < pairGroups.length; i++) {
      const previousRank = run.at(-1)!.rank;
      const current = pairGroups[i];

      if (current.rank === previousRank + 1) {
        run.push(current);

        if (run.length === 2)
          pushUniqueMove(
            moves,
            run.flatMap((item) => item.cards),
          );
        if (run.length === 3)
          pushUniqueMove(
            moves,
            run.flatMap((item) => item.cards),
          );
        if (run.length === 4)
          pushUniqueMove(
            moves,
            run.flatMap((item) => item.cards),
          );
      } else {
        break;
      }
    }
  }

  // Pair + Triple
  const pairs = groupedByRank
    .filter(([, cards]) => cards.length >= 2)
    .map(([rank, cards]) => ({
      rank,
      cards: sortCards(cards).slice(0, 2),
    }));

  const triples = groupedByRank
    .filter(([, cards]) => cards.length >= 3)
    .map(([rank, cards]) => ({
      rank,
      cards: sortCards(cards).slice(0, 3),
    }));

  triples.forEach((triple) => {
    pairs.forEach((pair) => {
      if (triple.rank !== pair.rank) {
        pushUniqueMove(moves, [...pair.cards, ...triple.cards]);
      }
    });
  });

  return moves.filter((move) => canBeat(move, game.lastMove));
}

export function chooseBotMove(game: GameState, bot: Player): Card[] | null {
  const possibleMoves = getPossibleMoves(bot.hand, game);
  if (possibleMoves.length === 0) return null;

  const sortedMoves = possibleMoves.sort((a, b) => {
    const typeA = detectMoveType(a);
    const typeB = detectMoveType(b);

    const bombA = isBomb(typeA) ? 1 : 0;
    const bombB = isBomb(typeB) ? 1 : 0;

    return bombA - bombB || a.length - b.length || moveValue(a) - moveValue(b);
  });

  if (game.difficulty === "easy") {
    return sortedMoves[0];
  }

  if (game.difficulty === "medium") {
    const nonBombMoves = sortedMoves.filter(
      (move) => !isBomb(detectMoveType(move)),
    );
    return nonBombMoves[0] || sortedMoves[0];
  }

  const lastMoveHasTwo =
    game.lastMove?.cards.some((card) => card.rank === 15) ?? false;

  if (!lastMoveHasTwo) {
    const nonBombMoves = sortedMoves.filter(
      (move) => !isBomb(detectMoveType(move)),
    );
    if (nonBombMoves.length > 0) return nonBombMoves[0];
  }

  return sortedMoves[0];
}
