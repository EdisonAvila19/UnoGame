import type { Card } from './deck'
import type { Player, Hands } from '../types/game'

export function dealCards(deck: Card[], players: Player[], cardsPerPlayer: number) {
  // const numPlayers = players.length

  const hands: Hands = {}
  const remainingDeck = [...deck]
  const discardPile: Card[] = []

  for (let i = 0; i < cardsPerPlayer; i++) {
    for (const hand of players) {
      if (remainingDeck.length > 0) {
        if (!hands[hand.id]) 
          hands[hand.id] = [remainingDeck.shift()!]
        else
          hands[hand.id].push(remainingDeck.shift()!)
      }
    }
  }

  
  let activeCard: Card = remainingDeck.shift()!
  discardPile.push(activeCard)
  while (!activeCard.color) {
    activeCard = remainingDeck.shift()!
    discardPile.push(activeCard)
  }

  console.log(hands);
  
  return { hands, remainingDeck, activeCard, discardPile }
}