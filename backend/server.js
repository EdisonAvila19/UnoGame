import 'dotenv/config'
import { server, io } from '@/app'
import { setupSocketHandlers } from '@/game'

setupSocketHandlers(io)

// El servidor escucha desde el puerto que se le indique en el .env
server.listen(process.env.SERVER_PORT, () => console.log(`Servidor corriendo en el puerto ${process.env.SERVER_PORT}`));