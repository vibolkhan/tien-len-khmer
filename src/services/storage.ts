import type {
  Difficulty,
  GameState,
  OnlineLobbyPlayer,
  OnlineRoomRanking,
  OnlineSession,
  Ranking,
} from '../types/game';

const GAME_KEY = 'tlmb_saved_game';
const RANKING_KEY = 'tlmb_ranking';
const DIFFICULTY_KEY = 'tlmb_difficulty';
const ONLINE_SESSION_KEY = 'tlmb_online_session';
const ONLINE_GAME_KEY = 'tlmb_online_game';
const ONLINE_RANKING_KEY = 'tlmb_online_ranking';
const PLACEMENT_POINTS = [10, 5, -5, -10];

function normalizeGame(game: GameState): GameState {
  const cardsInHands = game.players.reduce(
    (total, player) => total + player.hand.length,
    0,
  );
  const openingPlayPending =
    game.openingPlayPending ??
    (!game.lastMove && cardsInHands === 52 && game.tableCards.length === 0);

  if (openingPlayPending) {
    const setupThrees = [
      ...game.tableCards,
      ...game.players.flatMap((player) =>
        player.hand.filter((card) => card.rank === 3),
      ),
    ].filter((card) => card.rank === 3);
    const uniqueSetupThrees = [
      ...new Map(setupThrees.map((card) => [card.id, card])).values(),
    ];

    game = {
      ...game,
      players: game.players.map((player) => ({
        ...player,
        hand: player.hand.filter((card) => card.rank !== 3),
      })),
      tableCards: uniqueSetupThrees,
      openingPlayPending: true,
    };
  }

  return {
    ...game,
    finishedPlayerIds: game.finishedPlayerIds ?? [],
    pointCuts: game.pointCuts ?? {},
    activeSingleTwoCut: game.activeSingleTwoCut ?? null,
  };
}

export function saveGame(game: GameState) {
  localStorage.setItem(GAME_KEY, JSON.stringify(game));
}

export function loadGame(): GameState | null {
  const raw = localStorage.getItem(GAME_KEY);
  return raw ? normalizeGame(JSON.parse(raw)) : null;
}

export function clearGame() {
  localStorage.removeItem(GAME_KEY);
}

export function getDifficulty(): Difficulty {
  return (localStorage.getItem(DIFFICULTY_KEY) as Difficulty) || 'easy';
}

export function setDifficulty(value: Difficulty) {
  localStorage.setItem(DIFFICULTY_KEY, value);
}

export function getRanking(): Ranking {
  const raw = localStorage.getItem(RANKING_KEY);
  const ranking = raw ? JSON.parse(raw) : {};

  return {
    totalGames: ranking.totalGames ?? 0,
    totalWins: ranking.totalWins ?? 0,
    totalLosses: ranking.totalLosses ?? 0,
    totalPoints: ranking.totalPoints ?? 0,
    playerScores: ranking.playerScores ?? {},
  };
}

export function saveRanking(ranking: Ranking) {
  localStorage.setItem(RANKING_KEY, JSON.stringify(ranking));
}

export function saveOnlineSession(session: OnlineSession) {
  localStorage.setItem(ONLINE_SESSION_KEY, JSON.stringify(session));
}

export function loadOnlineSession(): OnlineSession | null {
  const raw = localStorage.getItem(ONLINE_SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearOnlineSession() {
  localStorage.removeItem(ONLINE_SESSION_KEY);
  localStorage.removeItem(ONLINE_GAME_KEY);
  localStorage.removeItem(ONLINE_RANKING_KEY);
}

export function saveOnlineGame(game: GameState) {
  localStorage.setItem(ONLINE_GAME_KEY, JSON.stringify(game));
}

export function loadOnlineGame(): GameState | null {
  const raw = localStorage.getItem(ONLINE_GAME_KEY);
  return raw ? normalizeGame(JSON.parse(raw)) : null;
}

export function clearOnlineGame() {
  localStorage.removeItem(ONLINE_GAME_KEY);
}

export function createOnlineRoomRanking(
  roomCode: string,
  players: OnlineLobbyPlayer[],
): OnlineRoomRanking {
  return {
    roomCode,
    players,
    gamesPlayed: 0,
    playerScores: Object.fromEntries(players.map((player) => [player.id, 0])),
    recordedGameIds: [],
    updatedAt: new Date().toISOString(),
  };
}

export function saveOnlineRoomRanking(ranking: OnlineRoomRanking) {
  localStorage.setItem(ONLINE_RANKING_KEY, JSON.stringify(ranking));
}

export function loadOnlineRoomRanking(): OnlineRoomRanking | null {
  const raw = localStorage.getItem(ONLINE_RANKING_KEY);
  if (!raw) return null;

  const ranking = JSON.parse(raw) as Partial<OnlineRoomRanking>;
  if (!ranking.roomCode) return null;

  return {
    roomCode: ranking.roomCode,
    players: ranking.players ?? [],
    gamesPlayed: ranking.gamesPlayed ?? 0,
    playerScores: ranking.playerScores ?? {},
    recordedGameIds: ranking.recordedGameIds ?? [],
    updatedAt: ranking.updatedAt ?? new Date().toISOString(),
  };
}

export function recordOnlineGameResult(game: GameState): OnlineRoomRanking {
  const roomCode = game.roomCode ?? '';
  const savedRanking = loadOnlineRoomRanking();
  const ranking =
    savedRanking?.roomCode === roomCode
      ? savedRanking
      : createOnlineRoomRanking(
          roomCode,
          game.players.map((player) => ({
            id: player.id,
            name: player.name,
            joinedAt: game.startedAt,
          })),
        );
  const gameId = `${roomCode}:${game.startedAt}`;

  if (ranking.recordedGameIds.includes(gameId)) {
    return ranking;
  }

  ranking.players = game.players.map((player) => ({
    id: player.id,
    name: player.name,
    joinedAt:
      ranking.players.find((item) => item.id === player.id)?.joinedAt ??
      game.startedAt,
  }));

  game.finishedPlayerIds.forEach((playerId, index) => {
    ranking.playerScores[playerId] =
      (ranking.playerScores[playerId] ?? 0) +
      (PLACEMENT_POINTS[index] ?? 0);
  });

  Object.entries(game.pointCuts).forEach(([playerId, points]) => {
    ranking.playerScores[playerId] =
      (ranking.playerScores[playerId] ?? 0) + points;
  });

  ranking.gamesPlayed += 1;
  ranking.recordedGameIds.push(gameId);
  ranking.updatedAt = new Date().toISOString();
  saveOnlineRoomRanking(ranking);
  return ranking;
}

export function resetAllData() {
  localStorage.removeItem(GAME_KEY);
  localStorage.removeItem(RANKING_KEY);
  localStorage.removeItem(ONLINE_SESSION_KEY);
  localStorage.removeItem(ONLINE_GAME_KEY);
  localStorage.removeItem(ONLINE_RANKING_KEY);
}
