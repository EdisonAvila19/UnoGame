import type { Card as CardType, Color } from '../game/deck'

interface CardProps {
  card?: CardType
  playerTurn?: number
  playerId?: string
  discardCard?: (card: CardType, playerTurn: number, playerId: string) => void
}

export function Card({ card, playerTurn, playerId, discardCard }: Readonly<CardProps>) {
  
  if (!card) {
    return <div className='cardComponent' style={{ background: 'gray', cursor: 'context-menu'}}>🤔❓</div>
  }

  const { value, color } = card
  const fontColor = color === 'blue' ? 'white' : 'black'

  const cardStyles: {background: Color | undefined, color: string, cursor?: string} = {
    background: color,
    color: fontColor
  }
  
  if (!discardCard){
    cardStyles.cursor = 'context-menu'
  }
  
  return (
    <button
      onClick={() => discardCard?.(card, playerTurn ?? 0, playerId ?? '')}
      data-key={card.key}
      className='cardComponent'
      style={cardStyles}>
      {value}
    </button>
  )
}