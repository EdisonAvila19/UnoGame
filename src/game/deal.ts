import type { Card } from './deck'

export function dealCards(deck: Card[], numPlayers: number, cardsPerPlayer: number) {
  const hands: Card[][] = Array.from({ length: numPlayers }, () => [])
  const remainingDeck = [...deck]
  const discardPile: Card[] = []

  for (let i = 0; i < cardsPerPlayer; i++) {
    for (const hand of hands) {
      if (remainingDeck.length > 0) {
        hand.push(remainingDeck.shift()!)
      }
    }
  }

  
  let activeCard: Card = remainingDeck.shift()!
  discardPile.push(activeCard)
  while (!activeCard.color) {
    activeCard = remainingDeck.shift()!
    discardPile.push(activeCard)
  }

  return { hands, remainingDeck, activeCard, discardPile }
}