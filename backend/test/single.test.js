import { server, io } from '../src/app.js'
import { setupSocketHandlers } from '../src/game.js'

import { io as Client } from 'socket.io-client'

setupSocketHandlers(io)

let clientSocket
let serverURL

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
  clientSocket = new Client(serverURL)

  await new Promise( resolve => {clientSocket.on('connect', resolve) })
  expect(clientSocket.connected).toBe(true)

  clientSocket.emit('joinGame', 'Jugador1')

  const playerId = await new Promise( resolve => {
    clientSocket.on('playerJoined', resolve)
  })

  expect(typeof playerId).toBe('string')
  expect(playerId).toBe(clientSocket.id)

  clientSocket.close()
})