import { shuffle } from './shuffle'

export const CardType = {
  NUMBER : 'number',
  SPECIAL : 'special',
  WILD : 'wild'
} as const

export const COLORS = ['red', 'green', 'blue', 'yellow'] as const
export const SPECIAL_CARDS = {
  SKIP: '🚫', 
  REVERSE: '🔄️', 
  DRAW_TWO: '+2'
} as const

export const WILD_CARDS = {
  CHANGE_COLOR: '🌈',
  DRAW_FOUR: '+4'
} as const

export type Color = (typeof COLORS)[number] // = red | green | blue | yellow
export type SpecialCard = (typeof SPECIAL_CARDS)[keyof typeof SPECIAL_CARDS] // = skip | reverse | draw2
export type WildCard = (typeof WILD_CARDS)[keyof typeof WILD_CARDS]// = ChangeColor | DrawFour

export type CardValue = number | SpecialCard | WildCard
export type CardType = (typeof CardType)[keyof typeof CardType]

export interface Card {
  key: string
  type: CardType
  value: CardValue
  color?: Color
}

export const generateDeck = (amount: number): Card[] => {
  const deck: Card[] = []
  
  for (let d = 1; d <= amount; d++){
    COLORS.forEach(color => {
      deck.push({ key: `${color}-${0}-${d}`, type: CardType.NUMBER, value: 0, color })
      for (let i = 1; i <= 9; i++){
        deck.push({ key: `${color}-${i}-1-${d}`, type: CardType.NUMBER, value: i, color })
        deck.push({ key: `${color}-${i}-2-${d}`, type: CardType.NUMBER, value: i, color })
      }
  
      Object.entries(SPECIAL_CARDS).forEach(([_, specialCard]) => {
        deck.push({ key: `${color}-${specialCard}-1-${d}`, type: CardType.SPECIAL, value: specialCard, color })
        deck.push({ key: `${color}-${specialCard}-2-${d}`, type: CardType.SPECIAL, value: specialCard, color })
      })
  
    })
  
     Object.entries(WILD_CARDS).forEach(([_, wildCard]) => {

       deck.push({ key: `wild-${wildCard}-1-${d}`, type: CardType.WILD, value: wildCard })
       deck.push({ key: `wild-${wildCard}-2-${d}`, type: CardType.WILD, value: wildCard })
       deck.push({ key: `wild-${wildCard}-3-${d}`, type: CardType.WILD, value: wildCard })
       deck.push({ key: `wild-${wildCard}-4-${d}`, type: CardType.WILD, value: wildCard })
     })
  }

  return shuffle(deck)
}