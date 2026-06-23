# Tien Len Mien Bac - Ionic Vue

Offline Tien Len Mien Bac card game built with Vue + Ionic.

This game uses a custom Khmer-style Tien Len rule set.

## Features

* Landscape layout
* New Game / Continue Game
* 4 players: 1 human + 3 bots
* Easy / Medium / Hard bot setting
* Local saved game using localStorage
* Local ranking with placement-based points
* Basic Tien Len rule engine

## Rules

* The game uses a 52-card deck with ranks from `3` up to `2`.
* Card rank order is: `3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A, 2`.
* Suit strength order is: spades, clubs, diamonds, hearts.
* Each player receives 13 cards.
* The player holding the `3 of spades` starts the game.
* A player may play any valid move when the table is empty.
* A player must beat the previous move or pass.
* Passing is only allowed after at least one move has been played.
* When all other active players pass, the table is cleared and a new round starts.
* Finished players are skipped.
* The game continues until all player placements are decided.

## Valid Moves

* Single: 1 card.
* Pair: 2 cards with the same rank.
* Triple: 3 cards with the same rank.
* Four of a kind: 4 cards with the same rank.
* Straight / Sequence: 3 or more cards in consecutive rank order.
* Double pairs: 2 consecutive pairs.
* Three consecutive pairs: 3 consecutive pairs.
* Four consecutive pairs: 4 consecutive pairs.
* Pair plus triple: 1 pair and 1 triple.
* Five-card same-suit sequence bomb: 5 consecutive cards with the same suit.

## Triple Rules

A triple beats another triple if it has a higher rank.

Examples:

```text
J J J beats 10 10 10
A A A beats K K K
```

## Straight / Sequence Rules

A straight is 3 or more cards in consecutive rank order.

Examples:

```text
3 4 5
6 7 8 9
10 J Q K A
```

Suit does not need to match.

Example valid straight:

```text
4♠ 5♦ 6♣
```

Important straight rules:

* `2` cannot be used in a straight.
* A straight can only go from `3` up to `A`.
* A straight cannot wrap around from `A` back to `3`.

Valid:

```text
Q K A
```

Invalid:

```text
K A 2
A 2 3
2 3 4
```

## Consecutive Pair Rules

### Double Pairs

Double pairs means 2 pairs in rank order.

Example:

```text
5♠ 5♣ 6♠ 6♣
```

Rules:

* Double pairs are a normal valid move.
* Double pairs can beat another double pairs only if the highest pair is stronger.
* Double pairs cannot beat a single `2`.
* Double pairs cannot beat a pair of `2`s.
* Double pairs do not give point cutting.

### Three Consecutive Pairs

Three consecutive pairs means 3 pairs in rank order.

Example:

```text
5♠ 5♣ 6♠ 6♣ 7♠ 7♣
```

Rules:

* Three consecutive pairs are a normal valid move.
* Three consecutive pairs can beat another three consecutive pairs only if the highest pair is stronger.
* Three consecutive pairs cannot beat a single `2`.
* Three consecutive pairs cannot beat a pair of `2`s.
* Three consecutive pairs are not a bomb.
* Three consecutive pairs do not give point cutting.
* `2` cannot be used in consecutive pairs.

### Four Consecutive Pairs

Four consecutive pairs means 4 pairs in rank order.

Example:

```text
6♠ 6♣ 7♠ 7♣ 8♠ 8♣ 9♠ 9♣
```

Rules:

* Four consecutive pairs are a normal valid move when the table is empty or when beating another four consecutive pairs.
* Four consecutive pairs can beat a pair of `2`s.
* Four consecutive pairs cannot beat a single `2`.
* Four consecutive pairs are the only move that can beat a pair of `2`s.
* Four consecutive pairs get point cutting only when they beat a pair of `2`s.
* `2` cannot be used in consecutive pairs.

## Bomb Rules

A bomb is a special powerful move that can beat a single `2` or another weaker bomb.

Supported bombs for beating a single `2`:

1. Four of a kind
2. Five-card same-suit sequence

Bomb strength order from weakest to strongest:

```text
Four of a kind < Five-card same-suit sequence
```

### Four of a Kind

Four of a kind means 4 cards with the same rank.

Example:

```text
7♠ 7♣ 7♦ 7♥
```

Rules:

