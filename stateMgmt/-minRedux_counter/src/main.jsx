import React from 'react'
import ReactDOM from 'react-dom/client'
import { createStore } from 'redux'

let timesRendered = 0

const counterReducer = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    case 'ZERO':
      return 0
    default:
      return state
  }
}
const store = createStore(counterReducer)

const App = ({ timesRendered }) => {
  return (
    <div>
      <div>times rendered {timesRendered}</div>
      {store.getState()}
      <div>
        <button onClick={ () => store.dispatch({ type: 'INCREMENT' }) }> plus </button>
        <button onClick={ () => store.dispatch({ type: 'DECREMENT' }) }> minus </button>
        <button onClick={ () => store.dispatch({ type: 'ZERO' }) }> zero </button>
        <button onClick={ () => store.dispatch({ type: 'NOT DEFINED' }) }> not defined </button>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
const renderApp = () => {
  timesRendered += 1
  root.render(<App timesRendered={timesRendered}/>)
}

store.subscribe(renderApp)

renderApp()

