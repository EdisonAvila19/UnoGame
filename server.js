import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

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


// Para que el servidor pueda gestionar los sockets
io.on('connection', (socket) => {
  console.log(`Jugador conectado: ${socket.id}`);

  socket.on('joinGame', (playerName) => {
    if (gameState.players.length < 4) {
      const player = gameState.players.find(p => p.id === socket.id);
      if (!player) {
        gameState.players.push({ id: socket.id, name: playerName, turn: 0 });
      }

      gameState.players.forEach((player, index) => {
        player.turn = index;
      })

      socket.emit('gameState', {...gameState, id: socket.id}) ;
      io.emit('updatePlayers', gameState.players);
      console.log(gameState);
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

// El servidor escucha desde el puerto que se le indique en el .env
server.listen(process.env.SERVER_PORT, '0.0.0.0', () => console.log(`Servidor corriendo en el puerto ${process.env.SERVER_PORT}`));