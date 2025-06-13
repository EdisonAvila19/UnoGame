import { useContext } from 'react'
import { GameContext } from '../context/game';

import { type Player } from '../types/game'

interface StartMenuProps {
  readonly playerRef: React.RefObject<Player>
  readonly joinGame: () => void
  readonly startGame: () => void
  readonly handleChangeName: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function StartMenu ({ playerRef, joinGame, startGame, handleChangeName }: StartMenuProps) {
  const { players } = useContext(GameContext)!

  return (
    <>
      <h1>UNO</h1>
      <section className='start-menu welcome-message'>
        {
          !playerRef.current.name ? (
            <div className='input-text'>
              <input type="text" defaultValue={playerRef.current.name} onChange={handleChangeName} />
              <button className='btn' onClick={joinGame}>Unirse al juego</button>
            </div>
          ) : (
            <>
              <p>Hola <strong>{playerRef.current.name}</strong></p>
              <p>Estamos esperando mas jugadores...</p>
            </>
          )
        }
        {
          players.length > 1 && (
            <>
              <p>¡Hay <strong>{players.length}</strong> jugadores!</p>
              <button className='btn' onClick={startGame}>Comenzar el juego</button>
            </>
          )
        }
      </section>
    </>
  )
}