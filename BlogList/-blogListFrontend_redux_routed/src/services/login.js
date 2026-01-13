import axios from 'axios'
const baseUrl = 'http://localhost:3003/api/login' // served by blogListBackend (mongodb)

const login = async credentials => {
  // console.log('--loginRouter: credentials: ', credentials)
  const response = await axios.post(baseUrl, credentials)
  return response.data
}

export default {
  login
}