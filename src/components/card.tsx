import type { Card as CardType } from '../game/deck'

interface CardProps {
  card: CardType
  playerTurn?: number
  playerId?: string
  discardCard?: (card: CardType, playerTurn: number, playerId: string) => void
}

export function Card({ card, playerTurn, playerId, discardCard }: Readonly<CardProps>) {

  const { value, color } = card
  const fontColor = color === 'blue' ? 'white' : 'black'

  return (
    <button
      onClick={() => discardCard?.(card, playerTurn ?? 0, playerId ?? '')}
      data-key={card.key}
      className='cardComponent'
      style={{ background: color, color: fontColor }}>
      {value}
    </button>
  )
}