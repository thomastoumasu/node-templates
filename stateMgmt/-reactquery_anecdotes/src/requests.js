import axios from 'axios'

const baseUrl = 'http://localhost:3001/anecdotes/'

export const getAnecdotes = () => 
  axios.get(baseUrl).then(response => response.data)

export const createAnecdote = newObject => 
  axios
    .post(baseUrl, newObject)
    .then(response => response.data)
    // .catch(error => console.log(error)) // caught in useMutation({ onError: })

export const upvoteAnecdote = (object) =>
  axios
    .put(`${baseUrl}${object.id}`, object)
    .then((response) => response.data)
    // .catch((error) => console.log(error.message)) // caught in useMutation({ onError: })
