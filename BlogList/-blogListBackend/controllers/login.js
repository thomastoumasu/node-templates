const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router() // path is passed on when use() in app.js
// const logger = require('../utils/logger')
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body
  // logger.info('--controllers/login.js: username, password: ', username, password)

  const user = await User.findOne({ username })
  // logger.info('--controllers/login.js: user found: ', user)
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!passwordCorrect) {
    return response.status(401).json({ error: 'invalid username or password' })
  }

  const userForToken = {
    username: user.username,
    id: user._id
  }

  const token = jwt.sign(userForToken, process.env.SECRET)
  // const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60*60 }) // token expires in 60*60s, that is in 1h

  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter
