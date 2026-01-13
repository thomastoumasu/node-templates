import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { notify } from '../reducers/notificationReducer'
import logger from '../utils/logger'

const LoginForm = ({ handleLogin }) => {
  const dispatch = useDispatch()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = async (event) => {
    event.preventDefault()
    try {
      await handleLogin(username, password)
      setUsername('')
      setPassword('')
    } catch (exception) {
      logger.error('--LoginForm: onSubmit not successful, exception: ', exception)
      dispatch(notify('Wrong credentials', true, 5000))
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label>
          username
          <input type="text" value={username} onChange={({ target }) => setUsername(target.value)} />
        </label>
      </div>
      <div>
        <label>
          password
          <input type="password" value={password} onChange={({ target }) => setPassword(target.value)} />
        </label>
      </div>
      <button type="submit">login</button>
    </form>
  )
}

export default LoginForm
