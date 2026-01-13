import { createContext, useReducer, useContext } from 'react'

const initialState = { message: null, isAlert: false }

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET': 
      return action.payload
    case 'RESET':
      return initialState
    default:
      return state
  }
}

const NotificationContext = createContext()

export default NotificationContext

export const NotificationContextProvider = (props) => {
  const [notification, useNotification] = useReducer(notificationReducer, initialState)
  return (
    <NotificationContext.Provider value={ [notification, useNotification] } >
      {props.children}
    </NotificationContext.Provider>
  )
}

export const useNotificationValue = () => {
  const notificationAndDispatch = useContext(NotificationContext)
  return notificationAndDispatch[0]
}

export const useNotificationDispatch = () => {
  const notificationAndDispatch = useContext(NotificationContext)
  return notificationAndDispatch[1]
}

export const useNotify = () => {
  const notificationAndDispatch = useContext(NotificationContext)
  const dispatch = notificationAndDispatch[1]
  return (message, isAlert, time) => {
    dispatch({
      type: "SET",
      payload: { message, isAlert },
    })
    setTimeout(() => {
      dispatch({ type: "RESET" })
    }, time)
  }
}