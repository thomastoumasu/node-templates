// const logger = require('./logger')

const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}


const favoriteBlog = (blogs) => {
  const indexOfWinner = blogs.reduce( (indexOfWinnerSoFar, blog, blogIndex) =>
    blog.likes > blogs[indexOfWinnerSoFar].likes ? blogIndex : indexOfWinnerSoFar
  , 0)
  return blogs[indexOfWinner]
}

const mostBlogs = (blogs) => {
  if (blogs.length > 0) {
    const authorList = blogs.reduce(
      (authors, blog) => {
        authors[blog.author] = authors[blog.author]+1 || 1
        return authors
      }, {})
    // logger.info('debug', authorList)
    const blogCount = Object.values(authorList)
    const authors = Object.keys(authorList)
    const indexOfWinner = blogCount.reduce( (indexOfWinnerSoFar, count, countIndex) =>
      count > blogCount[indexOfWinnerSoFar] ? countIndex : indexOfWinnerSoFar
    , 0)
    return { 'author': authors[indexOfWinner], 'blogs': blogCount[indexOfWinner] }
  } else {
    return null
  }
}

const mostLikes = (blogs) => {
  if (blogs.length > 0) {
    const authorList = blogs.reduce(
      (authors, blog) => {
        authors[blog.author] = (authors[blog.author] + blog.likes) || blog.likes
        return authors
      }, {})
    // logger.info('debug', authorList)
    const likesCount = Object.values(authorList)
    const authors = Object.keys(authorList)
    const indexOfWinner = likesCount.reduce( (indexOfWinnerSoFar, count, countIndex) =>
      count > likesCount[indexOfWinnerSoFar] ? countIndex : indexOfWinnerSoFar
    , 0)
    return { 'author': authors[indexOfWinner], 'likes': likesCount[indexOfWinner] }
  } else {
    return null
  }
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }