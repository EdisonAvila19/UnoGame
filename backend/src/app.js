import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import cors from 'cors'

console.log('Iniciando archivo app.js')

const allowedOrigins = [
  'https://unodev.netlify.app',
  'http://localhost:5173'
]

// const allowedOrigins = '*'

const app = express()
const server = createServer(app)

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true,
}))

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
})

export { server, io }