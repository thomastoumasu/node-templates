import { useEffect, useState, useRef } from 'react'
import './App.css'
import blogService from './services/blogs'
import loginService from './services/login'
import logger from './utils/logger'
import Notification from './components/Notification'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'

const App = () => {
  const [blogs, setBlogs] = useState(null)
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [notification, setNotification] = useState({ message: null, isAlert: false })

  const notify = (message, isAlert) => {
    setNotification({ message: message, isAlert: isAlert }) // this will trigger rendering of Notification()
    setTimeout(() => {
      setNotification({ message: null, isAlert: false })
    }, 2000)
  }

  useEffect(() => {
    blogService
      .getAll()
      .then(initialBlogs => {
        logger.info('-app: initialBlogs: ', initialBlogs)
        setBlogs(initialBlogs)
      })
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    console.log('--app: effect, loggedUserJSON: ', loggedUserJSON)
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(JSON.parse(loggedUserJSON))
      console.log('--app: effect, user: ', user)
      blogService.setToken(user.token)
    }
  }, [])

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        <label>
          username
          <input
            type="text"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          password
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </label>
      </div>
      <button type="submit">login</button>
    </form>
  )

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username, password
      })
      window.localStorage.setItem('loggedNoteappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      console.log('--App: logged in user: ', user)
    } catch (exception) {
      console.log('--App: exception: ', exception)
      notify('Wrong credentials', true)
    }
  }

  const logOut = () => {
    window.localStorage.clear()
    setUser(null)
  }

  const addBlog = (newBlog) => {
    blogFormRef.current.toggleVisibility()
    blogService
      .create(newBlog)
      .then(returnedBlog => {
        setBlogs(blogs.concat(returnedBlog))
        notify(`new blog: ${returnedBlog.title} has been added`, false)
      })
      .catch(error => {
        logger.info(error)
        notify(error.response.statusText, true)
      })
  }

  const likeBlog = id => {
    const blog = blogs.find(blog => blog.id === id)
    const blogToUpdate = { ...blog, likes: blog.likes + 1 }
    blogService
      .update(id, blogToUpdate)
      .then(updatedBlog => {
        setBlogs(blogs.map(blog => blog.id !== id ? blog : updatedBlog))
        notify(`blog: ${updatedBlog.title} has been liked`, false)
      })
      .catch(error => {
        logger.info(error)
        notify(error.response.statusText, true)
      })
  }

  const deleteBlog = id => {
    const blogToDelete = blogs.find(blog => blog.id === id)
    if (window.confirm(`Delete ${blogToDelete.title} ?`)) {
      blogService
        .deleteOne(id)
        .then( () => {
          setBlogs(blogs.filter(blog => blog.id !== id))
          notify(`blog: ${blogToDelete.title} has been deleted`, false)
        })
        .catch(error => {
          logger.error(error)
          notify(error.response.data.error, true)
        })
    } else { // do nothing if user cancels
    }
  }

  const blogFormRef = useRef() // to access internal method of Togglable

  const createBlogForm = () => {
    return (
      <Togglable buttonLabel='create new blog' ref={blogFormRef}>
        <BlogForm createBlog={addBlog}/>
      </Togglable>
    )
  }

  if (!user) {
    return (
      <>
        <Notification notification={notification} />
        <h2>log in to application</h2>
        {loginForm()}
      </>
    )
  }
  return (
    <>
      <Notification notification={notification} />
      {blogs
        ? <div>
          <h2>blogs</h2>
          <p>
            {user.name} logged in
            <button onClick={logOut}>
              log out
            </button>
          </p>
          {createBlogForm()}
          {blogs.sort((a, b) => b.likes - a.likes).map(b =>
            <Blog key={b.id} blog={b} likeBlog={likeBlog} deleteBlog={deleteBlog} loggedInUsername={user.username}/>
          )}
        </div>
        : null
      }
    </>
  )
}

export default App
