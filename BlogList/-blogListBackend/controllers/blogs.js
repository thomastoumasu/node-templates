// server written with async await (passes blog_api.test.js). No need for express-async-errors or catch in express5

const blogRouter = require('express').Router() // path is passed on when use() in app.js
const Blog = require('../models/blog')
const Comment = require('../models/comment')
const logger = require('../utils/logger')
const { tokenExtractor, userExtractor } = require('../utils/middleware')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 }).populate('comments')
  response.json(blogs)
})

blogRouter.get('/:id', async (request, response) => {
  // logger.info('--controllers/blogs.js: request.params.id: ', request.params.id)
  const blog = await Blog.findById(request.params.id)
    .populate('user', { username: 1, name: 1 })
    .populate('comments')
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogRouter.post('/', tokenExtractor, userExtractor, async (request, response) => {
  // logger.info('--controllers/blogs.js: request.body: ', request.body)
  const blog = new Blog(request.body)
  const user = request.user
  // logger.info('--controllers/blogs.js: request.user: ', user)
  if (!user) {
    return response.status(403).json({ error: 'user missing' })
  }
  if (!blog.title || !blog.url) {
    return response.status(400).json({ error: 'title or url missing' })
  }

  blog.likes = blog.likes | 0
  blog.user = user // user is an object so now blog.user refers user

  // update user reference
  user.blogs = user.blogs.concat(blog._id)
  await user.save()
  // logger.info('--controllers/blogs.js: blog.user: ', blog.user)

  // save blog. db saves only userid as blog.user but savedBlog that is http-returned contains the full user object
  const savedBlog = await blog.save()
  // logger.info('--controllers/blogs.js: response.data: ', savedBlog)
  response.status(201).json(savedBlog)
})

blogRouter.delete('/:id', tokenExtractor, userExtractor, async (request, response) => {
  // logger.info('--controllers/blogs.js: id: ', request.params.id)
  const blogToDelete = await Blog.findById(request.params.id)
  // logger.info('--controllers/blogs.js: blogToDelete: ', blogToDelete)
  if (!blogToDelete) {
    // no blog was found with this (valid but non existing) id
    return response.status(410).end() // gone
  }

  const requestingUser = request.user
  if (blogToDelete.user.toString() !== requestingUser.id.toString()) {
    // logger.info('--controllers/blogs.js: id of the logged in user and id of the blog creator do not match')
    return response.status(401).json({ error: 'only blog creator can delete blog' })
  }

  // delete blog
  await blogToDelete.deleteOne()
  // delete blog reference from requestingUser
  requestingUser.blogs = requestingUser.blogs.filter(
    b => b._id.toString() !== blogToDelete._id.toString()
  )
  await requestingUser.save()
  // delete comments
  await Comment.deleteMany({ _id: blogToDelete.comments })
  response.status(204).end()
})

blogRouter.put('/:id', async (request, response) => {
  const body = request.body
  // logger.info('--controllers/blogs.js: body: ', body)
  if (!Object.hasOwn(body, 'likes')) {
    response.statusMessage = 'likes missing'
    return response.status(400).end()
  }

  const blogToUpdate = await Blog.findById(request.params.id)
    .populate('user', {
      username: 1,
      name: 1,
    })
    .populate('comments')
  // logger.info('--controllers/blogs.js: blogToUpdate: ', blogToUpdate)
  if (!blogToUpdate) {
    return response.status(410).end() // gone
  }

  blogToUpdate.likes = body.likes
  const updatedBlog = await blogToUpdate.save() // findByIdAndUpdate should be better than findById and save like here, see model solution
  response.json(updatedBlog)
})

blogRouter.post('/:id/comments', tokenExtractor, userExtractor, async (request, response) => {
  // logger.info('--controllers/blogs.js: body: ', request.body)
  const comment = new Comment(request.body)
  const blog = await Blog.findById(request.params.id)
    .populate('user', {
      username: 1,
      name: 1,
    })
    .populate('comments')
  // logger.info('--controllers/blogs.js: blogToComment: ', blog)
  if (!blog) {
    return response.status(410).end() // gone
  }

  comment.blog = blog._id
  blog.comments = blog.comments.concat(comment)
  await blog.save() // db saves only commentid as blog.comments element, but blog that is http-returned contains the full comment object
  await comment.save()
  // logger.info('--controllers/blogs.js: commentedBlog: ', blog)
  response.json(blog)
})

module.exports = blogRouter
