import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  message: null,
  isAlert: false
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotification(state, action) {
      // console.log('--notificationReducer: set')
      return action.payload
    },
    resetNotification(state, action) {
      // console.log('--notificationReducer: reset')
      return initialState
    }
  }
})

export const { setNotification, resetNotification } = notificationSlice.actions

export const notify = (message, isAlert, time) => async dispatch => {
  dispatch(setNotification({ message, isAlert }))
  setTimeout(() => {
      dispatch(resetNotification())
    }, time)
}

export default notificationSlice.reducer