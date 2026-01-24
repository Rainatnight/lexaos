import { Server } from 'socket.io'

import { createId } from '@helpers/createId'

import ChatMessages from '@models/ChatMessages/ChatMessages'
import Users from '@models/Users/Users'

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

    const userName = await Users.findOne({ _id: message.from }, { login: 1 }).lean()
    if (!userName) return

    const msgData = {
      _id: message._id,
      from: message.from,
      fromLogin: userName.login,
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
    io.to(toUserId.toString()).emit('call:cancelled', { by: socket.userId })
  })

  socket.on('call:end', ({ toUserId }) => {
    io.to(toUserId.toString()).emit('call:ended', {
      fromUserId: socket.userId,
    })
  })

  // webrtc
  // Offer
  socket.on('webrtc:offer', ({ toUserId, sdp }) => {
    io.to(toUserId.toString()).emit('webrtc:offer', {
      fromUserId: socket.userId,
      sdp,
    })
  })

  // Answer
  socket.on('webrtc:answer', ({ toUserId, sdp }) => {
    io.to(toUserId.toString()).emit('webrtc:answer', {
      fromUserId: socket.userId,
      sdp,
    })
  })

  // ICE candidates
  socket.on('webrtc:ice-candidate', ({ toUserId, candidate }) => {
    io.to(toUserId.toString()).emit('webrtc:ice-candidate', {
      fromUserId: socket.userId,
      candidate,
    })
  })
}
