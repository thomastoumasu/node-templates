import { createSlice } from '@reduxjs/toolkit'
// import { createSlice, current } from '@reduxjs/toolkit' // for lint
import blogService from '../services/blogs'
import logger from '../utils/logger'
import { initializeUsers } from '../reducers/userReducer'

const initialState = []

const blogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    update(state, action) {
      const updatedBlog = action.payload
      return state.map(b => b.id !== updatedBlog.id ? b : updatedBlog)
    },
    remove(state, action) {
      const blogToDelete = action.payload
      return state.filter(b => b.id !== blogToDelete.id)
    },
    add(state, action) {
      // logger.info('--blogReducer: state before adding is ', current(state))
      state.push(action.payload)
      // logger.info('--blogReducer: state after adding is ', current(state))
    },
    set(state, action) {
      return action.payload
    }
  }
})

export const { update, set, add, remove } = blogSlice.actions

// asynchronous actions (better to have the function here separated from the frontend component)
export const initializeBlogs = () => {
  // logger.info('--blogReducer: initializeBlogs has been called')
  return async dispatch => {
    const startBlogs = await blogService.getAll()
    // logger.info('--blogReducer: got those startBlogs, and dispatching them: ', startBlogs)
    dispatch(set(startBlogs))
  }
}

export const createBlog = blogToCreate => {
  return async dispatch => {
    // logger.info('--blogReducer: blogToCreate is ', blogToCreate)
    const createdBlog = await blogService.createOne(blogToCreate)
    // logger.info('--blogReducer: createdBlog is ', createdBlog)
    dispatch(add(createdBlog))
    // now need to update user.blogs in the app state. Can use a dispatch for the user reducer, or just refresh from the server:
    dispatch(initializeUsers()) 
  }
}

export const upvoteBlog = blogToUpvote => {
  const upvotedBlog = { ...blogToUpvote, likes: blogToUpvote.likes + 1 }
  return async dispatch => {
    // logger.info('--blogReducer: upvotedBlog is ', upvotedBlog)
    const updatedBlog = await blogService.updateOne(upvotedBlog)
    // logger.info('--blogReducer: updatedBlog is ', updatedBlog)
    dispatch(update(updatedBlog))
  }
}

export const removeBlog = blogToDelete => {
  return async dispatch => {
    // logger.info('--blogReducer: id of blog to delete is ', blogToDelete.id)
    await blogService.deleteOne(blogToDelete.id)
    // logger.info('--blogReducer: delete successful')
    dispatch(remove(blogToDelete))
    // now need to update user.blogs in the app state. Can use a dispatch for the user reducer, or just refresh from the server:
    dispatch(initializeUsers())
  }
}

export const commentBlog = (blogToComment, content) => {
  return async dispatch => {
    const commentedBlog = await blogService.commentOne(blogToComment.id, content)
    // logger.info('--blogReducer: commentedBlog is ', commentedBlog)
    dispatch(update(commentedBlog))
  }
}

export default blogSlice.reducer