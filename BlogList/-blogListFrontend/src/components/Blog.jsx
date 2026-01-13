import { useState } from 'react'
import logger from '../utils/logger'

const Blog = ({ blog, likeBlog, deleteBlog, loggedInUsername }) => {
  const blogWithDetailsStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }
  const [showDetails, setShowDetails] = useState(false)

  const toggleShowDetails = () => {
    setShowDetails(!showDetails)
  }

  if (showDetails) {
    return (
      <div className='blogWithDetails' style={blogWithDetailsStyle}>
        <div>{blog.title} {blog.author}
          <button onClick={toggleShowDetails}>hide</button>
        </div>
        <div>{blog.url}</div>
        <div>likes {blog.likes}
          <button onClick={() => { likeBlog(blog.id) }}>like</button>
        </div>
        <div>{blog.user.name}</div>
        {(loggedInUsername === blog.user.username) // username is unique, see model
          ? <div>
            <button onClick={() => { deleteBlog(blog.id) }}>remove</button>
          </div>
          : null
        }
      </div>
    )
  }
  return (
    <div className='blogNoDetails'>
      {blog.title} {blog.author}
      <button onClick={toggleShowDetails}>view</button>
    </div>
  )
}

export default Blog