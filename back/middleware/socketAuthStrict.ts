import config from 'config'
import jwt from 'jsonwebtoken'
import { Socket } from 'socket.io'
import { ExtendedError } from 'socket.io/dist/namespace'

import { UserType } from '../customTypes/user'

export const socketAuthStrict = (socket: Socket, next: (err?: ExtendedError) => void) => {
  try {
    const token = socket.handshake.headers.authorization

    if (!token) {
      socket.disconnect()
    } else {
      const decoded = jwt.verify(token, config.get('jwtSecret')) as UserType
      // @ts-ignore
      socket.userId = decoded.userId
      next()
    }
  } catch (e) {
    socket.disconnect()
  }
}
