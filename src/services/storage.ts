import type { Difficulty, GameState, Ranking } from '../types/game';

const GAME_KEY = 'tlmb_saved_game';
const RANKING_KEY = 'tlmb_ranking';
const DIFFICULTY_KEY = 'tlmb_difficulty';

export function saveGame(game: GameState) {
  localStorage.setItem(GAME_KEY, JSON.stringify(game));
}

export function loadGame(): GameState | null {
  const raw = localStorage.getItem(GAME_KEY);
  if (!raw) return null;

  const game = JSON.parse(raw);
  return {
    ...game,
    finishedPlayerIds: game.finishedPlayerIds ?? [],
    pointCuts: game.pointCuts ?? {},
    activeSingleTwoCut: game.activeSingleTwoCut ?? null,
  };
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

export function resetAllData() {
  localStorage.removeItem(GAME_KEY);
  localStorage.removeItem(RANKING_KEY);
}
