// backend/__tests__/server.test.js
import { WebSocketServer, WebSocket } from 'ws'
import http from 'http'

describe('WebSocket Server', () => {
  let server
  let wss

  beforeAll((done) => {
    server = http.createServer();
    wss = new WebSocketServer({ server })

    server.listen(8080, () => {
      // Setup connection handling if needed
      wss.on('connection', (ws) => {
        ws.send('Hello client')
      })
      done()
    })
  })

  afterAll((done) => {
    wss.close()
    server.close(done)
  })

  test('should connect to WebSocket server and receive message', (done) => {
    const client = new WebSocket('ws://localhost:8080')

    client.on('message', (data) => {
      expect(data.toString()).toBe('Hello client')
      client.close()
      done()
    });
  });
});
