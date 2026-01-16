import { createSlice, current } from '@reduxjs/toolkit'

const filterSlice = createSlice({
  name: 'filter',
  initialState: '',
  reducers: {
    setFilter(state, action) {
      return action.payload
    }
  }
})

export default filterSlice.reducer
export const { setFilter } = filterSlice.actions

// export const setFilter = filter => {
//   return (
//     { type: 'SET FILTER', payload: filter }
//   )
// }

// const filterReducer = (state = '', action) => {
//   console.log('-filterReducer: action is ', action)
//   switch (action ? action.type : null) {
//     case 'SET FILTER':
//       return action.payload
//     default:
//       return state
//   }
// }

// export default filterReducer