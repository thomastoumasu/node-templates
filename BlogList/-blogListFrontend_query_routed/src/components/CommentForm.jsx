import { useState } from 'react'
import logger from '../utils/logger'

const CommentForm = ({ handleComment }) => {
  const [content, setContent] = useState('')

  const onSubmit = async event => {
    event.preventDefault()
    try {
      await handleComment(content)
      setContent('')
    } catch (exception) {
      logger.error('--CommentForm: onSubmit not successful, exception: ', exception)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div>
        <input type="text" placeholder="write new comment here" value={content} onChange={({ target }) => setContent(target.value)} />
        <button type="submit">add comment</button>
      </div>
    </form>
  )
}

export default CommentForm
