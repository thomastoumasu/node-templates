// in terminal: printf '\33c\e[3J'; node useful.js or command-K
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//--sort
.sort((a, b) => b.votes - a.votes)
[...anecdotes].sort((a, b) => b.votes - a.votes)  // if the original array is immutable: make a copy of it
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// confirm
if (window.confirm(`Update ${nameBuffer}'s number ?`)) {
}
else { // do nothing  if user cancels
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//--button
<button onClick={onClick}>text</button>
const onClick = () => setValue(value + 1)
const [value, setValue] = useState('')
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//--Radio buttons
<div>
  all <input type="radio" name="filter" onChange={() => filterSelected('ALL')} />
  important <input type="radio" name="filter" onChange={() => filterSelected('IMPORTANT')} />
  nonimportant <input type="radio" name="filter" onChange={() => filterSelected('NONIMPORTANT')} />
</div>
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//--not controlled form
<form onSubmit={addNote}>
  <input name="note" />
  <button type="submit">add</button>
</form>
with
import { useDispatch } from 'react-redux'
import { createNote } from '../reducers/noteReducer'
const dispatch = useDispatch()
const addNote = (event) => {
  event.preventDefault()
  const content = event.target.note.value
  event.target.note.value = ''
  dispatch(createNote(content))
}
and in reducers/noteReducer.js
export const createNote = content => {
  return ({
    type: 'NEW_NOTE',
    payload: {
      content: content,
      important: false,
      id: generateId()
    }
  })
}

