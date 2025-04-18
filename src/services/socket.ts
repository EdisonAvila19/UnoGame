import { io } from 'socket.io-client'

export const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3001', {
  transports: ['websocket'],
  withCredentials: true
})