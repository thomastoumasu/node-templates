const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
const Blog = require('../models/blog')

const blogsForTesting = [
  new Blog({
    title: 'testTitle',
    author: 'Robert C. Martin',
    url: 'testUrl',
    likes: 5,
  }),
  new Blog({
    title: 'testTitle',
    author: 'author2',
    url: 'testUrl',
    likes: 8,
  }),
  new Blog({
    title: 'testTitle',
    author: 'Robert C. Martin',
    url: 'testUrl',
    likes: 13,
  }),
  new Blog({
    title: 'testTitle',
    author: 'Robert C. Martin',
    url: 'testUrl',
    likes: 0,
  }),
  new Blog({
    title: 'testTitle',
    author: 'Edsger W. Dijkstra',
    url: 'testUrl',
    likes: 100,
  }),
  new Blog({
    title: 'testTitle',
    author: 'author3',
    url: 'testUrl',
    likes: 1,
  }),
  new Blog({
    title: 'testTitle',
    author: 'Robert C. Martin',
    url: 'testUrl',
    likes: 1,
  })
]

test('dummy returns one', () => {
  const result = listHelper.dummy([])
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  test('of an empty list is zero', () => {
    assert.strictEqual(listHelper.totalLikes([]), 0)
  })

  test('of a list with only one blog equals the likes of that', () => {
    const blog = blogsForTesting[0]
    assert.strictEqual(listHelper.totalLikes([blog]), blog.likes)
  })

  test('of a bigger list is calculated right', () => {
    assert.strictEqual(listHelper.totalLikes(blogsForTesting), 128)
  })
})

describe('Favorite blog', () => {
  test('of an empty list is undefined', () => {
    assert.strictEqual(listHelper.favoriteBlog([]), undefined)
  })

  test('of a list with only one blog is this blog', () => {
    const blog = blogsForTesting[1]
    assert.deepStrictEqual(listHelper.favoriteBlog([blog]), blog)
  })

  test('of a bigger list is the one with the most likes', () => {
    assert.deepStrictEqual(listHelper.favoriteBlog(blogsForTesting), blogsForTesting[4])
  })
})

describe('Author with most blogs', () => {
  test('of an empty list is null', () => {
    assert.strictEqual(listHelper.mostBlogs([]), null)
  })

  test('of a list with only one blog is this blog author', () => {
    const blog = blogsForTesting[1]
    assert.deepStrictEqual(listHelper.mostBlogs([blog]), { 'author': blog.author, 'blogs': 1 })
  })

  test('of a bigger list is the author with the most blogs', () => {
    assert.deepStrictEqual(listHelper.mostBlogs(blogsForTesting), { 'author': 'Robert C. Martin', 'blogs': 4 })
  })
})

describe('Author with most likes', () => {
  test('of an empty list is null', () => {
    assert.strictEqual(listHelper.mostLikes([]), null)
  })

  test('of a list with only one blog is this blog author', () => {
    const blog = blogsForTesting[1]
    assert.deepStrictEqual(listHelper.mostLikes([blog]), { 'author': blog.author, 'likes': blog.likes })
  })

  test('of a bigger list is the author with the most likes', () => {
    assert.deepStrictEqual(listHelper.mostLikes(blogsForTesting), { 'author': 'Edsger W. Dijkstra', 'likes': 100 })
  })
})