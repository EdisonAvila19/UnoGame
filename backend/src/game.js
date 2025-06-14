let gameState = {
  hands: [], // Card[][]
  remainingDeck: [], // Card[]
  discardPile: [], // Card[]
  activeCard: null, // Card
  activeColor: undefined, // Color | undefined
  turn: 0, // number
  penalty: 0, // number
  gameDirection: 'Clockwise', // 'Clockwise' | 'CounterClockwise'
  players: [], // Player[]
};

export function setupSocketHandlers(io) {
  // Para que el servidor pueda gestionar los sockets
  io.on('connection', (socket) => {
    console.log(`Jugador conectado: ${socket.id}`);

    socket.on('joinGame', (playerName) => {

      // Si el numero de jugadores es menor a 4
      if (gameState.players.length < 4) {
        const player = gameState.players.find(p => p.id === socket.id);
        
        // Si el jugador no existe en el juego
        if (!player) {
          gameState.players.push({ id: socket.id, name: playerName, turn: gameState.players.length });

          // Emitir a todos los clientes el estado actualizado del juego
          io.emit('gameState', gameState);
          io.emit('updatePlayers', gameState.players);
          
          // Emitir al nuevo jugador su ID
          socket.emit('playerJoined', socket.id);
          
          console.log('Jugador añadido:', {
            playerId: socket.id,
            playerName: playerName,
            totalPlayers: gameState.players.length
          });
        }
      }
    })

    socket.on('startGame', (data) => {
      gameState = { ...data };

      let gameStart = false;
      let getRandomTurn = 0;
      if (gameState.players.length > 1) {
        gameStart = true;
        getRandomTurn = Math.floor(Math.random() * gameState.players.length);
      }

      io.emit('gameState', {...gameState, turn: getRandomTurn, gameStart});
    })

    socket.on('endTurn', (data) => {
      gameState = { ...gameState, ...data };
      io.emit('gameState', gameState);
    })

    socket.on('drawCard', ({ hands, remainingDeck, discardPile }) => {
      io.emit('gameState', { ...gameState, hands, remainingDeck, discardPile });
    })

    socket.on('disconnect', () => {
      gameState = {
        hands: [],
        remainingDeck: [],
        discardPile: [],
        activeCard: null,
        activeColor: undefined,
        turn: 0,
        penalty: 0,
        gameDirection: 'Clockwise',
        players: [],
      };
      // gameState.players = gameState.players.filter((player) => player.id !== socket.id);
      io.emit('updatePlayers', gameState.players);
      io.emit('gameState', { ...gameState });
      console.log(`Jugador desconectado: ${socket.id}`);
    })
  })
}