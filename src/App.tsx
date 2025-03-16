import { useState } from 'react'

import type { Card as CardType } from './game/deck'

import { generateDeck } from './game/deck'
import { dealCards } from './game/deal'

import { Card } from './components/card'
import { shuffle } from './game/shuffle'

export default function App() {
  const NumberOfPlayers = 3
  const NumberOfCardsPerPlayer = 7
  
  const [board, setBoard] = useState(() => {
    const deck = generateDeck()
    const { hands, remainingDeck, activeCard } = dealCards(deck, NumberOfPlayers, NumberOfCardsPerPlayer)
    const discardPile: CardType[] = [activeCard]
    return { initialDeck: deck, hands, remainingDeck, discardPile, activeCard }
  })

  const drawCard = (playerIndex: number) => {
    let remainingDeck = [...board.remainingDeck]
    let discardPile = [...board.discardPile]

    if (remainingDeck.length === 0) {
      const newDeck = [...board.discardPile]
      newDeck.pop() // remove active card
      remainingDeck = shuffle(newDeck)

      discardPile = [board.activeCard] 
    }
    
    const newHands = [...board.hands]
    newHands[playerIndex].push(remainingDeck.shift()!)
    
    setBoard({ ...board, hands: newHands, remainingDeck, discardPile })
  }

  const discardCard = (Card: CardType, playerIndex: number) => {
    
    const newHands = [...board.hands]
    newHands[playerIndex] = newHands[playerIndex].filter(card => card.key !== Card.key)
    
    const discardPile = [...board.discardPile]
    discardPile.push(Card)

    const activeCard = Card

    setBoard({ ...board, hands: newHands, discardPile, activeCard })
  }

  return (
    <>
      <h3>Discard Pile</h3>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px' }}>
        {
          board.discardPile.map((card) => {
            const { key } = card
            return (
              <Card key={key} card={card} />
            )
          })
        }
      </div>
      
      <h3>Active Card</h3>
      <Card card={board.activeCard} />

      <h3>Remaining Deck</h3>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px' }}>
        {
          board.remainingDeck.map((card) => {
            const { key } = card
            return (
              <Card key={key} card={card} />
            )
          })
        }
      </div>

      <h3>Hands</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {
          board.hands.map((hand, index) => {
            return (
              <div key={index} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                {
                  hand.map((card) => {
                    const { key } = card
                    return (
                      <Card key={key} card={card} playerIndex={index} discardCard={discardCard}  />
                    )
                  })
                }
                <button 
                  onClick={() => drawCard(index)} 
                  style={{ padding: '10px 25px', border: '1px solid black', borderRadius: '5px', cursor: 'pointer' }}>
                    Robar Carta
                </button>
              </div>
            )
          })
        }
      </div>
    </>
  )
}
