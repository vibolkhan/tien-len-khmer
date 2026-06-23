import type { Difficulty, GameState, OnlineSession, Ranking } from '../types/game';

const GAME_KEY = 'tlmb_saved_game';
const RANKING_KEY = 'tlmb_ranking';
const DIFFICULTY_KEY = 'tlmb_difficulty';
const ONLINE_SESSION_KEY = 'tlmb_online_session';
const ONLINE_GAME_KEY = 'tlmb_online_game';

function normalizeGame(game: GameState): GameState {
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
}

export function saveOnlineGame(game: GameState) {
  localStorage.setItem(ONLINE_GAME_KEY, JSON.stringify(game));
}

export function loadOnlineGame(): GameState | null {
  const raw = localStorage.getItem(ONLINE_GAME_KEY);
  return raw ? normalizeGame(JSON.parse(raw)) : null;
}

export function resetAllData() {
  localStorage.removeItem(GAME_KEY);
  localStorage.removeItem(RANKING_KEY);
  localStorage.removeItem(ONLINE_SESSION_KEY);
  localStorage.removeItem(ONLINE_GAME_KEY);
}
