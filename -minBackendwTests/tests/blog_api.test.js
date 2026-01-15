// This backend test emulates frontend requests to the backend and checks:
// -responses (status, content, some header)
// -changes in database

const { test, beforeEach, after, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const mongoose = require('mongoose')
const helper = require('./test_helper')

const api = supertest(app)

describe('when there is initially some blogs saved', () => {
  beforeEach( async () => { // reset test db
    await Blog.deleteMany({})
    // await Blog.insertMany(helper.initialNotes) // one liner, or use Promise.all with array of promises:
    const promiseArray = helper.initialBlogs.map(blog => {
      const newBlog = new Blog(blog)
      return newBlog.save()
    })
    await Promise.all(promiseArray)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('the unique identifier property of the blogs is named id', async () => {
    const response = await api.get('/api/blogs')
    assert.deepStrictEqual(response.body.map(e => Object.hasOwn(e, 'id')), Array(helper.initialBlogs.length).fill(true))
    assert.deepStrictEqual(response.body.map(e => Object.hasOwn(e, '_id')), Array(helper.initialBlogs.length).fill(false))
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map(blog => blog.title)
    assert(titles.includes('secondTitle'))
  })

  describe('viewing a specific blog', () => {
    test('succeeds with a valid id', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToView = blogsAtStart[0]
      const response = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      assert.deepStrictEqual(response.body, blogToView)
    })

    test('fails with statuscode 404 if blog does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()
      await api
        .get(`/api/blogs/${validNonexistingId}`)
        .expect(404)
    })

    test('fails with statuscode 400 if id is invalid', async () => {
      await api
        .get(`/api/blogs/${'invalidId'}`)
        .expect(400)
    })
  })

  describe('addition of a new blog', () => {
    test('succeeds with valid data', async () => {
      const response = await api
        .post('/api/blogs/')
        .send(helper.dummyBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      // optional - check that response is same as posted blog
      const { id, ...returnedBlog } = response.body
      assert.deepStrictEqual(returnedBlog, helper.dummyBlog)

      // check that one blog was added to db
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      // check that title of posted blog has been added to db
      const titles = blogsAtEnd.map((blog) => blog.title)
      assert(titles.includes(helper.dummyBlog.title))

      // optional - check that blog added to db is same as response
      const savedBlog = blogsAtEnd.find(blog => blog.id === response.body.id)
      assert.deepStrictEqual(savedBlog, response.body)
    })

    test('fails with status code 400 if title or url is missing from the request', async () => {
      await api
        .post('/api/blogs/')
        .send(helper.blogWithMissingTitle)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

      await api
        .post('/api/blogs/')
        .send(helper.blogWithMissingUrl)
        .expect(400)

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('defaults to value 0 if likes property is missing from the request', async () => {
      const response = await api
        .post('/api/blogs/')
        .send(helper.blogWithMissingLikes)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      // check that one blog was added to db
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      // check that blog added to db has zero likes
      const savedBlog = blogsAtEnd.find(blog => blog.id === response.body.id)
      assert.strictEqual(savedBlog.likes, 0)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]
      const title = blogsAtStart[0].title
      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

      // check that one blog was deleted from db
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

      // check that title of deleted blog has been deleted from db
      const titles = blogsAtEnd.map((blog) => blog.title)
      assert(!titles.includes(title))
    })

    test('fails with statuscode 410 if no blog was found with this id', async () => {
      const validNonexistingId = await helper.nonExistingId()
      await api
        .delete(`/api/blogs/${validNonexistingId}`)
        .expect(410)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('fails with statuscode 400 if id is invalid', async () => {
      await api
        .delete(`/api/blogs/${'invalidId'}`)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })

  describe('update of a blog', () => {
    test('update of likes succeeds if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]
      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send({ 'likes': '146' })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      // check that no blog was added nor deleted from db
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

      // check that likes of updated blog has been indeed updated
      const updatedBlog = blogsAtEnd.find((blog) => blog.id === blogToUpdate.id)
      assert.strictEqual(updatedBlog.likes, 146)
    })

    test('update of likes fails with statuscode 410 if no blog was found with this id', async () => {
      const validNonexistingId = await helper.nonExistingId()
      await api
        .put(`/api/blogs/${validNonexistingId}`)
        .send({ 'likes': '146' })
        .expect(410)

      // check that no blog was added nor deleted from db
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('update of likes fails with statuscode 400 if id is invalid', async () => {
      await api
        .put(`/api/blogs/${'invalidId'}`)
        .send({ 'likes': '146' })
        .expect(400)

      // check that no blog was added nor deleted from db
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })
})

after( async () => {
  mongoose.connection.close()
})