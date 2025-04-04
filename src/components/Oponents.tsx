import { useContext } from 'react'
import { GameContext } from '../context/game'

import { type Player } from '../types/game'

import { Card as CardComponent } from './Card'

interface GameInfoProps {
  readonly playerRef: React.RefObject<Player>
}

export function Oponentes({ playerRef }: GameInfoProps) {

  const { board, players } = useContext(GameContext)!
  if (!board) return null

  return (
    <>
      {/* <h3>Oponentes</h3> */}
      <section className='hands oponetsHand'>
        {
          Object.entries(board.hands).filter(([playerId, _]) => playerId !== playerRef.current.id).map(([playerId, hand], _ ) => {
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
    </>
  )
}