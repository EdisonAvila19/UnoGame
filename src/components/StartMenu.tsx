import { type Player } from '../types/game'

interface StartMenuProps {
  readonly playerRef: React.RefObject<{
    id: string;
    name: string;
    turn: number;
}>
  readonly players: Player[]
  readonly joinGame: () => void
  readonly startGame: () => void
  readonly handleChangeName: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function StartMenu ({ playerRef, players, joinGame, startGame, handleChangeName }: StartMenuProps) {


  return (
    <section className='start-menu welcome-message'>
      {
        !playerRef.current.name ? (
          <>
            <input type="text" defaultValue={playerRef.current.name} onChange={handleChangeName} />
            <button onClick={joinGame}>Unirse al juego</button>
          </>
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
  )
}