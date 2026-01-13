import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { upvoteBlog, removeBlog, commentBlog } from '../reducers/blogReducer'
import { notify } from '../reducers/notificationReducer'
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

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const loggedInUser = useSelector(state => state.loggedInUser)
  const loggedInUsername = loggedInUser ? loggedInUser.username : null

  const likeBlog = async () => {
    try {
      await dispatch(upvoteBlog(blog))
      // logger.info('--App: likeBlog was successful')
      dispatch(notify(`blog: ${blog.title} has been liked`, false, 2000))
    } catch (error) {
      // logger.error('--App: likeBlog not successful, error: ', error)
      dispatch(notify(error.response.statusText, true, 5000))
    }
  }

  const deleteBlog = async () => {
    if (window.confirm(`Delete ${blog.title} ?`)) {
      try {
        await dispatch(removeBlog(blog))
        navigate('/blogs')
        // logger.info('--App: deleteBlog was successful')
        dispatch(notify(`blog: ${blog.title} has been deleted`, false, 2000))
      } catch (error) {
        // logger.error('--App: deleteBlog not successful, error: ', error)
        dispatch(notify(error.response.data.error, true, 5000))
      }
    } else {
      // do nothing if user cancels
    }
  }

  const handleComment = async (content) => {
    await dispatch(commentBlog(blog, content))
    // logger.info('--Blog: blog was commented')
  }

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
          <button onClick={() => deleteBlog()}>remove</button>
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
