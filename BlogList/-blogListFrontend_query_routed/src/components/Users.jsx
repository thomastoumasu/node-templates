import { Link } from 'react-router-dom'
import logger from '../utils/logger'

const Users = ({ users }) => {
  
  if (!users) {
    return null
  }

  return (
    <>
      <h2> Users </h2>
      {users.map(user => (
        <p key={user.id}>
          <Link to={`/users/${user.id}`}>
            {user.name} {user.blogs.length}
          </Link>
        </p>
      ))}
    </>
  )
}

export default Users
