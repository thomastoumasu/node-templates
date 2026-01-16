import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import { upvoteAnecdote } from '../reducers/anecdoteReducer'
import { notify } from '../reducers/notificationReducer'

const Anecdote = ({ anecdoteObject, clickHandler }) => {
  return (
    <div>
      {anecdoteObject.anecdote}
      <div> has {anecdoteObject.votes}  <button onClick={clickHandler}>vote</button></div >
    </div >
  )
}

const AnecdoteList = () => {
  const dispatch = useDispatch()

  const anecdoteObjects = useSelector( ({ anecdoteObjects, filter }) => {
    return anecdoteObjects.filter(anecdoteObject => 
        anecdoteObject.anecdote.toLowerCase().includes(filter.toLowerCase())
    )
  }, shallowEqual) // to remove warning 'Selector unknown returned a different result when called with the same parameters.'

  const voteForAnecdote = async (anecdoteObject) => {
    dispatch(upvoteAnecdote(anecdoteObject))
    dispatch(notify(`The anecdote: \'${anecdoteObject.anecdote}\' has been upvoted`, false, 2000))
  }

  return (
    <div>
      {anecdoteObjects
        .sort((a, b) => b.votes - a.votes)
        .map(object =>
          <Anecdote key={object.id} anecdoteObject={object} clickHandler={() => voteForAnecdote(object)} /> 
        )}
    </div>
  )
}

export default AnecdoteList