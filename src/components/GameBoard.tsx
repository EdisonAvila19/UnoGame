import { GameInfo } from './GameInfo'
import { UserHand } from './UserHand'
import { Oponentes } from './Oponents'

import type { Player } from '../types/game'
import type { Color } from '../game/deck'

interface GameBoardProps {
  readonly playerRef: React.RefObject<Player>
  readonly getPlayerChosenColor: () => Promise<Color>
}

export function GameBoard({ playerRef, getPlayerChosenColor }: GameBoardProps) {
  return (
    <section className='game-board'>
      <GameInfo />
  
      {/* User Hand */}
      <UserHand playerRef={playerRef}getPlayerChosenColor={getPlayerChosenColor} />

      {/* Oponent Hand */}
      <Oponentes playerRef={playerRef} />
    </section>
  )
}