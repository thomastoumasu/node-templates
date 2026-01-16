import { useDispatch } from 'react-redux'
import { createAnecdote } from '../reducers/anecdoteReducer'
import { notify } from '../reducers/notificationReducer'

const AnecdoteForm = () => {
  const dispatch = useDispatch()

  const CreateNewAnecdote = async (event) => {
    event.preventDefault()
    const anecdoteToCreate = event.target.anecdote.value
    event.target.anecdote.value = ''
    dispatch(createAnecdote(anecdoteToCreate))
    dispatch(notify(`A new anecdote: \'${anecdoteToCreate}\' was created`, false, 2000))
  } 

  return(
    <>
      <h2>create anecdote</h2>
      <form onSubmit={CreateNewAnecdote}>
        <input name='anecdote' />
        <button  type='submit'>create</button>
      </form>
    </>
  )
}

export default AnecdoteForm