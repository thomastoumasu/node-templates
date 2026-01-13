const router = require('express').Router() // path is passed on when use() in app.js
const logger = require('../utils/logger')
const User = require('../models/user')
const Blog = require('../models/blog')
const Comment = require('../models/comment')

router.post('/reset', async (request, response) => {
  // logger.info('--testing.js: reset')
  await User.deleteMany({})
  await Blog.deleteMany({})
  await Comment.deleteMany({})
  response.status(204).end()
})

module.exports = router
