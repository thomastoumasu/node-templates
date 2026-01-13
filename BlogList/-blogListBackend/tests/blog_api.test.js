// This backend test emulates frontend requests to the backend and checks:
// -responses (status, content, some header)
// -changes in database

const { test, beforeEach, after, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const app = require('../app')
const logger = require('../utils/logger')
const Blog = require('../models/blog')
const Comment = require('../models/comment')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

let token = null
let _idOfFirstUser = null
let _idOfSecondUser = null

describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await Comment.deleteMany({})
    // reset user and blog collections
    await User.deleteMany({})
    // const usersAtReset = await helper.usersInDb()
    // logger.info('--test beforeEach: number of users in db should be 0: ', usersAtReset.length)
    // logger.info('--test beforeEach: users in db: ', usersAtReset)

    await User.insertMany(helper.initialUsers) // one liner - or do an array of Promise, see below with blogs
    const initUsers = await helper.usersInDb()
    // logger.info('--test beforeEach: number of users in db should be 2: ', initUsers.length)
    // logger.info('--test beforeEach: users in db: ', initUsers)
    const firstUser = initUsers.find(u => u.username === 'user1')
    const secondUser = initUsers.find(u => u.username === 'user2')
    _idOfFirstUser = firstUser._id
    _idOfSecondUser = secondUser._id
    // logger.info('--test beforeEach: idOfFirstUser, idOfSecondUser: ', _idOfFirstUser, _idOfSecondUser)

    await Blog.deleteMany({})
    // const blogsAtReset = await helper.blogsInDb()
    // logger.info('--test beforeEach: number of blogs in db should be 0: ', blogsAtReset.length)
    // logger.info('--test beforeEach: blogs in db: ', blogsAtReset)
    const promiseArray = helper.initialBlogs.map((blog, index) => {
      const newBlog = new Blog(blog)
      if (index < 4) {
        newBlog.user = _idOfFirstUser
        firstUser.blogs = firstUser.blogs.concat(newBlog._id)
      } else {
        newBlog.user = _idOfSecondUser
        secondUser.blogs = secondUser.blogs.concat(newBlog._id)
      }
      return newBlog.save()
    })
    await Promise.all(promiseArray)
    await firstUser.save()
    await secondUser.save()
    // const startBlogs = await helper.blogsInDb()
    // logger.info('--test beforeEach: blogs in db: ', startBlogs)
    // const startUsers = await helper.usersInDb()
    // logger.info('--test beforeEach: users in db: ', startUsers)
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
    assert.deepStrictEqual(
      response.body.map(e => Object.hasOwn(e, 'id')),
      Array(helper.initialBlogs.length).fill(true)
    )
    assert.deepStrictEqual(
      response.body.map(e => Object.hasOwn(e, '_id')),
      Array(helper.initialBlogs.length).fill(false)
    )
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
      await api.get(`/api/blogs/${validNonexistingId}`).expect(404)
    })

    test('fails with statuscode 400 if id is invalid', async () => {
      await api.get(`/api/blogs/${'invalidId'}`).expect(400)
    })
  })

  describe('addition of a new blog', () => {
    beforeEach(async () => {
      // get authorization token for first user
      const userForToken = {
        username: 'user1',
        id: _idOfFirstUser,
      }
      token = jwt.sign(userForToken, process.env.SECRET)
    })

    test('fails if no token is provided', async () => {
      await api
        .post('/api/blogs/')
        .send(helper.dummyBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/)
    })

    test('succeeds with valid data', async () => {
      const response = await api
        .post('/api/blogs/')
        .set('Authorization', `Bearer ${token}`)
        .send(helper.dummyBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      // optional - check that response is same as posted blog
      // logger.info('--test debug: reponse from post: ', response.body)
      const { user, id, ...returnedBlog } = response.body
      assert.deepStrictEqual(returnedBlog, helper.dummyBlog)
      assert.strictEqual(user.id, _idOfFirstUser.toString())

      // check that one blog was added to db
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      // check that title of posted blog has been added to db
      const titles = blogsAtEnd.map(blog => blog.title)
      assert(titles.includes(helper.dummyBlog.title))

      // optional - check that blog added to db is same as response
      const savedBlog = blogsAtEnd.find(blog => blog.id === id)
      delete response.body.user.blogs
      assert.deepStrictEqual(savedBlog, response.body)
    })

    test('fails with status code 400 if title or url is missing from the request', async () => {
      await api.post('/api/blogs/').set('Authorization', `Bearer ${token}`).send(helper.blogWithMissingTitle).expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

      await api.post('/api/blogs/').set('Authorization', `Bearer ${token}`).send(helper.blogWithMissingUrl).expect(400)

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('defaults to value 0 if likes property is missing from the request', async () => {
      const response = await api
        .post('/api/blogs/')
        .set('Authorization', `Bearer ${token}`)
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
    beforeEach(async () => {
      // get authorization token for first user
      const userForToken = {
        username: 'user1',
        id: _idOfFirstUser,
      }
      token = jwt.sign(userForToken, process.env.SECRET)
    })

    test('fails if no token is provided', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart.find(b => b.user.id === _idOfFirstUser.toString())
      // logger.info('--test debug: blogToDelete: ', blogToDelete)
      await api.delete(`/api/blogs/${blogToDelete.id}`).expect(401)
    })

    test('fails if token and blog creator do not match', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart.find(b => b.user.id === _idOfFirstUser.toString())

      const notBlogCreator = {
        username: 'user2',
        id: _idOfSecondUser,
      }
      const tokenNotFromBlogCreator = jwt.sign(notBlogCreator, process.env.SECRET)

      await api.delete(`/api/blogs/${blogToDelete.id}`).set('Authorization', `Bearer ${tokenNotFromBlogCreator}`).expect(401)
    })

    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const usersAtStart = await helper.usersInDb()
      const blogToDelete = blogsAtStart.find(b => b.user.id === _idOfFirstUser.toString())
      const blogNotToDelete = blogsAtStart.find(b => b.user.id === _idOfSecondUser.toString())
      await api
        .post(`/api/blogs/${blogToDelete.id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'that is a nice comment' })
      await api
        .post(`/api/blogs/${blogToDelete.id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'that is a mediocre comment' })
      await api
        .post(`/api/blogs/${blogNotToDelete.id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'that is a bad comment' })
      const title = blogToDelete.title
      await api.delete(`/api/blogs/${blogToDelete.id}`).set('Authorization', `Bearer ${token}`).expect(204)

      // check that one blog was deleted from db
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

      // check that title of deleted blog has been deleted from db
      const titles = blogsAtEnd.map(blog => blog.title)
      assert(!titles.includes(title))

      // check that the blog reference has been deleted from user
      const usersAtEnd = await helper.usersInDb()
      const blogsOfFirstUserAtStart = usersAtStart.find(u => u.id === _idOfFirstUser.toString()).blogs.map(_id => _id.toString())
      const blogsOfFirstUserAtEnd = usersAtEnd.find(u => u.id === _idOfFirstUser.toString()).blogs.map(_id => _id.toString())
      assert(blogsOfFirstUserAtStart.includes(blogToDelete.id))
      assert(!blogsOfFirstUserAtEnd.includes(blogToDelete.id))

      // check that the appropriate blog comments have been deleted
      const commentsAtEnd = await helper.commentsInDb()
      // console.log('commentsAtEnd', commentsAtEnd)
      const contents = commentsAtEnd.map(c => c.content)
      assert(!contents.includes('that is a nice comment'))
      assert(!contents.includes('that is a mediocre comment'))
      assert(contents.includes('that is a bad comment'))
    })

    test('fails with statuscode 410 if no blog was found with this id', async () => {
      const validNonexistingId = await helper.nonExistingId()
      await api.delete(`/api/blogs/${validNonexistingId}`).set('Authorization', `Bearer ${token}`).expect(410)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('fails with statuscode 400 if id is invalid', async () => {
      await api.delete(`/api/blogs/${'invalidId'}`).set('Authorization', `Bearer ${token}`).expect(400)

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
        .send({ likes: '146' })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      // check that no blog was added nor deleted from db
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

      // check that likes of updated blog has been indeed updated
      const updatedBlog = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)
      assert.strictEqual(updatedBlog.likes, 146)
    })

    test('update of likes fails with statuscode 410 if no blog was found with this id', async () => {
      const validNonexistingId = await helper.nonExistingId()
      await api.put(`/api/blogs/${validNonexistingId}`).send({ likes: '146' }).expect(410)

      // check that no blog was added nor deleted from db
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('update of likes fails with statuscode 400 if id is invalid', async () => {
      await api.put(`/api/blogs/${'invalidId'}`).send({ likes: '146' }).expect(400)

      // check that no blog was added nor deleted from db
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })

  describe('commenting a blog', () => {
    beforeEach(async () => {
      // get authorization token for first user
      const userForToken = {
        username: 'user1',
        id: _idOfFirstUser,
      }
      token = jwt.sign(userForToken, process.env.SECRET)
    })

    test('fails if no token is provided', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToComment = blogsAtStart[0]
      await api
        .post(`/api/blogs/${blogToComment.id}/comments`)
        .send({ content: 'test comment' })
        .expect(401)
        .expect('Content-Type', /application\/json/)
    })

    test('succeeds if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToComment = blogsAtStart[0]
      await api
        .post(`/api/blogs/${blogToComment.id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'test comment' })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      // check that no blog was added nor deleted from db
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

      // check that comment has been added to the blog
      const commentedBlog = blogsAtEnd.find(blog => blog.id === blogToComment.id)
      // logger.info('commentedBlog:', commentedBlog)
      const comments = commentedBlog.comments.map(c => c.content)
      assert(comments.includes('test comment'))
    })

    test('fails with statuscode 410 if no blog was found with this id', async () => {
      const validNonexistingId = await helper.nonExistingId()
      await api
        .post(`/api/blogs/${validNonexistingId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'test comment' })
        .expect(410)

      // check that no blog was added nor deleted from db
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })
})

after(async () => {
  mongoose.connection.close()
})
