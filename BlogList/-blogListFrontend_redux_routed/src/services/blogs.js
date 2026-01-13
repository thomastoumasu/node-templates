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
  // logger.info('--blogService: getAll got this reponse data:', response.data)
  return response.data
}

const createOne = async newObject => {
  const config = {
    headers: { Authorization: token },
  }
  const response = await axios.post(baseUrl, newObject, config)
  logger.info('--blogService: createOne got this reponse:', response)
  return response.data
}

const updateOne = async (newObject) => {
  const config = {
    headers: { Authorization: token }
  }
  const url = `${baseUrl}/${newObject.id}`
  logger.info('--blogService: putting this to:', newObject, url)
  const response = await axios.put(url, newObject, config)
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

const commentOne = async (id, content) => {
  const config = {
    headers: { Authorization: token },
  }
  const url = `${baseUrl}/${id}/comments`
  const commentObject = { content }
  logger.info('--blogService: posting this to:', commentObject, url)
  const response = await axios.post(url, commentObject, config)
  return response.data
}

export default {
  getAll, setToken, createOne, updateOne, deleteOne, commentOne
}
