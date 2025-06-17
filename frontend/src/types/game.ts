import type { Card, Color } from '@/game/deck'

export const GameDirection = {
  CLOCKWISE: 'Clockwise',
  COUNTER_CLOCKWISE: 'CounterClockwise'
} as const

export type GameDirectionType = (typeof GameDirection)[keyof typeof GameDirection]

export interface Player {
  id: string,
  turn: number,
  name: string
}

export type Hands = Record<string, Card[]>;

export interface Board {
    hands: Hands;
    remainingDeck: Card[];
    discardPile: Card[];
    activeCard: Card;
    activeColor?: Color;
}

export interface GameState extends Board {
  turn: number,
  penalty: number,
  gameDirection: GameDirectionType,
  players: Player[],
  gameStart?: boolean,
  id?: string
}

