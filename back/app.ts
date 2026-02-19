import { ApolloServer, gql } from 'apollo-server-express'
import config from 'config'
import cors from 'cors'
import dotenv from 'dotenv'
import express, { Application, Request, Response } from 'express'
import fileUpload from 'express-fileupload'
import { createServer } from 'http'
import 'module-alias/register'
import mongoose from 'mongoose'
import passport from 'passport'
import { Server, Socket } from 'socket.io'

import { errorsCodes } from '@constants/common'
import { onBrowser } from '@socket/handlers/browser'
import { AppSocket } from '@socket/types/socket'

import { socketAuthStrict } from '@middleware/socketAuthStrict'

import { createRoutes } from './routes'
import { onConnection } from './socket'

const typeDefs = gql`
  type Query {
    health: String
    add(x: Int!, y: Int!): Int
  }
`

const resolvers = {
  Query: {
    health: () => 'OK',
    add: (_: any, { x, y }: { x: number; y: number }) => x + y,
  },
}

const app: any = express()
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

async function createGraphQLServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({ req, res }), // сюда можно передать авторизацию
  })
  await server.start()
  server.applyMiddleware({ app, path: '/graphql', cors: false })
  console.log('GraphQL ready at /graphql')
}

const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
  },
  serveClient: false,
})

const browserNamespace = io.of('/browser')
browserNamespace.use(socketAuthStrict)

browserNamespace.on('connection', async (socket: any) => {
  console.log('Browser connected:', socket.id)

  await onBrowser(socket)
})

io.use(socketAuthStrict)

io.on('connection', async (socket: Socket) => {
  await onConnection(io, socket as AppSocket)
})

const routes = createRoutes(io)
app.get('/health', (req: any, res: any) => {
  res.status(200).send('OK')
})
// обработка маршрутов
app.use('/api/v1', routes.authRouter)
app.use('/api/v1/files', routes.filesRouter)
app.use('/api/v1/folders', routes.foldersRouter)
app.use('/api/v1/users', routes.usersRouter)
app.use('/api/v1/chats', routes.chatsRouter)

async function start() {
  const mongoUri = process.env.MONGO_URI
  if (!mongoUri) {
    console.error('Server Error: mongoUri is not defined!')
    process.exit(1)
  }

  try {
    await mongoose.connect(mongoUri, { autoIndex: true })
    await createGraphQLServer()
    app.use((_req: Request, res: Response) => {
      res.status(404).json({ message: 'Not found', code: errorsCodes.NOT_FOUND })
    })
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server started on port ${PORT}`)
    })
  } catch (error) {
    console.error('Server Error', (error as Error).message)
    process.exit(1)
  }
}

start()
