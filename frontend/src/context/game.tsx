import { useState, createContext, useMemo } from 'react'

import type { GameDirectionType, Board, Player } from '../types/game'
import { GameDirection } from '../types/game'

const { CLOCKWISE } = GameDirection

interface GameProviderType {
  board: Board
  setBoard: (turn: Board) => void
  turn: number
  setTurn: (turn: number) => void
  penalty: number
  setPenalty: (penalty: number) => void
  gameDirection: GameDirectionType
  setGameDirection: (gameDirection: GameDirectionType) => void
  gameStart: boolean
  setGameStart: (gameStart: boolean) => void
  players: Player[]
  setPlayers: (players: Player[]) => void
}

export const GameContext = createContext<GameProviderType | null >(null)

interface GameProviderProps {
  readonly children: React.ReactNode
}

export function GameProvider ({ children }: GameProviderProps) {

  const [board, setBoard] = useState<Board>({ 
    hands: {}, 
    remainingDeck: [], 
    discardPile: [], 
    activeCard: { key: '', type: 'number', value: 0, color: undefined }, 
    activeColor: undefined 
  })
  const [turn, setTurn] = useState<number>(0)
  const [penalty, setPenalty] = useState<number>(0)
  const [gameDirection, setGameDirection] = useState<GameDirectionType>(CLOCKWISE)
  const [gameStart, setGameStart] = useState<boolean>(false)
  const [players, setPlayers] = useState<Player[]>([])

  const value = useMemo(
    () => ({
      board, setBoard,
      turn, setTurn,
      penalty, setPenalty,
      gameDirection, setGameDirection,
      gameStart, setGameStart,
      players, setPlayers
    }),
    [board, turn, penalty, gameDirection, gameStart, players]
  )
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}