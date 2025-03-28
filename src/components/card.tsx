import type { Card as CardType } from '../game/deck'

interface CardProps {
  card: CardType
  playerIndex?: number
  discardCard?: (card: CardType, playerIndex: number) => void
}

export function Card({ card, playerIndex, discardCard }: Readonly<CardProps>) {

  const { value, color } = card
  const fontColor = color === 'blue' ? 'white' : 'black'

  return (
    <button
      onClick={() => discardCard?.(card, playerIndex ?? 0)}
      data-key={card.key}
      className='cardComponent'
      style={{ background: color, color: fontColor }}>
      {value}
    </button>
  )
}