const config = require('./utils/config')
const logger = require('./utils/logger')
const app = require('./app') //only imports the actual application from app.js, ...

//... then starts the application.
const PORT = config.PORT
app.listen(PORT, () => {
  logger.info(`--index.js: Server running on port ${PORT}`)
})