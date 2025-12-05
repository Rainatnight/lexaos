import swaggerJsDoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API',
      version: '1.0.0',
      description: 'The REST API',
    },
    servers: [
      {
        url: 'https://bsim-stage.distant.global',
        description: 'Stage server',
      },
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./swaggerInfo/*yml'],
}

const specs = swaggerJsDoc(options)

export default specs
