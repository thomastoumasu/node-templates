import axios from 'axios'
const baseUrl = 'http://localhost:3001/anecdotes'

const getAll = async () => {
  const response = await axios.get(baseUrl)
  // console.log('--anecdoteService.js: got anecdotes: ', response.data)
  return response.data
}

const createOne = async (anecdote) => {
  const anecdoteObject = {
    anecdote,
    votes: 0,
    // id: generateId() // json-server generates id automatically
  }
  const response = await axios.post(baseUrl, anecdoteObject)
  // console.log('--anecdoteService.js: posted new anecdote and received this response: ', response.data)
  return response.data
}

const updateOne = async (anecdoteObjectToUpdate) => {
  const url = baseUrl + `/${anecdoteObjectToUpdate.id}`
  // console.log('--anecdoteService: putting this there', anecdoteObjectToUpdate, url)
  const response = await axios.put(url, anecdoteObjectToUpdate)
  const updatedObject = response.data
  // console.log('--anecdoteService: response is ', updatedObject)
  return updatedObject
}

export default { getAll, createOne, updateOne }