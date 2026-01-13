//Middleware are functions that can be used for handling request and response objects.

const logger = require('./logger')
const morgan = require('morgan')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

morgan.token('postedData', request => {// log data sent in POST requests. (req, res)
  if (request.method === 'POST') {
    return JSON.stringify(request.body)
  } else {
    return null
  }
})

const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms :postedData',
  { skip: () => process.env.NODE_ENV === 'test' }
)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  // logger.info('--utils/middleware.js: authorization ', authorization)
  if (authorization && authorization.startsWith('Bearer')) {
    request.token = authorization.replace('Bearer ', '')
  }
  next()
}

const userExtractor = async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    logger.info('--utils/middleware.js: token could not be decoded')
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)
  // logger.info('--utils/middleware.js: found user: ', user)
  if (!user) {
    return response.status(400).json({ error: 'userId missing or not valid' })
  }
  request.user = user
  next()
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.name, ':', error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' }) // bad request
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message }) // bad request
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'token invalid' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' })
  }
  next(error)
}

module.exports = { requestLogger, unknownEndpoint, tokenExtractor, userExtractor, errorHandler }