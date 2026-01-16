import { createSlice, current } from '@reduxjs/toolkit'
import anecdoteService from '../services/anecdoteService'

const initialState = []

// version with @reduxjs/toolkit
const anecdoteSlice = createSlice({
  name: 'anecdoteObjects',
  initialState,
  reducers: {
    update(state, action) {
      const updatedObject = action.payload
      return state.map(o => o.id !== updatedObject.id ? o : updatedObject)
    },
    add(state, action) {
      // console.log('--anecdoteReducer: state before adding is ', current(state))
      state.push(action.payload)
      // console.log('--anecdoteReducer: state after adding is ', current(state))
    },
    set(state, action) {
      return action.payload
    }
  }
})

export const { update, set, add } = anecdoteSlice.actions

// asynchronous actions (better to have the function here separated from the frontend component)
export const initializeAnecdotes = () => { 
  return async dispatch => {
    const startAnecdotes = await anecdoteService.getAll()
    dispatch(set(startAnecdotes))
  }
}

export const createAnecdote = (anecdoteToCreate) => {
  return async dispatch => {
    // console.log('--anecdoteReducer: anecdoteToCreate is ', anecdoteToCreate)
    const createdAnecdoteObject = await anecdoteService.createOne(anecdoteToCreate)
    // console.log('--anecdoteReducer: createdAnecdoteObject is ', createdAnecdoteObject)
    dispatch(add(createdAnecdoteObject))
  }
}

export const upvoteAnecdote = (anecdoteObjectToUpvote) => {
  const upvotedAnecdoteObject = { ...anecdoteObjectToUpvote, votes: anecdoteObjectToUpvote.votes + 1 }
  return async dispatch => {
    const updatedAnecdoteObject = await anecdoteService.updateOne(upvotedAnecdoteObject)
    dispatch(update(updatedAnecdoteObject))
  }
}

export default anecdoteSlice.reducer

// // version without @reduxjs/toolkit and without "set" action
// const generateId = () => Number((Math.random() * 1000000).toFixed(0))
//
// export const vote = id => {
//   return (
//     { type: 'VOTE', payload: { id } }
//   )
// }

// export const reset = () => {
//   return (
//     { type: 'RESET' }
//   )
// }

// export const add = anecdote => {
//   const newobject = {
//     anecdote: anecdote,
//     votes: 0,
//     id: generateId()
//   }
//   return (
//     { type: 'ADD', payload: newobject }
//   )
// }

// const anecdoteReducer = (state = initialState, action) => {
//   if (state === null) { 
//     console.log('-anecdoteReducer: state was null')
//     state = initialState
//   }
//   console.log('-anecdoteReducer: action is ', action)
//   switch (action ? action.type : null) {
//     case 'VOTE':
//       const id = action.payload.id
//       const objectToUpdate = state.find(object => object.id === id)
//       const updatedObject = { ...objectToUpdate, votes: objectToUpdate.votes + 1 }
//       return state.map(object => object.id !== id ? object : updatedObject)
//     case 'RESET':
//       return initialState
//     case 'ADD': 
//       return [...state, action.payload]
//     default:
//       return state
//   }
// }

// export default anecdoteReducer