import deepFreeze from 'deep-freeze'
import anecdoteReducer from './anecdoteReducer'

describe('anecdoteReducer ', () => {
  const initialState = []

  const startState = [
    {
      anecdote: 'short text',
      votes: 23,
      id: 1
    },
    {
      anecdote: 'long text',
      votes: 2,
      id: 2
    }
  ]

  test('gets initialized with proper initial state', () => {
    const newState = anecdoteReducer([], {})
    expect(newState).toEqual(initialState)
  })

  test('upvotes anecdote with action VOTE', () => {
    const state = startState
    // const action = { type: 'VOTE', payload: { id: 1 } } // without redux toolkit
    const action = { type: 'anecdoteObjects/vote', payload: 1 }
    deepFreeze(state)

    const newState = anecdoteReducer(state, action)
    expect(newState).toContainEqual({
      anecdote: 'short text',
      votes: 24,
      id: 1
    })
    expect(newState).toContainEqual(startState[1])
  })

  test('add new anecdote with action ADD', () => {
    const state = startState
    const newObject = {
      anecdote: 'a new one',
      votes: 0,
      id: 3
    }
    // const action = { type: 'ADD',  payload: newObject } // without redux toolkit
    const action = { type: 'anecdoteObjects/add',  payload: newObject }
    deepFreeze(state)

    const newState = anecdoteReducer(state, action)
    expect(newState).toContainEqual(newObject)
    expect(newState).toHaveLength(startState.length + 1)
  })
})