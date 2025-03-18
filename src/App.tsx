import { useState } from 'react'

import type { Card as CardType } from './game/deck'

import { COLORS, generateDeck, SPECIAL_CARDS, WILD_CARDS } from './game/deck'
import { dealCards } from './game/deal'

import { Card } from './components/card'
import { shuffle } from './game/shuffle'

//TODO Cambia color con +4
//TODO Cambiar de color con 🌈
//TODO Logica de 🚫
//TODO Regla del 0
//TODO Regla del 7

function calculateDecksNeeded(numPlayers: number, CARDS_PER_PLAYER: number) {
  const CARDS_PER_DECK = 108
  const MIN_REMAINING_CARDS = 50

  let numDecks = 1

  while (true) {
    const totalCards = numDecks * CARDS_PER_DECK
    const cardsDealt = numPlayers * CARDS_PER_PLAYER
    const remainingCards = totalCards - cardsDealt

    if (remainingCards >= MIN_REMAINING_CARDS) {
      return numDecks
    }

    numDecks++
  }
}

export default function App() {
  const NumberOfPlayers = 10
  const NumberOfCardsPerPlayer = 7
  const amountOfDecks = calculateDecksNeeded(NumberOfPlayers, NumberOfCardsPerPlayer)
  
  const [turn, setTurn] = useState <number> (0)
  const [penalty, setPenalty] = useState <number> (0)
  const [gameDirection, setGameDirection] = useState <'Clockwise' | 'CounterClockwise'> ('Clockwise')

  const [board, setBoard] = useState(() => {
    const deck = generateDeck(amountOfDecks)
    const { hands, remainingDeck, activeCard, discardPile } = dealCards(deck, NumberOfPlayers, NumberOfCardsPerPlayer)
    const activeColor = activeCard.color

    return { hands, remainingDeck, discardPile, activeCard, activeColor }
  })

  const endTurn = (
    playerIndex: number, 
    direction: 'Clockwise' | 'CounterClockwise' = gameDirection, 
    isBlocked: boolean = false 
  ) => {
    console.log('endTurn', playerIndex, direction, 'isBlocked', isBlocked);
    console.log(turn);
    
    if (direction === 'Clockwise') {
      if ( playerIndex === NumberOfPlayers - 1 ) {
        setTurn(0)
      } else {
        setTurn(playerIndex + 1)
      }
    } else {
      if ( playerIndex === 0 ) {
        setTurn(NumberOfPlayers - 1)
      } else {
        setTurn(playerIndex - 1)
      }
    }
  }

  const drawCard = (playerIndex: number, amount:number = 1) => {
    let remainingDeck = [...board.remainingDeck]
    let discardPile = [...board.discardPile]

    // if the deck is empty, shuffle the discard pile
    if (remainingDeck.length === 0 || remainingDeck.length < amount) { 
      const newDeck = [...board.discardPile]
      newDeck.pop() // remove active card from new deck
      remainingDeck = shuffle(newDeck)

      discardPile = [board.activeCard] 
    }
    
    // add the card to the player's hand
    const newHands = [...board.hands]
    for (let i = 0; i < amount; i++) {
      newHands[playerIndex].push(remainingDeck.shift()!)
    }
    
    setBoard({ ...board, hands: newHands, remainingDeck, discardPile })
  }

  const discardCard = (Card: CardType, playerIndex: number) => {
    
    const currentColor = board.activeColor
    const currentValue = board.activeCard.value

    const isWildCard = Card.value === WILD_CARDS[0] || Card.value === WILD_CARDS[1]
    const isValidCard = Card.color === currentColor || Card.value === currentValue

    // If another player plays and it is not their turn
    if ( playerIndex !== turn ) {
      if (!(Card.color === currentColor && Card.value === currentValue)) {
        drawCard(playerIndex, 2)
        return
      }
    } else {
      // If the active card is +2 or +4, add the penalty
      if ( penalty > 0 && Card.value !== currentValue) {
        drawCard(playerIndex, penalty)
        setPenalty(0)
        endTurn(playerIndex)
        return
      }
  
      // if is not a valid card, draw per penalty and end turn
      if (( !isWildCard && !isValidCard )){
        drawCard(playerIndex, 2)
        // endTurn(playerIndex)
        return
      }
    }

    // remove the card from the player's hand
    const newHands = [...board.hands]
    newHands[playerIndex] = newHands[playerIndex].filter(card => card.key !== Card.key)
    
    // add the card to the discard pile
    const discardPile = [...board.discardPile]
    discardPile.push(Card)

    let activeColor
    // set the active card and color

    const activeCard = Card
    if (activeCard.color)
      activeColor = activeCard.color
    else {
      // TODO - El usuario podrá elegir el color

      // assign a random color
      activeColor = COLORS[Math.floor(Math.random() * COLORS.length)]
    }

    // If the active card is +2 or +4, add the penalty
    if (activeCard.value === WILD_CARDS[1] || activeCard.value === SPECIAL_CARDS[2]) {
      const newPenalty = activeCard.value === '+2' ? 2 : 4
      setPenalty(penalty + newPenalty)
    }

    // If the active card is 🔄️, change the game direction
    let newGameDirection = gameDirection
    if (activeCard.value === SPECIAL_CARDS[1]) {
      newGameDirection = gameDirection === 'Clockwise' ? 'CounterClockwise' : 'Clockwise'
      setGameDirection(newGameDirection)
    }

    setBoard({ ...board, hands: newHands, discardPile, activeCard, activeColor })
    endTurn(playerIndex, newGameDirection)
  }

  return (
    <>
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

      <h3>Turn: {turn}</h3>
      <h3>Penalty: {penalty}</h3>
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
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
        <div style={{ background: board.activeColor, width: '50px', height: '50px', borderRadius: '5px', border: '1px solid black' }}></div>
        <Card card={board.activeCard} />
      </div>

      <h3>Hands {gameDirection === 'Clockwise' ? '⬇️' : '⬆️'}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {
          board.hands.map((hand, index) => {
            return (
              <div key={index} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px', alignItems: 'center', border: '1px solid black' }}>
                {
                  hand.map((card) => {
                    const { key } = card
                    return (
                      <Card key={key} card={card} playerIndex={index} discardCard={discardCard}  />
                    )
                  })
                }
                {
                  ((turn === index) && (penalty === 0)) 
                  && (
                    <button 
                      onClick={() => drawCard(index)} 
                      style={{ padding: '10px 25px', border: '1px solid black', borderRadius: '5px', cursor: 'pointer' }}>
                        Robar Carta
                    </button>
                  )
                }
                {
                  ((turn === index) && (penalty > 0)) 
                  && (
                    <button 
                      onClick={() => {drawCard(index, penalty); setPenalty(0); endTurn(index)}}
                      style={{ padding: '10px 25px', border: '1px solid black', borderRadius: '5px', cursor: 'pointer' }}>
                        Robar {penalty} Cartas
                    </button>
                  )
                }
              </div>
            )
          })
        }
      </div>
    </>
  )
}
