import { Server } from 'socket.io'

import { AppSocket } from './types/socket'

export async function onConnection(io: Server, socket: AppSocket) {
  // регистрируем обработчики для пользователя.
}
