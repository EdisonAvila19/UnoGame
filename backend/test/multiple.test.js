import { server, io } from '@/app.js'
import { setupSocketHandlers } from '@/game.js'

import { io as Client } from 'socket.io-client'

setupSocketHandlers(io)

let serverURL

async function connectClient() {
  const clientSocket = new Client(serverURL)
  await new Promise(resolve => { clientSocket.on('connect', resolve) })
  return clientSocket
}

beforeAll((done) => { 
  server.listen(() => {
    // Obtener el puerto del server(backend)
    const port = server.address().port
    console.log(`Servidor corriendo en el puerto ${port}`)
    serverURL = `http://localhost:${port}`

    done()
  })
})

afterAll((done) => {
  server.close(() => {
    console.log('Servidor cerrado después de la prueba')
    done()
  })
})

test('El servidor acepta multiples conexiones una a una', async () => {
  let clients = []
  
  try {
    clients = await Promise.all([
      connectClient(),
      connectClient(),
      connectClient()
    ])
    // Verificar que todos los clientes están conectados
    clients.forEach((client) => {
      expect(client.connected).toBe(true)
    })
  
    const boards = {}
  
    // Unirse al juego uno a uno
    for (const [i, client] of clients.entries()) {
      client.emit('joinGame', `Jugador${i + 1}`)
      boards[client.id] = await new Promise((resolve) => {
      Promise.all([
        new Promise(resolve => client.on('playerJoined', resolve)),
        new Promise(resolve => client.on('updatePlayers', resolve)),
        new Promise(resolve => client.on('gameState', resolve)),
      ]).then(resolve);
      });
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  
    Object.entries(boards).forEach(([userId, [bid, board, players]]) => {
      // Verificar que el ID del jugador este en la lista de jugadores
      expect(players.some(({id}) => id === userId )).toBe(true)
      // console.log(players)
    })

  } finally {
    clients.forEach((client) => {
      client.close()
    })
  }
})

test('El servidor acepta multiples conexiones simultaneas', async () => {
  let clients = []
  
  try {
    clients = await Promise.all([
      connectClient(),
      connectClient(),
      connectClient()
    ])
    // Verificar que todos los clientes están conectados
    clients.forEach((client) => {
      expect(client.connected).toBe(true)
    })
  
    const boards = {}
  
    // Unirse al juego simultáneamente
    await Promise.all(clients.map(async (client, i) => {
      client.emit('joinGame', `Jugador${i + 1}`)
      boards[client.id] = await new Promise((resolve) => {
        Promise.all([
          new Promise(resolve => client.on('playerJoined', resolve)),
          new Promise(resolve => client.on('gameState', resolve)),
          new Promise(resolve => client.on('updatePlayers', resolve))
        ]).then(resolve);
      });
    }));
  
    Object.entries(boards).forEach(([userId, [bid, board, players]]) => {
      // Verificar que el ID del jugador este en la lista de jugadores
      console.log(players)
      expect(players.some(({id}) => id === userId )).toBe(true)
    })

  } finally {
    clients.forEach((client) => {
      client.close()
    })
  }
})

//TODO Test para verificar que el servidor maneja correctamente la desconexión de un jugador
