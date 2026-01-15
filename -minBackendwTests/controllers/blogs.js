// server written with async await (passes blog_api.test.js). No need for express-async-errors or catch in express5

const blogRouter = require('express').Router() // path is passed on when use() in app.js
const Blog = require('../models/blog')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogRouter.get('/:id', async (request, response) => {
  // console.log('--controllers/blogs.js: request.params.id: ', request.params.id)
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogRouter.post('/', async (request, response) => {
  const body = request.body
  // console.log('--controllers/blogs.js: body: ', body)
  if (!Object.hasOwn(body, 'title') || !Object.hasOwn(body, 'url')) {
    response.statusMessage = 'title or url missing'
    return response.status(400).end()
  } else if (!Object.hasOwn(body, 'likes') ) {
    body.likes = 0
  }

  const blogToCreate = new Blog(body)

  const createdBlog = await blogToCreate.save()
  response.status(201).json(createdBlog)
})

blogRouter.delete('/:id', async (request, response) => {
  // console.log('--controllers/blogs.js: id: ', request.params.id)
  const blogToDelete = await Blog.findByIdAndDelete(request.params.id)
  // console.log('blogToDelete', blogToDelete)
  if (!blogToDelete) { // no blog was found with this (valid but non existing) id
    response.status(410).end() // gone
  } else {
    response.status(204).end()
  }
})

blogRouter.put('/:id', async (request, response) => {
  const body = request.body
  // console.log('--controllers/blogs.js: body: ', body)
  if (!Object.hasOwn(body, 'likes')) {
    response.statusMessage = 'likes missing'
    return response.status(400).end()
  }

  const blogToUpdate = await Blog.findById(request.params.id)
  // console.log('--controllers/blogs.js: blogToUpdate: ', blogToUpdate)
  if (!blogToUpdate) {
    return response.status(410).end() // gone
  }

  blogToUpdate.likes = body.likes
  const updatedBlog = await blogToUpdate.save()
  response.json(updatedBlog)
})


module.exports = blogRouter
