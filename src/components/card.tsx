import type { Card as CardType } from '../game/deck'

interface CardProps {
  readonly card?: CardType
  readonly playerTurn?: number
  readonly playerId?: string
  readonly discardCard?: (card: CardType, playerTurn: number, playerId: string) => void
  readonly className?: string
}

const renderColors = {
  'blue': '#0185c8',
  'red': '#fe2626',
  'green': '#3dc400',
  'yellow': '#febe00',
}

export function Card({ card, playerTurn, playerId, discardCard, className }: CardProps) {
  
  if (!card) {
    return <div className='cardComponent opCard' style={{ background: '#808080', cursor: 'context-menu'}}>🤔❓</div>
  }

  const { value, color } = card
  const fontColor = color === 'blue' ? 'white' : 'black'


  const render = color ? renderColors[color] : '#808080' 

  const cardStyles: {background: string, color: string, cursor?: string} = {
    background: render,
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
      {value}
    </button>
  )
}