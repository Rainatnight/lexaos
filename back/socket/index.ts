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

  socket.on('call:offer', ({ toUserId, fromUser }) => {
    io.to(toUserId.toString()).emit('call:incoming', { fromUser })
  })

  // Принять звонок
  socket.on('call:accept', ({ fromUserId }) => {
    io.to(fromUserId.toString()).emit('call:accepted', { by: socket.userId })
  })

  // Отклонить звонок
  socket.on('call:reject', ({ fromUserId }) => {
    io.to(fromUserId.toString()).emit('call:rejected', { by: socket.userId })
  })

  // Отмена звонка
  socket.on('call:cancel', ({ toUserId }) => {
    io.to(toUserId.toString()).emit('call:cancelled')
  })
}
