import type { Card } from './deck'

export function dealCards(deck: Card[], numPlayers: number, cardsPerPlayer: number) {
  const hands: Card[][] = Array.from({ length: numPlayers }, () => [])
  const remainingDeck = [...deck]

  for (let i = 0; i < cardsPerPlayer; i++) {
    for (const hand of hands) {
      if (remainingDeck.length > 0) {
        hand.push(remainingDeck.shift()!)
      }
    }
  }

  const activeCard: Card = remainingDeck.shift()!
  return { hands, remainingDeck, activeCard }
}