* Four of a kind can beat a single `2`.
* Four of a kind cannot beat a pair of `2`s.
* Four of a kind can be beaten by a five-card same-suit sequence.
* A stronger four of a kind beats a weaker four of a kind by rank.

### Five-card Same-suit Sequence

Five-card same-suit sequence means 5 cards in order with the same suit.

Examples:

```text
7♠ 8♠ 9♠ 10♠ J♠
10♥ J♥ Q♥ K♥ A♥
```

Rules:

* Five-card same-suit sequence is stronger than four of a kind.
* Five-card same-suit sequence can beat a single `2`.
* Five-card same-suit sequence cannot beat a pair of `2`s.
* Five-card same-suit sequence can beat four of a kind.
* `2` cannot be used in this sequence.
* The sequence cannot wrap around from `A` back to `3`.

## Pair of 2 Rules

* A single `2` can be beaten by four of a kind or five-card same-suit sequence.
* A pair of `2`s can only be beaten by four consecutive pairs.
* Four of a kind cannot beat a pair of `2`s.
* Five-card same-suit sequence cannot beat a pair of `2`s.
* Three consecutive pairs cannot beat a pair of `2`s.
* Four consecutive pairs cannot beat a single `2`.

## Beat Rules

* A move with the same type and same number of cards beats the previous move if its highest card is stronger.
* A single beats another single by card rank, then suit strength if the rank is the same.
* A pair beats another pair by pair rank.
* A triple beats another triple by triple rank.
* A straight beats another straight only if it has the same number of cards and a higher highest card.
* Double pairs beat double pairs only if they have the same number of cards and a higher highest pair.
* Three consecutive pairs beat three consecutive pairs only if they have a higher highest pair.
* Four consecutive pairs beat four consecutive pairs only if they have a higher highest pair.
* Pair plus triple beats another pair plus triple by higher triple rank, then higher pair rank.
* Four of a kind can beat a single `2`.
* Five-card same-suit sequence can beat a single `2`.
* Only four consecutive pairs can beat a pair of `2`s`.
* Four consecutive pairs cannot beat a single `2`.
* Three consecutive pairs cannot beat any `2`.
* A stronger bomb can beat a weaker bomb.
* Bombs of the same type are compared by highest card strength.

## Point Cutting Rules

Point cutting is applied only in these cases:

1. Four of a kind beats a single `2`.
2. Five-card same-suit sequence beats a single `2`.
3. Four consecutive pairs beats a pair of `2`s`.

### Single 2 Cut

If four of a kind or five-card same-suit sequence beats a single `2`:

```text
Player who played single 2: -10 points
Player who beat the single 2: +10 points
```

### Pair of 2 Cut

If four consecutive pairs beats a pair of `2`s:

```text
Player who played pair of 2s: -20 points
Player who played four consecutive pairs: +20 points
```

### Bomb Chain Cut

If more bombs are played in the same single-`2` bomb chain, the final winning bomb player receives all cut points from the beaten players.

Example:

```text
Player 1 plays: 2♠
Player 2 plays: 2♥
Player 3 plays: 10♠ 10♣ 10♦ 10♥
Player 4 plays: 10♥ J♥ Q♥ K♥ A♥
```

Result:

```text
Player 1: -10 points
Player 2: -10 points
Player 3: -10 points
Player 4: +30 points
```

Reason:

* Player 1 played a single `2`.
* Player 2 played a stronger single `2`.
* Player 3 used four of a kind.
* Player 4 used a stronger five-card same-suit sequence bomb.
* Player 4 wins the bomb chain and receives all cut points.

### Pair of 2 Cut Example

```text
Player 1 plays: 2♠ 2♣
Player 2 plays: 6♠ 6♣ 7♠ 7♣ 8♠ 8♣ 9♠ 9♣
```

Result:

```text
Player 1: -20 points
Player 2: +20 points
```

Reason:

* Player 1 played a pair of `2`s.
* Player 2 played four consecutive pairs.
* Four consecutive pairs are the only move that can beat a pair of `2`s.

## Placement Scoring

At the end of the game, players receive placement points:

* 1st place: `+10` points.
* 2nd place: `+5` points.
* 3rd place: `-5` points.
* 4th place: `-10` points.

Point cutting is added separately from placement scoring.

## Run

```bash
npm install
npm run dev
```
