import type { Card } from '../types/game';

export function getCardImage(card: Card) {
  const rankMap: Record<number, string> = {
    11: 'jack',
    12: 'queen',
    13: 'king',
    14: 'ace',
    15: '2',
  };

  const rankName = rankMap[card.rank] || card.rank;

  return new URL(`../assets/cards/${rankName}_of_${card.suit}.png`, import.meta.url).href;
}
