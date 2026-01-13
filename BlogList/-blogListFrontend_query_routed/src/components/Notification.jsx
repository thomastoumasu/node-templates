import { useContext } from 'react'
import NotificationContext from '../contexts/NotificationContext'

const Notification = () => {
  const notificationStyle = {
    color: 'green',
    background: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  }

  const [notification, useNotification] = useContext(NotificationContext)

  if (notification.message === null) {
    return null
  }
  else {
    notificationStyle.color = notification.isAlert ? 'red' : 'green'
    return (
      <div style={notificationStyle}>
        <p> {notification.message} </p>
      </div>
    )
  }
}

export default Notification
