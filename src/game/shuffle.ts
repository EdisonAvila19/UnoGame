import type { Card } from './deck'

export function shuffle (deck: Card[]): Card[] {
  const shuffledDeck = [...deck]
  
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]]
  }

  return shuffledDeck
}