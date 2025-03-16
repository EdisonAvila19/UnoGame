import { shuffle } from './shuffle'

export const COLORS = ['red', 'green', 'blue', 'yellow'] as const
export const SPECIAL_CARDS = ['🚫', '🔄️', '+2'] as const
export const WILD_CARDS = ['🌈', '+4'] as const

export type Color = (typeof COLORS)[number] // = red | green | blue | yellow
export type SpecialCard = (typeof SPECIAL_CARDS)[number] // = skip | reverse | draw2
export type WildCard = (typeof WILD_CARDS)[number] // = wild | wildDraw4
export type CardType = 'number' | 'special' | 'wild'

export interface Card {
  key: string
  type: CardType
  value: number | SpecialCard | WildCard
  color?: Color
}

export const generateDeck = (): Card[] => {
  const deck: Card[] = []

  COLORS.forEach(color => {
    
    deck.push({ key: `${color}${0}`, type: 'number', value: 0, color })
    for (let i = 1; i <= 9; i++){
      deck.push({ key: `${color}${i}1`, type: 'number', value: i, color })
      deck.push({ key: `${color}${i}2`, type: 'number', value: i, color })
    }

    SPECIAL_CARDS.forEach(specialCard => {
      deck.push({ key: `${color}${specialCard}1`, type: 'special', value: specialCard, color })
      deck.push({ key: `${color}${specialCard}2`, type: 'special', value: specialCard, color })
    })

  })

   WILD_CARDS.forEach(wildCard => {
     deck.push({ key: `wild${wildCard}1`, type: 'wild', value: wildCard })
     deck.push({ key: `wild${wildCard}2`, type: 'wild', value: wildCard })
     deck.push({ key: `wild${wildCard}3`, type: 'wild', value: wildCard })
     deck.push({ key: `wild${wildCard}4`, type: 'wild', value: wildCard })
   })

  return shuffle(deck)
}