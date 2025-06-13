import { useContext } from 'react'
import { GameContext } from '../context/game'

import { type Player } from '../types/game'

import { Card as CardComponent } from './CardComponent'

interface GameInfoProps {
  readonly playerRef: React.RefObject<Player>
}

export function Oponentes({ playerRef }: GameInfoProps) {
  //TODO - Reportar un jugador que no informo que le quedaba una carta y penalizar si se reporta de forma erronea
  //TODO - Al eliminar al jugador actual, reorganizar el array para que se renderizen en el orden correcto

  const { board, players } = useContext(GameContext)!
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