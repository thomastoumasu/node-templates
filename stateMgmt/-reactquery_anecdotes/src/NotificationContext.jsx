import { createContext, useReducer, useContext } from 'react'

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET': 
      return action.payload
    case 'RESET':
      return null
    default:
      return state
  }
}

const NotificationContext = createContext()

export default NotificationContext

export const NotificationContextProvider = (props) => {
  const [notification, useNotification] = useReducer(notificationReducer, null)
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

export const notify = (dispatch, message) => {
  dispatch({
    type: "SET",
    payload: message,
  });
  setTimeout(() => {
    dispatch({ type: "RESET" });
  }, 2000);
}