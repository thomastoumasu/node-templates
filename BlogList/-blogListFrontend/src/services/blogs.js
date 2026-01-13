import axios from 'axios'
import logger from '../utils/logger'
const baseUrl = 'http://localhost:3003/api/blogs' // can be served by npm run server (json-server) or blogListBackend (mongodb)

let token = null

const setToken = newToken => {
  token = `Bearer ${newToken}`
}

const getAll = async () => {
  const response = await axios
    .get(baseUrl)
  logger.info('--blogService: got blogs:', response.data)
  return response.data
}

const create = async newObject => {
  const config = {
    headers: { Authorization: token }
  }
  const response = await axios.post(baseUrl, newObject, config)
  return response.data
}

const update = async (id, newObject) => {
  const config = {
    headers: { Authorization: token }
  }
  logger.info('--blogService: putting this to:', newObject, `${baseUrl}/${id}`)
  const response = await axios.put(`${baseUrl}/${id}`, newObject, config)
  logger.info('--blogService: got this response:', response.data)
  return response.data
}

const deleteOne = async id => {
  const config = {
    headers: { Authorization: token }
  }
  // logger.info('--blogService: delete request sent to:', `${baseUrl}/${id}`)
  const response = await axios.delete(`${baseUrl}/${id}`, config)
  // logger.info('--blogService: delete was successful if this is 204:', response.status)
  return response.status
}

export default {
  getAll, setToken, create, update, deleteOne
}
