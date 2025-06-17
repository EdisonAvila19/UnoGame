import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App'
import { GameProvider } from '@/context/game'

const $root = document.getElementById('root')!
createRoot($root).render(
  <GameProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </GameProvider>
)
