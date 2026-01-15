require('dotenv').config()

const mongoose = require('mongoose')
const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
})
blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
const Blog = mongoose.model('Blog', blogSchema)
mongoose.set('strictQuery', false)
const url = process.env.MONGODB_URI
mongoose.connect(url)
console.log('--index.js connecting to', url)
mongoose.connect(url)
  .then(result => {
    console.log('--index.js connected to MongoDB')
  })
  .catch(error => {
    console.log('--index.js error connecting to MongoDB:', error.message)
  })

const express = require('express')
const app = express()
app.use(express.json())

// middleware: use morgan to log requests
const morgan = require('morgan')
morgan.token('postedData', (req) => {// log data sent in POST requests. (req, res)
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  } else {
    return null
  }
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postedData'))

app.get('/api/blogs', (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs)
  })
})

app.post('/api/blogs', (request, response) => {
  const blog = new Blog(request.body)

  blog.save().then((result) => {
    response.status(201).json(result)
  })
})

const PORT = process.env.PORT ||3003
app.listen(PORT, () => {
  console.log(`--index.js: Server running on port ${PORT}`)
})
