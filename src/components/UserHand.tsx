import { useContext } from 'react'
import { GameContext } from '../context/game'

import { Card as CardComponent } from './CardComponent.tsx'

import useGameLogic from '../hooks/useGameLogic.ts'

import type { Player } from '../types/game'
import { type Color } from '../game/deck'

interface UserHandProps {
  readonly playerRef: React.RefObject<Player>,
  readonly getPlayerChosenColor: () => Promise<Color>
}

import { socket } from '../services/socket'

export function UserHand({ playerRef, getPlayerChosenColor }: UserHandProps) {
  const { board, turn, penalty } = useContext(GameContext)!
  
  const { discardCard, drawCard, endTurn } = useGameLogic({ getPlayerChosenColor })
  if (!board) return null
  
  const drawPenaltyCards = (playerTurn: number, playerId: string) => {
    const newBoard = drawCard(playerId, penalty);
    const nextPlayer = endTurn(playerTurn)
    socket.emit('endTurn', { ...newBoard, turn: nextPlayer, penalty: 0 })
  }

  const handleDrawCard = (playerIndex: string) => {
    const newBoard = drawCard(playerIndex); 
    socket.emit('drawCard', newBoard);
  }

  return (
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
          board.hands[playerRef.current.id].map((card) => {
            const {id, turn: pTurn} = playerRef.current
            const { key } = card
            return (
              <CardComponent key={key} card={card} playerTurn={pTurn} playerId={id} discardCard={discardCard}  />
            )
          })
        }
        
      </div>
    </section>
  )
}