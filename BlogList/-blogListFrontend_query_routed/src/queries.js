import axios from 'axios'
import storageService from './services/storage'
import logger from './utils/logger'

const usersBaseUrl = 'http://localhost:3003/api/users'
const blogsBaseUrl = 'http://localhost:3003/api/blogs'

const getToken = () => {
  const validToken = storageService.loadUser().token
  return validToken ? `Bearer ${validToken}` : null
}

const getAuthorizationHeader = () => {
  const config = {
    headers: { Authorization: getToken() },
  }
  return config 
}

export const getUsers = () => axios.get(usersBaseUrl).then(response => response.data)

export const getBlogs = () => axios.get(blogsBaseUrl).then(response => response.data)

export const createBlog = async blogToCreate => {
  const config = getAuthorizationHeader()
  const response = await axios.post(blogsBaseUrl, blogToCreate, config)
  return response.data
}

export const deleteBlog = async id => {
  const config = getAuthorizationHeader()
  logger.info('--queries: delete request sent to:', `${blogsBaseUrl}/${id}`)
  const response = await axios.delete(`${blogsBaseUrl}/${id}`, config)
  logger.info('--queries: delete was successful if this is 204:', response.status)
  return response.status
}

export const upvoteBlog = async blogToUpvote => {
  const upvotedBlog = { ...blogToUpvote, likes: blogToUpvote.likes + 1 }
  const config = getAuthorizationHeader()
  const url = `${blogsBaseUrl}/${upvotedBlog.id}`
  logger.info('--queries: putting this to:', upvotedBlog, url)
  const response = await axios.put(url, upvotedBlog, config)
  logger.info('--queries: got this response after putting:', response.data)
  return response.data
}

export const commentBlog = async ({ id, content }) => {
  const config = getAuthorizationHeader()
  const url = `${blogsBaseUrl}/${id}/comments`
  const commentObject = { content }
  logger.info('--queries: posting this to:', commentObject, url)
  const response = await axios.post(url, commentObject, config)
  logger.info('--queries: got this response after posting:', response.data)
  return response.data
}