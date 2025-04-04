import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { GameProvider } from './context/game.tsx'

const $root = document.getElementById('root')!
createRoot($root).render(
  <GameProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </GameProvider>
)
