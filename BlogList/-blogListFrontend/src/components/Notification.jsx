const Notification = ({ notification }) => {
  const notificationStyle = {
    color: 'green',
    background: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  }
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
