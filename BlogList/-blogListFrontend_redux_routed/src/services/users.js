import axios from 'axios'
import logger from '../utils/logger'
const baseUrl = 'http://localhost:3003/api/users' 

const getAll = async () => {
  const response = await axios.get(baseUrl)
  // logger.info('--userService: getAll got this reponse data:', response.data)
  return response.data
}

export default {
  getAll
}
