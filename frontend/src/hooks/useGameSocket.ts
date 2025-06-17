import { useEffect, useContext } from 'react'
import { GameContext } from '@/context/game'

import { socket } from '@/services/socket'

import type { GameState, Player } from '@/types/game'

import { generateDeck } from '@/game/deck'
import { calculateDecksNeeded } from '@/game/calculateNumberDecks'
import { dealCards } from '@/game/deal'


export interface UseGameSocketProps {
  updatePlayer: (player: Player) => void
  playerRef: React.RefObject<Player>
  NumberOfCardsPerPlayer: number
}

export default function useGameSocket ({ updatePlayer, playerRef, NumberOfCardsPerPlayer }: UseGameSocketProps) {

  const { board, setBoard, turn, setTurn, penalty, setPenalty, gameDirection, setGameDirection, gameStart, setGameStart, players, setPlayers } = useContext(GameContext)!

  useEffect(() => {

    const handleGameState = (data: GameState) => {
      const { players, turn, penalty, gameDirection, gameStart, id, ...rest} = data

      setBoard(rest)
      setTurn(turn)
      setPenalty(penalty)
      setGameDirection(gameDirection)
      if (gameStart) setGameStart(true)
      if (id) {
        const newPlayer = players.find(p => p.id === id)
        if (!newPlayer) return
        updatePlayer(newPlayer)
      }
    }
    
    const handleUpdatePlayers = (players: Player[]) => {
      setPlayers(players)
    }

    const handlePlayerJoined = (id: string) => {
      updatePlayer({...playerRef.current, id})
    }

    socket.off('gameState')
    socket.off('updatePlayers')
    socket.off('playerJoined')

    socket.on('gameState', handleGameState)
    socket.on('updatePlayers', handleUpdatePlayers)
    socket.on('playerJoined', handlePlayerJoined)

    return () => {
      socket.off('gameState')
      socket.off('updatePlayers')
      socket.off('playerJoined')
    }
  }, [])

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

  return {
    board,
    gameStart,
    players,
    turn,
    gameDirection,
    penalty,
    joinGame,
    startGame
  }
}