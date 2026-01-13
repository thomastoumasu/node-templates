import { render, screen } from '@testing-library/react'
import BlogForm from './BlogForm'
import userEvent from '@testing-library/user-event'

test('<BlogForm /> updates parent state and calls onSubmit with the right details', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  render(<BlogForm createBlog={createBlog} />)

  // const input = screen.getByRole('textbox') // will not work if there are multiple inputs
  const title = screen.getByPlaceholderText('write title here')
  const author = screen.getByLabelText('author')
  const url = screen.getByLabelText('url')
  const sendButton = screen.getByText('create')

  await user.type(title, 'a nice title for this blog')
  await user.type(author, 'toto')
  await user.type(url, 'testUrl')
  await user.click(sendButton)

  // console.log(createBlog.mock.calls) // to debug

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0].title).toBe('a nice title for this blog')
  expect(createBlog.mock.calls[0][0].author).toBe('toto')
  expect(createBlog.mock.calls[0][0].url).toBe('testUrl')
})