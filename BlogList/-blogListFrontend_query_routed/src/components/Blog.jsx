import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'
import { deleteBlog, upvoteBlog, commentBlog } from '../queries'
import LoginContext from '../contexts/LoginContext'
import { useNotify } from '../contexts/NotificationContext'
import logger from '../utils/logger'
import CommentForm from './CommentForm'

const Blog = ({ blog }) => {
  const blogWithDetailsStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
  }

  const notify = useNotify()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [loggedInUser, dispatchLoggedInUser] = useContext(LoginContext)
  const loggedInUsername = loggedInUser ? loggedInUser.username : null

  const likeBlog = async () => {
    likeBlogMutation.mutate(blog)
  }

  const likeBlogMutation = useMutation({
    mutationFn: upvoteBlog,
    onSuccess: upvotedBlog => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      notify(`blog: ${upvotedBlog.title} has been liked`, false, 2000)
    },
    onError: error => {
      // logger.error('--Blog: likeBlogMutation onError', error.message, error.response)
      notify(error.response.statusText, true, 5000)
    },
  })

  const removeBlog = async () => {
    if (window.confirm(`Delete ${blog.title} ?`)) {
      deleteBlogMutation.mutate(blog.id)
    } else {
      // do nothing if user cancels
    }
  }

  const deleteBlogMutation = useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      navigate('/blogs')
      notify(`blog: ${blog.title} has been deleted`, false, 2000)
    },
    onError: error => {
      // logger.error('--Blog: deleteBlogMutation onError', error.message, error.response)
      notify(error.response.data.error, true, 5000)
    },
  })

  const handleComment = async content => {
    const id = blog.id
    commentBlogMutation.mutate({ id, content }) // mutationFn can take only one argument
  }

  const commentBlogMutation = useMutation({
    mutationFn: commentBlog,
    onSuccess: commentedBlog => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      notify(`blog: ${commentedBlog.title} has been commented`, false, 2000)
    },
    onError: error => {
      // logger.error('--Blog: commentBlogMutation onError', error.message, error.response)
      notify(error.response.statusText, true, 5000)
    },
  })

  if (!blog) {
    return null
  }

  return (
    <div className="blogWithDetails" style={blogWithDetailsStyle}>
      <h2>
        {blog.title} {blog.author}
      </h2>
      <div>{blog.url}</div>
      <div>
        likes {blog.likes}
        <button onClick={() => likeBlog()}>like</button>
      </div>
      <div>added by {blog.user.name}</div>
      {loggedInUsername === blog.user.username ? ( // username is unique, see model
        <div>
          <button onClick={() => removeBlog()}>remove</button>
        </div>
      ) : null}
      {blog.comments ? (
        <div>
          <br></br>
          <strong> comments </strong>
          <ul>
            {blog.comments.map(comment => (
              <li key={comment.id}>{comment.content}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {loggedInUsername ? (
        <div>
          <CommentForm handleComment={handleComment} />
        </div>
      ) : null}
    </div>
  )
}

export default Blog
