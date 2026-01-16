import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAnecdotes, upvoteAnecdote } from './requests'
import { notify, useNotificationDispatch } from "./NotificationContext";
import AnecdoteForm from './components/AnecdoteForm'
import Notification from './components/Notification'

const App = () => {
  const dispatch = useNotificationDispatch()

  const queryClient = useQueryClient()
  
  const upvoteAnecdoteMutation = useMutation({
    mutationFn: upvoteAnecdote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anecdotes"] });
    },
    onError: (error) => {
      console.log("onError", error.message, error.response)
      notify(dispatch, error.response ? error.response.data.error : error.message);
    },
  });

  const result = useQuery({
    queryKey: ['anecdotes'],
    queryFn: getAnecdotes,
    retry: 1
  })

  if (result.isPending) {
    return <div>Loading...</div>
  }

  if (result.isError) {
    return <div>anecdote service not available due to problems in server</div>
  }

  const anecdotes = result.data

  const handleVote = (anecdote) => {
    upvoteAnecdoteMutation.mutate({ ...anecdote, votes: anecdote.votes + 1 })
  }

  return (
    <div>
      <h3>Anecdote app</h3>

      <Notification />
      <AnecdoteForm />

      {anecdotes.map(anecdote =>
        <div key={anecdote.id}>
          <div>
            {anecdote.content}
          </div>
          <div>
            has {anecdote.votes}
            <button onClick={() => handleVote(anecdote)}>vote</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
