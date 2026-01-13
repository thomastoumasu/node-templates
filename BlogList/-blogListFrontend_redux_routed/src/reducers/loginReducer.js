import { createSlice } from '@reduxjs/toolkit'
// import { createSlice, current } from '@reduxjs/toolkit' // for lint
import blogService from '../services/blogs'
import loginService from '../services/login'
import logger from '../utils/logger'

const loginSlice = createSlice({
  name: 'loggedInUser',
  initialState: null,
  reducers: {
    set(state, action) {
      return action.payload
    }
  }
})

export default loginSlice.reducer
export const { set } = loginSlice.actions

export const setUser = user => dispatch => {
  // logger.info('-loginReducer: setUser has received this user:', user)
  dispatch(set(user))
  blogService.setToken(user.token)
}

export const logOutUser = () => dispatch => {
  dispatch(set(null))
}

export const logIn = (username, password) => async dispatch => {
  const user = await loginService.login({ username, password })
  // logger.info('-loginReducer: logIn has received this user', user)
  dispatch(set(user))
  blogService.setToken(user.token)
  // logger.info('-loginReducer: logIn exits')
  return user
}