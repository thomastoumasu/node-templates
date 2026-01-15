// separated from web server, so app can now be tested at the level of HTTP API calls
// without actually making calls via HTTP over the network
// require('express-async-errors') // looks like it is now native in Express 5
const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const { info } = logger // do in two lines to use "Find All References" on logger. const { info, error }
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs')

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

app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/blogs', blogsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app