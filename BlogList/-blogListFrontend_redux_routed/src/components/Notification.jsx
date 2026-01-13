import { useSelector } from 'react-redux'

const Notification = () => {
  const notificationStyle = {
    color: 'green',
    background: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  }

  const notification = useSelector(state => state.notification)

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
