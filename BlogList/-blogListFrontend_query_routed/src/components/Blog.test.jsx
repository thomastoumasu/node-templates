import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('<Blog />', () => {
  let likeBlogMockHandler = vi.fn()

  const blog = {
    title: 'a nice blog title',
    author: 'Aristoteles',
    url: 'testUrl',
    likes: 5,
    user: {
      username: 'thomas',
      name: 'Thomas Bost'
    }
  }

  beforeEach(() => {
    render(<Blog blog={blog} likeBlog={likeBlogMockHandler} />)
  })

  test('renders title and author but not url and likes by default', async () => {
    // test not rendering of text
    const urlOrLikesRendered = screen.queryByText(blog.url, { exact: false }) || screen.queryByText(blog.likes, { exact: false })
    expect(urlOrLikesRendered).toBeNull()

    // test rendering of text
    const titleRendered = screen.getByText(blog.title, { exact: false }) // exact: otherwise do not pickup when title and author next to each other
    const authorRendered = await screen.findByText(blog.author, { exact: false }) // same effect as getByText but async
    expect(titleRendered).toBeDefined()
    expect(authorRendered).toBeDefined()

    // screen.debug() // to debug
    // screen.debug(titleRendered)

    // // test rendering of text using .css selector
    // const { container } = render(<Blog blog={blog} />)
    // const div = container.querySelector('.blogNoDetails')
    // expect(div).toHaveTextContent(
    //   'a nice blog title'
    // )
  })

  test('clicking the show button shows details', async () => {
    const user = userEvent.setup()
    const button = screen.getByText('view')
    await user.click(button)

    const urlAndLikesRendered = screen.getByText(blog.url, { exact: false }) && screen.getByText(blog.likes, { exact: false })
    expect(urlAndLikesRendered).toBeDefined()
  })

  test('clicking the like button twice calls event handler twice', async () => {
    const user = userEvent.setup()
    const viewDetailsButton = screen.getByText('view')
    await user.click(viewDetailsButton)
    const likeButton = screen.getByText('like')

    const numberOfClicksOnLike = 2

    const promiseArray = Array(numberOfClicksOnLike).fill(likeButton).map(
      button => user.click(button)
    )
    await Promise.all(promiseArray)

    expect(likeBlogMockHandler.mock.calls).toHaveLength(numberOfClicksOnLike)
  })
})