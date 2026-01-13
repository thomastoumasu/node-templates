import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  message: null,
  isAlert: false,
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotification(state, action) {
      return action.payload
    },
    resetNotification() {
      return initialState
    },
  },
})

export default notificationSlice.reducer
export const { setNotification, resetNotification } = notificationSlice.actions

export const notify = (message, isAlert, time) => async (dispatch) => {
  dispatch(setNotification({ message, isAlert }))
  setTimeout(() => {
    dispatch(resetNotification())
  }, time)
}