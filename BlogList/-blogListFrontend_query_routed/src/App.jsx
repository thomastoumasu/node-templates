import { Routes, Route, Link, useNavigate, useMatch } from 'react-router-dom'
import { useEffect, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUsers, getBlogs } from './queries'
import LoginContext from './contexts/LoginContext'
import { useLogin } from './contexts/LoginContext'
import { useNotify } from './contexts/NotificationContext'
import storageService from './services/storage'
import logger from './utils/logger'
// import './App.css'
import Notification from './components/Notification'
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

  const [loggedInUser, dispatchLoggedInUser] = useContext(LoginContext)

  const navigate = useNavigate()

  const logOut = () => {
    storageService.eraseUser()
    dispatchLoggedInUser({ type: 'RESET' })
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
  const navigate = useNavigate()
  const loginWith = useLogin()

  const handleLogin = async (username, password) => {
    const user = await loginWith(username, password)
    storageService.saveUser(user)
    logger.info('--App: handleLogin successful, logged-in user: ', user)
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
  const [loggedInUser, dispatchLoggedInUser] = useContext(LoginContext)
  const notify = useNotify()

  useEffect(() => {
    // logger.info('--App: enter effect to log in user stored in local storage')
    const userStoredInLocalStorage = storageService.loadUser()
    logger.info('--App: effect to log in user stored in local storage, userStoredInLocalStorage: ', userStoredInLocalStorage)
    if (userStoredInLocalStorage) {
      dispatchLoggedInUser({
        type: 'SET',
        payload: userStoredInLocalStorage,
      })
    }
  }, [dispatchLoggedInUser])

  const usersQueryResult = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    retry: 1,
  })
  // console.log(JSON.parse(JSON.stringify(usersQueryResult)))

  if (usersQueryResult.isError) {
    notify('users service not available due to problems in server', true, 5000)
  }

  const users = usersQueryResult.data

  const blogsQueryResult = useQuery({
    queryKey: ['blogs'],
    queryFn: getBlogs,
    retry: 1,
  })
  // console.log(JSON.parse(JSON.stringify(blogsQueryResult)))

  if (blogsQueryResult.isError) {
    notify('blogs service not available due to problems in server', true, 5000)
  }

  const blogs = blogsQueryResult.data

  const userById = id => {
    if (!users) {
      return null
    }
    // console.log('--App: useMatch returned this user id: ', id)
    const user = users.find(u => u.id === id)
    // console.log('--App: userById found this user: ', user)
    return user
  }

  const matchUser = useMatch('/users/:id')
  const user = matchUser ? userById(matchUser.params.id) : null

  const blogById = id => {
    if (!blogs) {
      return null
    }
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
        <Route path="/blogs" element={<Blogs blogs={blogs}/>} />
        <Route path="/blogs/:id" element={<Blog blog={blog} />} />
        <Route path="/users" element={<Users users={users}/>} />
        <Route path="/users/:id" element={<User user={user} />} />
      </Routes>
    </>
  )
}

export default App
