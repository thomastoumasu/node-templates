import { useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { notify } from '../reducers/notificationReducer'
import { createBlog } from '../reducers/blogReducer'
import logger from '../utils/logger'
import BlogForm from './BlogForm'
import Togglable from './Togglable'

const Blogs = () => {
  const dispatch = useDispatch()

  const loggedInUser = useSelector(state => state.loggedInUser)
  const blogs = useSelector(state => state.blogs)

  const blogFormRef = useRef() // to access internal method of Togglable

  const createBlogForm = () => {
    if (!loggedInUser) {
      return null
    }

    return (
      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm createBlog={addBlog} />
      </Togglable>
    )
  }

  const addBlog = async newBlog => {
    blogFormRef.current.toggleVisibility()
    try {
      await dispatch(createBlog(newBlog))
      // logger.info('--App: addBlog was successful')
      dispatch(notify(`new blog: ${newBlog.title} has been added`, false, 2000))
    } catch (error) {
      logger.error('--App: addBlog not successful, error.response: ', error.response) //.data.error
      dispatch(notify(error.response.data.error, true, 5000))
    }
  }

  return (
    <>
      {blogs
        ? [...blogs]
            .sort((a, b) => b.likes - a.likes)
            .map(blog => (
              <p key={blog.id} className="blogWithoutDetails">
                <Link to={`/blogs/${blog.id}`}>
                  {blog.title} {blog.author}
                </Link>
              </p>
            ))
        : null}
      {createBlogForm()}
    </>
  )
}

export default Blogs
