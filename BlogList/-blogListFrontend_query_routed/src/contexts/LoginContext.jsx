import { createContext, useReducer, useContext } from 'react'
import loginService from '../services/login'
import logger from '../utils/logger'

const loginReducer = (state, action) => {
  switch (action.type) {
    case 'SET':
      return action.payload
    case 'RESET':
      return null
    default:
      return state
  }
}

const LoginContext = createContext()

export default LoginContext

export const LoginContextProvider = (props) => {
  const [loggedInUser, useLoggedInUser] = useReducer(loginReducer, null)
  return <LoginContext.Provider value={[loggedInUser, useLoggedInUser]}>{props.children}</LoginContext.Provider>
}

export const useLogin = () => {
  const valueAndDispatch = useContext(LoginContext)
  const dispatch = valueAndDispatch[1]
  return async (username, password) => {
    const user = await loginService.login({ username, password })
    // logger.info('-LoginContext: logIn has received this user', user)
    dispatch({
      type: 'SET',
      payload: user,
    })
    return user
  }
}