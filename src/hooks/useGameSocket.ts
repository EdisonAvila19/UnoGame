import { useEffect } from 'react'
import { socket } from '../services/socket'

import type { UseGameSocketProps, GameState } from '../types/game'

export default function useGameSocket ({ setBoard, setTurn, setPenalty, setGameDirection, setPlayers, updatePlayer, setGameStart }: UseGameSocketProps) {

  useEffect(() => {
    socket.on('gameState', (data: GameState) => {
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
    })

    socket.on('updatePlayers', (players) => {
      setPlayers(players)
    })

    return () => {
      socket.off('gameState')
      socket.off('updatePlayers')
    }
  }, [])
}