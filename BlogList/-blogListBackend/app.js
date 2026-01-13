// separated from web server, so app can now be tested at the level of HTTP API calls
// without actually making calls via HTTP over the network
const express = require('express')
// require('express-async-errors') // looks like it is now native in Express 5
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const { info } = logger // do in two lines to use "Find All References" on logger. const { info, error }
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const app = express()

mongoose.set('strictQuery', false)
const url = config.MONGODB_URI
info('--app.js connecting to', url)
mongoose
  .connect(url)
  .then( () => {
    info('--app.js connected to MongoDB')
  })
  .catch(error => {
    info('--app.js error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())
// This middleware takes the raw data from the requests that are stored in the request object, parses it into a JavaScript object and assigns it to the request object as a new property body.

app.use(middleware.requestLogger)
// app.use(middleware.tokenExtractor) // only used in some routes, see blogs.js in ./controllers

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test') { 
  // logger.info('using testing router')
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app