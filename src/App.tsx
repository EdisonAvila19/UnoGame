import './App.css'
import { useState, useCallback } from 'react'

import { CardType, type Card, Color, COLORS, generateDeck, SPECIAL_CARDS, WILD_CARDS } from './game/deck'
import { dealCards } from './game/deal'

import { Card as CardComponent } from './components/card'
import { shuffle } from './game/shuffle'

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
  const NumberOfPlayers = 3
  const NumberOfCardsPerPlayer = 7
  const amountOfDecks = calculateDecksNeeded(NumberOfPlayers, NumberOfCardsPerPlayer)
  
  const [turn, setTurn] = useState <number> (0)
  const [penalty, setPenalty] = useState <number> (0)
  const [gameDirection, setGameDirection] = useState <'Clockwise' | 'CounterClockwise'> ('Clockwise')

  const [showColorModal, setShowColorModal] = useState<boolean>(false)
  const [resolveColor, setResolveColor] = useState<((color: Color) => void) | null>(null);

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
    
    let nextPlayer

    if (direction === 'Clockwise') {
      nextPlayer = ( playerIndex + 1 ) % NumberOfPlayers
    } else {
      nextPlayer = ( playerIndex - 1 + NumberOfPlayers ) % NumberOfPlayers
    }

    if (isBlocked) {
      if (direction === 'Clockwise') {
        nextPlayer = ( nextPlayer + 1 ) % NumberOfPlayers
      } else {
        nextPlayer = ( nextPlayer - 1 + NumberOfPlayers ) % NumberOfPlayers
      }
    }

    setTurn(nextPlayer)
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

  const getPlayerChosenColor = () => {
    return new Promise<Color>((resolve) => {
      setShowColorModal(true);
      setResolveColor(() => resolve); // Guardamos `resolve` para usarlo más tarde
    });
  };

  const handleColorSelect = useCallback((color: Color) => {
    if (resolveColor) {
      resolveColor(color);
      setShowColorModal(false);
      setResolveColor(null);
    }
  }, [resolveColor])

  const discardCard = async (card: Card, playerIndex: number) => {
    //TODO Regla del 0
    //TODO Regla del 7

    const { activeCard, activeColor, hands, discardPile } = board
    const currentColor = activeColor
    const currentValue = activeCard.value
  
    const isWildCard = card.type === CardType.WILD
    console.log({isWildCard})

    const isValidCard = card.color === currentColor || card.value === currentValue
    console.log({isValidCard})
    

    // Si otro jugador intenta jugar fuera de su turno
    if (playerIndex !== turn) {
      if (!isValidCard) {
        drawCard(playerIndex, 2)
        return
      }
    }
  
    // Aplicar penalización si corresponde
    if (penalty > 0 && card.value !== currentValue) {
      drawCard(playerIndex, penalty)
      setPenalty(0)
      endTurn(playerIndex)
      return
    }
  
    // Si la carta jugada no es válida, el jugador roba por intentar poner una carta invalida, pero sigue el turno
    if (!isWildCard && !isValidCard) {
      drawCard(playerIndex, 2)
      // endTurn(playerIndex)
      return
    }
  
    // Remover la carta de la mano del jugador
    const newHands = hands.map((hand, i) =>
      i === playerIndex ? hand.filter(c => c.key !== card.key) : hand
    )
  
    // Agregar la carta al montón de descartes
    const newDiscardPile = [...discardPile, card]
  
    // Determinar el nuevo color activo (🌈 o +4)
    
    let newActiveColor = card.color 
    if (!newActiveColor) {
      newActiveColor = await getPlayerChosenColor()
    }
  
    // Aplicar penalización si es +2 o +4
    if (card.value === WILD_CARDS.DRAW_FOUR || card.value === SPECIAL_CARDS.DRAW_TWO) {
      setPenalty(prev => prev + (card.value === '+2' ? 2 : 4))
    }
  
    // Cambiar dirección si es 🔄️
    let newGameDirection = gameDirection
    if (card.value === SPECIAL_CARDS.REVERSE) {
      newGameDirection = gameDirection === 'Clockwise' ? 'CounterClockwise' : 'Clockwise'
      setGameDirection(newGameDirection)
    }
  
    // Actualizar el estado del tablero
    setBoard({ ...board, hands: newHands, discardPile: newDiscardPile, activeCard: card, activeColor: newActiveColor })
  
    // Si la carta es 🚫, el siguiente jugador pierde el turno
    endTurn(playerIndex, newGameDirection, card.value === SPECIAL_CARDS.SKIP)
  }

  return (
    <main>
      {/* <h3>Remaining Deck</h3>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px' }}>
        {
          board.remainingDeck.map((card) => {
            const { key } = card
            return (
              <CardComponent key={key} card={card} />
            )
          })
        }
      </div> */}

      <h3>Turn: {turn}</h3>
      <h3>Penalty: {penalty}</h3>
      <h3>Discard Pile</h3>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px' }}>
        {
          board.discardPile.map((card) => {
            const { key } = card
            return (
              <CardComponent key={key} card={card} />
            )
          })
        }
      </div>
      
      <h3>Active Card</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
        <div style={{ background: board.activeColor}} className='cardComponent'></div>
        <CardComponent card={board.activeCard} />
      </div>

      <h3>Hands {gameDirection === 'Clockwise' ? '⬇️' : '⬆️'}</h3>
      <div className='hands'>
        {
          board.hands.map((hand, index) => {
            return (
              <div key={index} className='hand'>
                {
                  hand.map((card) => {
                    const { key } = card
                    return (
                      <CardComponent key={key} card={card} playerIndex={index} discardCard={discardCard}  />
                    )
                  })
                }
                {
                  ((turn === index) && (penalty === 0)) 
                  && (
                    <button onClick={() => drawCard(index)} className='stealthCardBtn' >
                      Robar Carta
                    </button>
                  )
                }
                {
                  ((turn === index) && (penalty > 0)) 
                  && (
                    <button className='stealthCardBtn'
                      onClick={() => {drawCard(index, penalty); setPenalty(0); endTurn(index)}}
                    >
                      Robar {penalty} Cartas
                    </button>
                  )
                }
              </div>
            )
          })
        }
      </div>
      {
        showColorModal &&
        <div className="modal">
          <div className='modal-background'></div>
          <div className='modal-content'>
            <h2>Elige un color</h2>
            <div >
              {COLORS.map((color) => (
                <button key={color} onClick={() => handleColorSelect(color)} style={{background: color}} ></button>
              ))}
            </div>
          </div>
        </div>
      }
    </main>
  )
}
