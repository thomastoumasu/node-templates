import { useRef, useContext } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createBlog } from '../queries'
import LoginContext from '../contexts/LoginContext'
import { useNotify } from '../contexts/NotificationContext'
import logger from '../utils/logger'
import BlogForm from './BlogForm'
import Togglable from './Togglable'

const Blogs = ({ blogs }) => {
  const notify = useNotify()
  const queryClient = useQueryClient()

  const [loggedInUser, dispatchLoggedInUser] = useContext(LoginContext)

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
    newBlogMutation.mutate(newBlog)
  }

  const newBlogMutation = useMutation({
    mutationFn: createBlog,
    onSuccess: (createdBlog) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      notify(`new blog: ${createdBlog.title} has been added`, false, 2000)
    },
    onError: error => {
      // console.log("onError", error.message, error.response)
      notify(error.response.data.error, true, 5000)
    },
  })

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
