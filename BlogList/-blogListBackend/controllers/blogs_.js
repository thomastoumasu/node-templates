// server written with callback functions (passes blog_api.test.js)

const blogRouter = require('express').Router() // path is passed on when use() in app.js
const Blog = require('../models/blog')

blogRouter.get('/', (request, response) => {
  Blog.find({}).then(blogs => {
    response.json(blogs)
  })
})

blogRouter.get('/:id', (request, response, next) => {
  const id = request.params.id
  Blog.findById(id)
    .then(blog => {
      // console.log('--blogs.js blog:', blog)
      if (!blog) {
        response.status(404).end()
      } else {
        response.json(blog)
      }
    })
    .catch(error => next(error))
})

blogRouter.post('/', (request, response) => {
  const body = request.body
  if (!Object.hasOwn(body, 'title') || !Object.hasOwn(body, 'url')) {
    response.statusMessage = 'title or url missing'
    return response.status(400).end()
  } else if (!Object.hasOwn(body, 'likes') ) {
    body.likes = 0
  }

  const blogToCreate = new Blog(body)

  blogToCreate.save()
    .then(createdBlog => {
      response.status(201).json(createdBlog)
    })
})

blogRouter.delete('/:id', (request, response, next) => {
  const id = request.params.id
  Blog.findByIdAndDelete(id)
    .then(blogToDelete => {
      // console.log('--blogs.js blogToDelete:', blogToDelete)
      if (!blogToDelete) { // no blog was found with this (valid but non existing) id
        response.status(410).end()
      } else {
        response.status(204).end()
      }
    })
    .catch(error => next(error))
})

blogRouter.put('/:id', (request, response, next) => {
  const body = request.body
  // console.log('--controllers/blogs.js: body: ', body)
  if (!Object.hasOwn(body, 'likes')) {
    response.statusMessage = 'likes missing'
    return response.status(400).end()
  }

  Blog.findById(request.params.id)
    .then(blogToUpdate => {
      // console.log('--blogs.js blogToUpdate:', blogToUpdate)
      if (!blogToUpdate) { // no blog was found with this (valid but non existing) id
        response.status(410).end()
      } else {
        blogToUpdate.likes = request.body.likes
        blogToUpdate.save()
          .then(updatedBlog => {
            response.json(updatedBlog)
          })
      }
    })
    .catch(error => next(error))
})

module.exports = blogRouter