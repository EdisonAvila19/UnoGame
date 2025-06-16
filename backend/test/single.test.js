import { server, io } from '../src/app.js'
import { setupSocketHandlers } from '../src/game.js'

import { io as Client } from 'socket.io-client'

setupSocketHandlers(io)

let serverURL

async function connectClient() {
  const clientSocket = new Client(serverURL)
  await new Promise( resolve => {clientSocket.on('connect', resolve) })
  return clientSocket
}

beforeAll((done) => {
  server.listen(() => {
    //Obtener el puerto del server(backend)
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

test('El servidor acepta conexiones y responde al unirse', async () => {
  // Conectar el cliente(frontend) al servidor de WebSocket
  const clientSocket = await connectClient()
  expect(clientSocket.connected).toBe(true)

  const playerName = 'Jugador1'
  clientSocket.emit('joinGame', playerName)

  const [playerId, gameState, players] = await Promise.all([
    new Promise(resolve => clientSocket.on('playerJoined', resolve)),
    new Promise(resolve => clientSocket.on('gameState', resolve)),
    new Promise(resolve => clientSocket.on('updatePlayers', resolve))
  ])

  expect(typeof playerId).toBe('string')
  expect(playerId).toBe(clientSocket.id)

  expect(players.length).toBe(1)
  expect(players[0]).toEqual({ id: clientSocket.id, name: playerName, turn: 0 })

  // console.log({gameState});

  clientSocket.close()
})

test('El servidor conecta y desconecta un jugador multiples veces', async () => {
  const clientSocket_1 = await connectClient()
  expect(clientSocket_1.connected).toBe(true)
  
  const playerId_1 = clientSocket_1.id
  const playerName_1 = 'Jugador1'
  clientSocket_1.emit('joinGame', playerName_1)

  const players_1 = await new Promise(resolve => clientSocket_1.on('updatePlayers', resolve))

  expect(players_1.length).toBe(1)
  expect(players_1[0]).toEqual({ id: clientSocket_1.id, name: playerName_1, turn: 0 })

  clientSocket_1.close()


  const clientSocket_2 = await connectClient()
  expect(clientSocket_2.connected).toBe(true)

  expect(clientSocket_2.id).not.toBe(playerId_1)

  const playerName_2 = 'Jugador2'
  clientSocket_2.emit('joinGame', playerName_2)

  const players_2 = await new Promise(resolve => clientSocket_2.on('updatePlayers', resolve))
  expect(players_2.length).toBe(1)
  expect(players_2[0]).toEqual({ id: clientSocket_2.id, name: playerName_2, turn: 0 })

  clientSocket_2.close()
})

