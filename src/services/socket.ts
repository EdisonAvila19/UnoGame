import { io } from 'socket.io-client'

export const socket = io(import.meta.env.SERVER_URL || 'http://localhost:3001')