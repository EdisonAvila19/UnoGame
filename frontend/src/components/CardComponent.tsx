import type { Card as CardType } from '@/game/deck'
import { WILD_CARDS } from '@/game/deck'

const { CHANGE_COLOR } = WILD_CARDS

interface CardProps {
  readonly card?: CardType
  readonly playerTurn?: number
  readonly playerId?: string
  readonly discardCard?: (card: CardType, playerTurn: number, playerId: string) => void
  readonly className?: string
}

export function Card({ card, playerTurn, playerId, discardCard, className }: CardProps) {
  
  if (!card) {
    return <div className='cardComponent opCard' style={{ background: '#808080', cursor: 'context-menu'}}>🤔❓</div>
  }

  const { value, color } = card
  const fontColor = color === 'blue' ? 'white' : 'black'
  

  const renderColor = color 
    ? `var(--${color})` 
    : 'linear-gradient(145deg, var(--red), var(--yellow), var(--green), var(--blue))'

  const cardStyles: {background: string, color: string, cursor?: string} = {
    background: renderColor,
    color: fontColor,
    cursor: 'pointer'
  }
  
  if (!discardCard){
    cardStyles.cursor = 'context-menu'
  }
  
  const cardClass = className ? `cardComponent ${className}` : 'cardComponent'

  return (
    <button
      onClick={() => discardCard?.(card, playerTurn ?? 0, playerId ?? '')}
      data-key={card.key}
      className={cardClass}
      style={cardStyles}>
      {
        value === CHANGE_COLOR 
          ? ''
          : value
      }
    </button>
  )
}