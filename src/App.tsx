import './App.css'
import { useState, useCallback, useRef, useContext } from 'react'
import { GameContext } from './context/game'

import { type Color } from './game/deck'
import { type Player } from './types/game'

import useGameSocket from './hooks/useGameSocket'

import { StartMenu } from './components/StartMenu'
import { GameBoard } from './components/GameBoard'
import { ColorModal } from './components/ColorModal'

export default function App() {
  const NumberOfCardsPerPlayer = 7

  const [showColorModal, setShowColorModal] = useState<boolean>(false)
  const [resolveColor, setResolveColor] = useState<((color: Color) => void) | null>(null);

  const playerRef = useRef<Player>({
    id: '',
    name: '',
    turn: 0
  });

  const { board, gameStart } = useContext(GameContext)!

  const { joinGame, startGame } = useGameSocket({ updatePlayer, playerRef, NumberOfCardsPerPlayer })

  // Choose Color Modal
  const getPlayerChosenColor = () => {
    return new Promise<Color>((resolve) => {
      setShowColorModal(true);
      setResolveColor(() => resolve); // Guardamos `resolve` para usarlo más tarde
    });
  };

  const handleColorSelect = useCallback((color: Color) => {
    if (resolveColor) {
      resolveColor(color);
      setShowColorModal(false);
      setResolveColor(null);
    }
  }, [resolveColor])

  // 
  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    playerRef.current.name = e.target.value
  }

  function updatePlayer (player: Player) {
    playerRef.current = {...playerRef.current, ...player }
  }

  return (
    <main className={board.activeColor && 'bg' + board.activeColor}>
      {
        (playerRef && !gameStart) &&
          <StartMenu 
            playerRef={playerRef} 
            joinGame={joinGame} 
            startGame={startGame} 
            handleChangeName={handleChangeName} 
          />
      }
      {
        gameStart && 
          < GameBoard playerRef={playerRef} getPlayerChosenColor={getPlayerChosenColor} />
      }
      {
        showColorModal &&
          <ColorModal changeColor={handleColorSelect} />
      }
    </main>
  )
}
