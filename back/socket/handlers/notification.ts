import { AppSocket } from '../types/socket'

export function notificationHandlers(socket: AppSocket) {
  const { userId } = socket
  socket.join(userId)
}
