import { useSelector } from 'react-redux'
import Alert from '@mui/material/Alert'

const Notification = () => {

  const notification = useSelector(state => state.notification)

  if (notification.message === null) {
    return null
  } else {
    return (
      <Alert variant="outlined" severity={notification.isAlert ? 'warning' : 'success'} style={{marginTop: 10}}>
        {notification.message}
      </Alert>
    )
  }
}

export default Notification
