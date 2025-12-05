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
const PORT = config.get('port') || 5000

// @ts-ignore
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

app.use(
  cors({
    origin: [config.get('clientPort')],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
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

// обработка маршрутов
app.use('/api/v1', routes.authRouter)
app.use('/api/v1/folders', routes.foldersRouter)

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Not found', code: errorsCodes.NOT_FOUND })
})

async function start() {
  try {
    await mongoose.connect(config.get('mongoUri'), {
      autoIndex: true,
    })

    server.listen(PORT, () => {
      console.log(`Server started in ${PORT} port`)
    })
  } catch (error) {
    console.log('Server Error', (error as Error).message)
    process.exit(1)
  }
}

start()
