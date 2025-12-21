import { Server } from 'socket.io'

import { createId } from '@helpers/createId'

import ChatMessages from '@models/ChatMessages/ChatMessages'

import { AppSocket } from './types/socket'

export async function onConnection(io: Server, socket: AppSocket) {
  socket.join(socket.userId)

  socket.on('message:send', async ({ to, msg }) => {
    if (!to || !msg?.trim()) return

    const message = await ChatMessages.create({
      _id: createId(),
      from: socket.userId,
      to,
      msg,
    })

    const msgData = {
      _id: message._id,
      from: message.from,
      to: message.to,
      msg: message.msg,
    }

    // отправляем сразу и отправителю, и получателю
    io.to([socket.userId, to.toString()]).emit('message:new', msgData)
  })
}
