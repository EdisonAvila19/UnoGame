import { useContext } from 'react'
import { socket } from '../services/socket'

import { shuffle } from '../game/shuffle'

import { type Card, CardType, SPECIAL_CARDS, WILD_CARDS, type Color, type CardValue } from '../game/deck'
import { type Board, GameDirection } from '../types/game'
import { GameContext } from '../context/game'

const { CLOCKWISE, COUNTER_CLOCKWISE } = GameDirection

interface UseGameLogicProps {
  getPlayerChosenColor: () => Promise<Color>
}

export default function useGameLogic({ getPlayerChosenColor }: UseGameLogicProps) {

  const {board, gameDirection, players, turn, penalty } = useContext(GameContext)!

  const drawCard = (playerId: string, amount = 1): Board | undefined => {
    if (!board) return board

    let remainingDeck = [...board.remainingDeck]
    let discardPile = [...board.discardPile]

    // if the deck is empty, shuffle the discard pile
    if (remainingDeck.length < amount) { 
      const newDeck = [...discardPile]
      newDeck.pop() // remove active card from new deck
      remainingDeck = shuffle(newDeck)

      discardPile = [board.activeCard]
    }
    
    // add the card to the player's hand
    const newHands = { ...board.hands }
    for (let i = 0; i < amount; i++) {
      newHands[playerId].push(remainingDeck.shift()!)
    }
    
    return { ...board, hands: newHands, remainingDeck, discardPile }
  }

  const endTurn = (playerTurn: number, direction = gameDirection, isBlocked = false): number => {
    let nextPlayer = direction === CLOCKWISE 
      ? (playerTurn + 1) % players.length
      : (playerTurn - 1 + players.length) % players.length

    if (isBlocked) {
      nextPlayer = direction === CLOCKWISE 
        ? (nextPlayer + 1) % players.length
        : (nextPlayer - 1 + players.length) % players.length
    }
    return nextPlayer
  }

  const discardCard = async (card: Card, playerTurn: number, playerId: string) => {
    //TODO - Regla del 0 - Rotar las cartas con el siguiente jugador
    //TODO - Regla del 7 - Cambiar cartas con el jugador que se escoja
    if (!board) return

    const { hands, discardPile, activeCard, activeColor } = board
    const isWildCard = card.type === CardType.WILD
    const isValidCard = card.color === activeColor || card.value === activeCard.value

    // Si otro jugador intenta jugar fuera de su turno
    //FIXME - No realiza bien el filtro para robar turno, con que el color sea igual ya permite jugar
    //FIXME - Si se esta escogiendo el color, no se puede jugar
    if (playerTurn !== turn && !isValidCard) { 
      const newBoard = drawCard(playerId, 2)
      socket.emit('drawCard', newBoard)
      return
    }
    
    // Penalizacion por jugar una carta no valida al jugador activo
    if (!isWildCard && !isValidCard) {
      const newBoard = drawCard(playerId, 2)
      socket.emit('drawCard', newBoard)
      return
    }

    // Descartar la carta del jugador
    const newHands = { ...hands }
    newHands[playerId] = newHands[playerId].filter(c => c.key !== card.key)
    const newDiscardPile = [...discardPile, card]

    // Determinar el nuevo color activo (🌈 o +4)
    const newActiveColor = card.color ?? (await getPlayerChosenColor())

    // Aplicar penalización si es +2 o +4
    let newPenalty = penalty
    if ([WILD_CARDS.DRAW_FOUR as CardValue, SPECIAL_CARDS.DRAW_TWO as CardValue].includes(card.value)) {
      newPenalty += card.value === '+2' ? 2 : 4
    }

    // Cambiar dirección si es 🔄️
    let newGameDirection = gameDirection
    if (card.value === SPECIAL_CARDS.REVERSE) {
      newGameDirection = gameDirection === CLOCKWISE ? COUNTER_CLOCKWISE : CLOCKWISE
    }

    // Si la carta es 🚫, el siguiente jugador pierde el turno
    const nextPlayer = endTurn(playerTurn, newGameDirection, card.value === SPECIAL_CARDS.SKIP)
    
    // Enviar nuevos estados al servidor
    socket.emit('endTurn', { ...board, hands: newHands, discardPile: newDiscardPile, activeCard: card, activeColor: newActiveColor, turn: nextPlayer, penalty: newPenalty })
  }

  return {
    discardCard,
    drawCard,
    endTurn
  }
}
