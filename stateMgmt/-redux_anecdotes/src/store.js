// import { combineReducers, createStore } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import anecdoteReducer from './reducers/anecdoteReducer.js'
import filterReducer from './reducers/filterReducer.js'
import notificationReducer from './reducers/notificationReducer.js'

// with @reduxjs/toolkit
const store = configureStore({
  reducer: {
    anecdoteObjects: anecdoteReducer,
    filter: filterReducer,
    notification: notificationReducer
  }
})

// store.subscribe(() => console.log('--redux store change listener: state is ', store.getState()))

// // without @reduxjs/toolkit
// const reducer = combineReducers({
//   anecdoteObjects: anecdoteReducer,
//   filter: filterReducer
// })
// const store = createStore(reducer)

// console.log('--store.js: store created. store: ',store.getState())

export default store