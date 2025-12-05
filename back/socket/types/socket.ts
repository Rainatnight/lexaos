import { Socket } from 'socket.io'

export interface AppSocket extends Socket {
  userId: string
}
