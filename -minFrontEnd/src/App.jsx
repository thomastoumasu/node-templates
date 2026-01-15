import { useEffect, useState } from 'react'
import './App.css'
import blogService from './services/blogs' 
import logger from './utils/logger'

const Blog = ({blog}) => 
  <div> {blog.title} {blog.author} </div>

const App = () => {
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    blogService
      .getAll()
      .then(initialBlogs => {
        logger.info('-app: initialBlogs: ', initialBlogs)
        setBlogs(initialBlogs)
      })
  }, [])

  return (
    <>
      {blogs
        ? <div>
          <h2>blogs</h2>
          {blogs.map(b =>
            <Blog key={b.id} blog={b} />
          )}
        </div>
        : null
      }
    </>
  )
}

export default App
