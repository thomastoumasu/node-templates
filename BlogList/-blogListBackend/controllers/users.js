const bcrypt = require('bcrypt')
const usersRouter = require('express').Router() // path is passed on when use() in app.js
const logger = require('../utils/logger')
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    // .populate('blogs')
    .populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const body = request.body
  // logger.info('--controllers/users.js: body: ', body)
  if (!Object.hasOwn(body, 'username') || !Object.hasOwn(body, 'password')) {
    // response.statusMessage = 'username or password missing'
    return response.status(400).json({ error: 'username or password missing' })
  }
  if ( body.username.length < 3 || body.password.length < 3 ) {
    return response.status(400).json({ error: 'both username and password must contain at least 3 characters' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const userToCreate = new User({
    name: body.name,
    username: body.username,
    passwordHash: passwordHash
  })

  const createdUser = await userToCreate.save()
  response.status(201).json(createdUser)
})

module.exports = usersRouter
