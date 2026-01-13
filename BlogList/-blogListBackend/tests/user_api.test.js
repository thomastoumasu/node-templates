// This backend test emulates frontend requests to the backend and checks:
// -responses (status, content, some header)
// -changes in database

const { test, beforeEach, after, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
// const logger = require('../utils/logger')

const api = supertest(app)

describe('when there is initially one user saved', () => {
  beforeEach( async () => { // reset test db
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('password', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()
  })

  test('user is correctly returned as json', async () => {
    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const returnedUsername = response.body.map(u => u.username)[0]
    assert.deepStrictEqual('root', returnedUsername)
  })

  describe('creation of a new user', () => {
    test('succeeds with fresh username', async () => {
      const response = await api
        .post('/api/users/')
        .send(helper.dummyUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      // optional - check that response is same as posted user
      const { id, ...returnedUser } = response.body
      delete helper.dummyUser.password
      assert.deepStrictEqual(returnedUser, helper.dummyUser)

      // check that one user was added to db
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, 2)

      // check that username of posted user has been added to db
      const usernames = usersAtEnd.map(u => u.username)
      assert(usernames.includes(helper.dummyUser.username))

      // optional - check that user added to db is same as response
      const savedUser = usersAtEnd.find(u => u._id.toString() === id)
      assert.deepStrictEqual(savedUser.toJSON(), response.body)
    })

    test('fails with status code 400 if username already exists', async () => {
      const newUser = {
        username: 'root',
        password: 'alkj'
      }
      const result = await api
        .post('/api/users/')
        .send(newUser)
        .expect(400)
      assert(result.body.error.includes('expected `username` to be unique'))

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, 1)
    })

    test('fails with status code 400 if username or password is missing', async () => {
      const noNameUser = {
        password: 'alkj'
      }
      const firstResult = await api
        .post('/api/users/')
        .send(noNameUser)
        .expect(400)
      assert(firstResult.body.error.includes('username or password missing'))

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, 1)

      const noPwUser = {
        name: 'testName'
      }
      const secondResult = await api
        .post('/api/users/')
        .send(noPwUser)
        .expect(400)
      assert(secondResult.body.error.includes('username or password missing'))

      assert.strictEqual(usersAtEnd.length, 1)
    })

    test('fails with status code 400 if username or password are not at least 3 characters long', async () => {
      const tooShortUsernameUser = {
        password: 'alkj',
        username: 'al'
      }
      const firstResult = await api
        .post('/api/users/')
        .send(tooShortUsernameUser)
        .expect(400)
      assert(firstResult.body.error.includes('both username and password must contain at least 3 characters'))

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

      const tooShortPasswordUser = {
        password: 'kj',
        username: 'aldo'
      }
      const secondResult = await api
        .post('/api/users/')
        .send(tooShortPasswordUser)
        .expect(400)
      assert(secondResult.body.error.includes('both username and password must contain at least 3 characters'))

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })
})

after( async () => {
  mongoose.connection.close()
})