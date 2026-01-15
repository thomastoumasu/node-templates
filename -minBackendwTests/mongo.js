//  node mongo.js pw to list database entries
// node mongo.js pw name number to add to database (does not use the model from ./models, so no mongoose validation)

const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2] // pw

const url = `mongodb+srv://thomastoumasu:${password}@cluster0.hmhtqmw.mongodb.net/testBloglist?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
})

const Blog = mongoose.model('Blog', blogSchema)

if (process.argv.length < 7) {
  Blog.find({}).then((result) => {
    console.log('blogs:')
    result.forEach((blog) => {
      console.log(blog.title, blog.author, blog.url, blog.likes)
    })
    mongoose.connection.close()
  })
} else {
  const blog = new Blog({
    title: process.argv[3],
    author: process.argv[4],
    url: process.argv[5],
    likes: process.argv[6],
  })
  blog.save().then(() => {
    console.log(`added ${blog.title} Author: ${blog.author} URL: ${blog.url} Likes: ${blog.likes} to blogs`)
    mongoose.connection.close()
  })
}
