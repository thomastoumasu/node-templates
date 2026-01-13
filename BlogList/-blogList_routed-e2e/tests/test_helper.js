const loginWith = async (page, username, password) => {
  await page.goto('/login')
  await page.getByRole('textbox', { name: 'username' }).fill(username)
  await page.getByRole('textbox', { name: 'password' }).fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, title, author, url) => {
  await page.getByRole('button', { name: 'create new blog' }).click()
  await page.getByRole('textbox', { name: 'title' }).fill(title)
  await page.getByRole('textbox', { name: 'author' }).fill(author)
  await page.getByRole('textbox', { name: 'url' }).fill(url)
  await page.getByRole('button', { name: 'create' }).click()
}

const commentBlog = async (page, content) => {
  await page.getByPlaceholder('write new comment here').fill(content)
  await page.getByRole('button', { name: 'add comment' }).click()
}

export { loginWith, createBlog, commentBlog }
