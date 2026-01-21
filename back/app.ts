import config from 'config'
import cors from 'cors'
import dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import fileUpload from 'express-fileupload'
import { createServer } from 'http'
import 'module-alias/register'
import mongoose from 'mongoose'
import passport from 'passport'
import { Server, Socket } from 'socket.io'

import { errorsCodes } from '@constants/common'
import { AppSocket } from '@socket/types/socket'

import { socketAuthStrict } from '@middleware/socketAuthStrict'

import { createRoutes } from './routes'
import { onConnection } from './socket'

const app = express()
dotenv.config()
const PORT = Number(config.get('port') || 5000)

// @ts-ignore
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

app.use(
  cors({
    origin: true,
    credentials: true,
  })
)

app.use(fileUpload({}) as any)
app.use(express.json({ limit: '10mb' }))

app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize() as any)

const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
  },
  serveClient: false,
})

io.use(socketAuthStrict)

io.on('connection', async (socket: Socket) => {
  await onConnection(io, socket as AppSocket)
})

const routes = createRoutes(io)
app.get('/health', (req, res) => {
  res.status(200).send('OK')
})
// обработка маршрутов
app.use('/api/v1', routes.authRouter)
app.use('/api/v1/files', routes.filesRouter)
app.use('/api/v1/folders', routes.foldersRouter)
app.use('/api/v1/users', routes.usersRouter)
app.use('/api/v1/chats', routes.chatsRouter)

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Not found', code: errorsCodes.NOT_FOUND })
})

async function start() {
  const mongoUri = process.env.MONGO_URI
  if (!mongoUri) {
    console.error('Server Error: mongoUri is not defined!')
    process.exit(1)
  }

  try {
    await mongoose.connect(mongoUri, { autoIndex: true })
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server started on port ${PORT}`)
    })
  } catch (error) {
    console.error('Server Error', (error as Error).message)
    process.exit(1)
  }
}

start()
