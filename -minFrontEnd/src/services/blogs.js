import axios from 'axios'
import logger from '../utils/logger'
const baseUrl = 'http://localhost:3003/api/blogs' // can be served by npm run server (json-server) or blogListBackend (mongodb)

const getAll = async () => {
  const response = await axios
    .get(baseUrl)
  logger.info('--blogService: got blogs:', response.data)
  return response.data
}

export default {
  getAll
} 
