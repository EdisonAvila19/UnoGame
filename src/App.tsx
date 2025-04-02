import './App.css'
import { useState, useCallback, useRef, useEffect } from 'react'

import { CardType, type Card, type Color, COLORS, generateDeck, SPECIAL_CARDS, WILD_CARDS } from './game/deck'
import { dealCards } from './game/deal'

import { Card as CardComponent } from './components/card'
import { shuffle } from './game/shuffle'

import { calculateDecksNeeded } from './game/calculateNumberDecks'

import { type Board, GameDirection, type GameDirectionType, type Player } from './types/game'

import { socket } from './services/socket'
import useGameSocket from './hooks/useGameSocket'


const { CLOCKWISE, COUNTER_CLOCKWISE } = GameDirection

export default function App() {
  const NumberOfCardsPerPlayer = 7

  const [turn, setTurn] = useState <number> (0)
  const [penalty, setPenalty] = useState <number> (0)
  const [gameDirection, setGameDirection] = useState <GameDirectionType> (CLOCKWISE)

  const [showColorModal, setShowColorModal] = useState<boolean>(false)
  const [resolveColor, setResolveColor] = useState<((color: Color) => void) | null>(null);

  const [board, setBoard] = useState({} as Board | undefined)

  const playerNameRef = useRef<{ id: string; name: string; turn: number }>({
    id: '',
    name: '',
    turn: 0
  });

  const [players, setPlayers] = useState<Player[]>([]);

  const [gameStart, setGameStart] = useState<boolean>(false)

  useGameSocket({ setBoard, setTurn, setPenalty, setGameDirection, setPlayers, updatePlayer, setGameStart })
  
  useEffect(()=> {
    console.log(board)
    if (!board) return

    console.log('hands: ')
    console.log(board.hands);
  }, [board])
  
  // Started Game
  const joinGame = () => {
    if (playerNameRef) {
      socket.emit('joinGame', playerNameRef.current.name)
    }
  }

  const startGame = () => {
    const NumberOfPlayers = players.length
    const amountOfDecks = calculateDecksNeeded(NumberOfPlayers, NumberOfCardsPerPlayer)

    const deck = generateDeck(amountOfDecks)
    const { hands, remainingDeck, activeCard, discardPile } = dealCards(deck, players, NumberOfCardsPerPlayer)
    const activeColor = activeCard.color

    const newGameState = {
      hands,
      remainingDeck,
      discardPile,
      activeCard,
      activeColor,
      turn,
      penalty,
      gameDirection,
      players
    }

    socket.emit('startGame', newGameState)
  }

  // In Game
  const drawCard = (playerIndex: string, amount:number = 1): Board | undefined => {
    if (!board) return board
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
    const newHands = {...board.hands}
    for (let i = 0; i < amount; i++) {
      newHands[playerIndex].push(remainingDeck.shift()!)
    }
    
    return { ...board, hands: newHands, remainingDeck, discardPile }
  }

  const drawPenaltyCards = (playerTurn: number, playerId: string) => {
    const newBoard = drawCard(playerId, penalty);
    const nextPlayer =  endTurn(playerTurn)
    socket.emit('endTurn', { ...newBoard, turn: nextPlayer, penalty: 0 })
  }

  const discardCard = async (card: Card, playerTurn: number, playerId: string) => {
    //TODO Regla del 0
    //TODO Regla del 7

    const { hands, discardPile, activeCard, activeColor } = board!
    const currentColor = activeColor
    const currentValue = activeCard.value
  
    const isWildCard = card.type === CardType.WILD
    // console.log({isWildCard})

    const isValidCard = card.color === currentColor || card.value === currentValue
    // console.log({isValidCard})
    

    // Si otro jugador intenta jugar fuera de su turno
    if (playerTurn !== turn) {
      if (!isValidCard) {
        const newBoard = drawCard(playerId, 2)
        socket.emit('drawCard', newBoard)
        return
      }
    }
  
    // Aplicar penalización si corresponde
    if (penalty > 0 && card.value !== currentValue) {
      const newBoard = drawCard(playerId, penalty)
      const nextPlayer = endTurn(playerTurn)
      socket.emit('endTurn', { ...newBoard, turn: nextPlayer, penalty: 0 })
      return
    }
  
    // Si la carta jugada no es válida, el jugador roba por intentar poner una carta invalida, pero sigue el turno
    if (!isWildCard && !isValidCard) {
      const newBoard = drawCard(playerId, 2)
      socket.emit('drawCard', newBoard)
      // const nextPlayer = endTurn(playerIndex)
      return
    }
  
    // Remover la carta de la mano del jugador
    // const newHands = Object.entries(hands).map(([_, hand], playerTurn ) =>
    //   playerTurn === turn ? hand.filter(c => c.key !== card.key) : hand
    // )
    const newHands = {...hands}
    newHands[playerId] = newHands[playerId].filter(c => c.key !== card.key)
  
    // Agregar la carta al montón de descartes
    const newDiscardPile = [...discardPile, card]
  
    // Determinar el nuevo color activo (🌈 o +4)
    
    let newActiveColor = card.color 
    if (!newActiveColor) {
      newActiveColor = await getPlayerChosenColor()
    }
  
    // Aplicar penalización si es +2 o +4
    let newPenalty = penalty
    if (card.value === WILD_CARDS.DRAW_FOUR || card.value === SPECIAL_CARDS.DRAW_TWO) {
      newPenalty = penalty + (card.value === '+2' ? 2 : 4)
    }
  
    // Cambiar dirección si es 🔄️
    let newGameDirection = gameDirection
    if (card.value === SPECIAL_CARDS.REVERSE) {
      newGameDirection = gameDirection === CLOCKWISE ? COUNTER_CLOCKWISE : CLOCKWISE
    }
  
    // Si la carta es 🚫, el siguiente jugador pierde el turno
    const nextPlayer = endTurn(playerTurn, newGameDirection, card.value === SPECIAL_CARDS.SKIP)

    // Enviar nuevos estados al servidor
    socket.emit('endTurn', { ...board, hands: newHands, discardPile: newDiscardPile, activeCard: card, activeColor: newActiveColor, turn: nextPlayer, penalty: newPenalty })
  }

  // Choose Color Modal
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

  // End Turn
  const endTurn = (
    playerTurn: number, 
    direction: GameDirectionType = gameDirection, 
    isBlocked: boolean = false 
  ): number => {
    
    let nextPlayer

    if (direction === CLOCKWISE) {
      nextPlayer = ( playerTurn + 1 ) % players.length
    } else {
      nextPlayer = ( playerTurn - 1 + players.length ) % players.length
    }

    if (isBlocked) {
      if (direction === CLOCKWISE) {
        nextPlayer = ( nextPlayer + 1 ) % players.length
      } else {
        nextPlayer = ( nextPlayer - 1 + players.length ) % players.length
      }
    }

    return nextPlayer
  }

  const handleDrawCard = (playerIndex: string) => {
    const newBoard = drawCard(playerIndex); 
    socket.emit('drawCard', newBoard);
  }

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    playerNameRef.current.name = e.target.value
  }

  function updatePlayer (player: Player) {
    playerNameRef.current = {...playerNameRef.current, ...player }
  }

  return (
    <main>

      <h2>Juego de Uno</h2>
      {
        (playerNameRef && !gameStart) &&
        (
          <>
            <input type="text" defaultValue={playerNameRef.current.name} onChange={handleChangeName} />
            <button onClick={joinGame}>Unirse al juego</button>
            {
              players.length > 1 && <button onClick={startGame}>Comenzar el juego</button>
            }
          </>
        )
      }
      {
        gameStart && (
          <>
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
            {/* <h3>Discard Pile</h3>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px' }}>
              { board!.discardPile?.map((card) => {
                  const { key } = card
                  return (
                    <CardComponent key={key} card={card} />
                  )
                })
              }
            </div> */}
            
            <h3>Active Card</h3>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
              <div style={{ background: board!.activeColor}} className='cardComponent'></div>
              <CardComponent card={board!.activeCard} />
            </div>
        
            {/* TODO - Ver solo mi mano, y no la de los otros jugadores */}
            <h3>Hands {gameDirection === CLOCKWISE ? '⬇️' : '⬆️'}</h3>
            <div className='hands'>
              {
                Object.entries(board!.hands).map(([playerId, hand], _ ) => {
                  const playerTurn = players.find(p => p.id === playerId)!.turn
                  console.log(playerTurn);
                  
                  return (
                    <div key={playerId} className='hand'>
                      {
                        hand.map((card) => {
                          const { key } = card
                          return (
                            <CardComponent key={key} card={card} playerTurn={playerTurn} playerId={playerId} discardCard={discardCard}  />
                          )
                        })
                      }
                      {
                        ((turn === playerTurn) && (penalty === 0)) 
                        && (
                          <button onClick={() => handleDrawCard(playerId)} className='stealthCardBtn' >
                            Robar Carta
                          </button>
                        )
                      }
                      {
                        ((turn === playerTurn) && (penalty > 0)) 
                        && (
                          <button className='stealthCardBtn'
                            onClick={() => { drawPenaltyCards(playerTurn, playerId) }}
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
          </>
        )
      }
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
