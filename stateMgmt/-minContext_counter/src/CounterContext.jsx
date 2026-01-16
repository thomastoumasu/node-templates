// see https://fullstackopen.com/en/part6/react_query_use_reducer_and_the_context#defining-the-counter-context-in-a-separate-file
import { createContext, useReducer, useContext } from 'react'

const reducer = (state, action) => {
  switch (action.type) {
    case '+': 
      return state + 1
    case '-':
      return state - 1
    case '0':
      return 0
    default:
      return state
  }
}

const CounterContext = createContext()

export const CounterContextProvider = (props) => {
  const [counter, useCounter] = useReducer(reducer, 0)
  return (
    <CounterContext.Provider value={[counter, useCounter]}>
      {props.children}
    </CounterContext.Provider>
  )
}

export const useCounterValue = () => {
  const [counter, useCounter] = useContext(CounterContext)
  return counter
}

export const useCounterDispatch = () => {
  const [counter, useCounter] = useContext(CounterContext)
  return useCounter
}

export default CounterContext