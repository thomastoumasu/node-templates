import { createSlice } from '@reduxjs/toolkit'
// import { createSlice, current } from '@reduxjs/toolkit' // for lint
import userService from '../services/users'
import logger from '../utils/logger'

const initialState = []

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    set(state, action) {
      return action.payload
    },
  },
})

export const { set } = userSlice.actions

export const initializeUsers = () => {
  // logger.info('--userReducer: initializeUsers has been called')
  return async (dispatch) => {
    const startUsers = await userService.getAll()
    // logger.info('--userReducer: got those startUsers, and dispatching them: ', startUsers)
    dispatch(set(startUsers))
  }
}

export default userSlice.reducer
