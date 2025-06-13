export function calculateDecksNeeded(numPlayers: number, CARDS_PER_PLAYER: number) {
  const CARDS_PER_DECK = 108
  const MIN_REMAINING_CARDS = 50

  let numDecks = 1

  while (true) {
    const totalCards = numDecks * CARDS_PER_DECK
    const cardsDealt = numPlayers * CARDS_PER_PLAYER
    const remainingCards = totalCards - cardsDealt

    if (remainingCards >= MIN_REMAINING_CARDS) {
      return numDecks
    }

    numDecks++
  }
}
