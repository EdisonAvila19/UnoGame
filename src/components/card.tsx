import type { Card as CardType } from '../game/deck'

interface CardProps {
  card: CardType
  playerIndex?: number
  discardCard?: (card: CardType, playerIndex: number) => void
}

export function Card({ card, playerIndex, discardCard }: CardProps) {

  const { value, color } = card
  const fontColor = color === 'blue' ? 'white' : 'black'



  return (
    <button
      onClick={() => discardCard?.(card, playerIndex ?? 0)}
      style={{ background: color, width: '50px', height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: fontColor, borderRadius: '10px', border: '1px solid black' }}>
      {value}
    </button>
  )
}