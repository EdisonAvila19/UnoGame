import { useContext } from 'react'
import { GameContext } from '@/context/game'

import { GameDirection } from '@/types/game'

import { Card as CardComponent } from '@/components/CardComponent'

const { CLOCKWISE } = GameDirection

export function GameInfo() {
  const {board, players, turn, gameDirection, penalty} = useContext(GameContext)!

  return (
    <div className='game-info'>
      <h1>UNO</h1>
      <CardComponent card={board?.activeCard} className="big-card" />
      <div>
        <h3>Es el turno de: <strong>{players.find(p => p.turn === turn)!.name}</strong></h3>
        <h3>Dirección del juego: {gameDirection === CLOCKWISE ? '⬇️' : '⬆️'}</h3>
        { penalty > 0 && <h3>Penalización: {penalty}</h3> }
      </div>
    </div>
  )
}