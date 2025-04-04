import './App.css'
import { useState, useCallback, useRef, useEffect } from 'react'

import { CardType, type Card, type Color, generateDeck, SPECIAL_CARDS, WILD_CARDS } from './game/deck'
import { dealCards } from './game/deal'

import { Card as CardComponent } from './components/Card'
import { shuffle } from './game/shuffle'

import { calculateDecksNeeded } from './game/calculateNumberDecks'

import { type Board, GameDirection, type GameDirectionType, type Player } from './types/game'

import { socket } from './services/socket'
import useGameSocket from './hooks/useGameSocket'

import { ColorModal } from './components/ColorModal'
import { StartMenu } from './components/StartMenu'

const { CLOCKWISE, COUNTER_CLOCKWISE } = GameDirection

export default function App() {
  const NumberOfCardsPerPlayer = 7

  const [turn, setTurn] = useState <number> (0)
  const [penalty, setPenalty] = useState <number> (0)
  const [gameDirection, setGameDirection] = useState <GameDirectionType> (CLOCKWISE)

  const [showColorModal, setShowColorModal] = useState<boolean>(false)
  const [resolveColor, setResolveColor] = useState<((color: Color) => void) | null>(null);

  const [board, setBoard] = useState({} as Board | undefined)

  const playerRef = useRef<{ id: string; name: string; turn: number }>({
    id: '',
    name: '',
    turn: 0
  });

  const [players, setPlayers] = useState<Player[]>([]);

  const [gameStart, setGameStart] = useState<boolean>(false)

  useGameSocket({ setBoard, setTurn, setPenalty, setGameDirection, setPlayers, updatePlayer, setGameStart })
  
  useEffect(()=> {
    console.log(`board: \n ${board}`)
    if (!board) return

    console.log(`hands: \n ${board.hands}`)
  }, [board])
  
  // Started Game
  const joinGame = () => {
    if (playerRef) {
      socket.emit('joinGame', playerRef.current.name)
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
      if (!isValidCard) { // @fail - Esta permitiendo robar turno si la carta es del mismo color
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
    playerRef.current.name = e.target.value
  }

  function updatePlayer (player: Player) {
    playerRef.current = {...playerRef.current, ...player }
  }

  return (
    <main className={board?.activeColor && 'bg' + board.activeColor}>
      {/* <h1>UNO</h1> */}
      {
        (playerRef && !gameStart) && (
          <>
            <h1>UNO</h1>
            <StartMenu 
              playerRef={playerRef} 
              players={players} 
              joinGame={joinGame} 
              startGame={startGame} 
              handleChangeName={handleChangeName} 
            />
          </>
        )
      }
      {
        gameStart && (
          <section className='game-board'>
            <div className='game-info'>
              <h1>UNO</h1>
              <CardComponent card={board!.activeCard} className="big-card" />
              <div>
                <h3>Es el turno de: <strong>{players.find(p => p.turn === turn)!.name}</strong></h3>
                <h3>Dirección del juego: {gameDirection === CLOCKWISE ? '⬇️' : '⬆️'}</h3>
                { penalty > 0 && <h3>Penalización: {penalty}</h3> }
              </div>
            </div>
        
            {/* User Hand */}
            <section className='hands handBlock UserHand'>
              <div className='user-options'>
                <h4>{playerRef.current.name}</h4>
                {
                  ((turn === playerRef.current.turn) && (penalty === 0)) 
                  && (
                    <button onClick={() => handleDrawCard(playerRef.current.id)} className='btn' >
                      Robar Carta
                    </button>
                  )
                }
                {
                  ((turn === playerRef.current.turn) && (penalty > 0)) 
                  && (
                    <button className='btn'
                      onClick={() => { drawPenaltyCards(playerRef.current.turn, playerRef.current.id) }}
                    >
                      Robar {penalty} Cartas
                    </button>
                  )
                }
              </div>
              <div className='hand'>
                {
                  board!.hands[playerRef.current.id].map((card) => {
                    const {id, turn} = playerRef.current
                    const { key } = card
                    return (
                      <CardComponent key={key} card={card} playerTurn={turn} playerId={id} discardCard={discardCard}  />
                    )
                  })
                }
                
              </div>
            </section>

            {/* Oponent Hand */}
            <h3>Oponentes</h3>
            <section className='hands oponetsHand'>
              {
                Object.entries(board!.hands).filter(([playerId, _]) => playerId !== playerRef.current.id).map(([playerId, hand], _ ) => {
                  return (
                    <div key={playerId} className='handBlock'>
                      <h4>{players.find(p => p.id === playerId)!.name}</h4>
                        <div className='hand'>
                          {
                            hand.map((card) => {
                              const { key } = card
                              return (
                                <CardComponent key={key} />
                              )
                            })
                          }
                      </div>
                    </div>
                  )
                })
              }
            </section>

          </section>
        )
      }
      {
        showColorModal &&
          <ColorModal changeColor={handleColorSelect} />
      }
    </main>
  )
}
