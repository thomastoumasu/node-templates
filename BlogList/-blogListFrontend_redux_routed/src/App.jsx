import { useEffect } from 'react'
// import './App.css'
import { useSelector, useDispatch } from 'react-redux'
import { Routes, Route, Link, useNavigate, useMatch } from 'react-router-dom'
import { setUser, logOutUser, logIn } from './reducers/loginReducer'
import { initializeBlogs } from './reducers/blogReducer'
import { initializeUsers } from './reducers/userReducer'
import logger from './utils/logger'
import Notification from './components/NotificationMui'
import LoginForm from './components/LoginForm'
import Blogs from './components/Blogs'
import Blog from './components/Blog'
import Users from './components/Users'
import User from './components/User'

const Home = () => {
  return <>Home</>
}

const Menu = () => {
  const padding = {
    paddingRight: 5,
  }

  const dispatch = useDispatch()
  const loggedInUser = useSelector(state => state.loggedInUser)
  const navigate = useNavigate()

  const logOut = () => {
    window.localStorage.clear()
    dispatch(logOutUser())
    // logger.info('--App: logged user out ')
    navigate('/login')
  }

  return (
    <div>
      <Link style={padding} to="/">
        home
      </Link>
      <Link style={padding} to="/blogs">
        blogs
      </Link>
      {loggedInUser ? (
        <>
          <Link style={padding} to="/users">
            users
          </Link>
          <em>{loggedInUser.username} logged in</em>
          <button onClick={logOut}>log out</button>
        </>
      ) : (
        <Link style={padding} to="/login">
          login
        </Link>
      )}
    </div>
  )
}

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogin = async (username, password) => {
    const user = await dispatch(logIn(username, password)) // exception will be caught in CreateForm component
    window.localStorage.setItem('loggedBlogListUser', JSON.stringify(user))
    // logger.info('--App: handleLogin successful, logged-in user: ', user)
    navigate('/blogs')
  }

  return (
    <>
      <h2>log in to application</h2>
      <LoginForm handleLogin={handleLogin} />
    </>
  )
}

const App = () => {
  const dispatch = useDispatch()

  const blogs = useSelector(state => state.blogs)
  const users = useSelector(state => state.users)

  useEffect(() => {
    // logger.info('--App: enter effect to log in user stored in local storage')
    const userStoredInLocalStorageJSON = window.localStorage.getItem('loggedBlogListUser')
    // logger.info('--App: effect to log in user stored in local storage, userStoredInLocalStorageJSON: ', userStoredInLocalStorageJSON)
    if (userStoredInLocalStorageJSON) {
      const user = JSON.parse(userStoredInLocalStorageJSON)
      dispatch(setUser(user))
      // logger.info('--App: effect to log in user stored in local storage, user: ', user)
    }
  }, [dispatch])

  useEffect(() => {
    // logger.info('--App: enter effect to get blogs')
    dispatch(initializeBlogs()) // more elegant than to have some server code (i.e. blogService.getAll()) here
  }, [dispatch]) // to avoid eslint warning

  useEffect(() => {
    // logger.info('--Users: enter effect to get users')
    dispatch(initializeUsers())
  }, [dispatch]) // to avoid eslint warning

  const userById = id => {
    // console.log('--App: useMatch returned this user id: ', id)
    const user = users.find(u => u.id === id)
    // console.log('--App: userById found this user: ', user)
    return user
  }

  const matchUser = useMatch('/users/:id')
  const user = matchUser ? userById(matchUser.params.id) : null

  const blogById = id => {
    console.log('blogById was called')
    const blog = blogs.find(b => b.id === id)
    return blog
  }

  const matchBlog = useMatch('/blogs/:id')
  const blog = matchBlog ? blogById(matchBlog.params.id) : null

  return (
    <>
      <em>Blogs App</em>
      <Menu />
      <Notification />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:id" element={<Blog blog={blog} />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<User user={user} />} />
      </Routes>
    </>
  )
}

export default App
