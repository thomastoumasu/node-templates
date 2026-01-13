const { test, describe, expect, beforeEach } = require('@playwright/test')
const { loginWith, createBlog, commentBlog } = require('./test_helper')

describe('BlogList app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset') // api/testing only served when backend is in test mode, so start backend with npm run start:test
    await request.post('/api/users', {
      // data: see https://playwright.dev/docs/api/class-apirequestcontext#api-request-context-post
      data: {
        name: 'Thomas Bost',
        username: 'thomas',
        password: 'aHgGd',
      },
    })
    await request.post('/api/users', {
      data: {
        name: 'Ayame Bost',
        username: 'ayame',
        password: 'AhGgD',
      },
    })
    await page.goto('/')
  })

  // test('User list can not be seen if no user is logged in', async ({ page }) => {
  //   const locator = page.getByText('users')
  //   await expect(locator).toBeHidden()
  //   await page.goto('/users')
  //   await page.getByText('Thomas Bost').waitFor()
  //   const secondLocator = page.getByText('Thomas Bost')
  //   await expect(secondLocator).toHaveCount(0) // right to throw an error, backend should be extended so that get at api/users requires authorization
  // })

  test('Login page is always shown', async ({ page }) => {
    const locator = page.getByText('login')
    await expect(locator).toBeVisible()

    await locator.click()
    await expect(page.getByText('log in to application')).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'thomas', 'aHgGd')
      await expect(page.getByText('thomas logged in')).toBeVisible()
    })

    test('fails with incorrect credentials', async ({ page }) => {
      await loginWith(page, 'thomas', 'wrong')

      const errorMessage = page.getByText('Wrong credentials')
      await expect(errorMessage).toBeVisible()
      const parent = errorMessage.locator('..')
      await expect(parent).toHaveCSS('border-style', 'solid')
      // await expect(parent).toHaveCSS('color', 'rgb(255, 0, 0)') // tests Notification.jsx, not NotificationMui.jsx
      // or maybe better: check that error message is displayed in the proper component
      const notification = page.locator('_react=Notification')
      await expect(notification).toContainText('Wrong credentials')
      await expect(parent).toHaveCSS('border-style', 'solid')
      // await expect(parent).toHaveCSS('color', 'rgb(255, 0, 0)') // tests Notification.jsx, not NotificationMui.jsx

      await expect(page.getByText('thomas logged in')).toBeHidden()
    })
  })

  describe('Logout', () => {
    test('succeeds when a user was logged in', async ({ page }) => {
      await loginWith(page, 'thomas', 'aHgGd')
      const locator = page.getByText('log out')
      await expect(locator).toBeVisible()

      await locator.click()
      await expect(page.getByText('log in to application')).toBeVisible()
      await expect(page.getByText('log out')).toBeHidden()
    })

    test('not possible if no user is logged in', async ({ page }) => {
      await expect(page.getByText('log out')).toBeHidden()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page, request }) => {
      await loginWith(page, 'thomas', 'aHgGd')
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'nice title for this blog', 'Epicure', 'testUrl')
      await expect(page.getByText('Epicure')).toBeVisible() // do not neet { exact: false } with Playwright

      const notificationMessage = page.getByText('new blog: nice title for this blog has been added')
      await expect(notificationMessage).toBeVisible()
      const parent = notificationMessage.locator('..')
      await expect(parent).toHaveCSS('border-style', 'solid')
      // await expect(parent).toHaveCSS('color', 'rgb(0, 128, 0)') // tests Notification.jsx, not NotificationMui.jsx
    })

    test('but only with title and url', async ({ page }) => {
      await createBlog(page, '', 'Pyrrhon', 'someUrl')
      await expect(page.getByText('Pyrrhon')).toBeHidden()
      const notification = page.locator('_react=Notification')
      await expect(notification).toContainText('title or url missing')
    })

    test('a blog can be liked', async ({ page }) => {
      await createBlog(page, 'some blog', 'Zenon', 'noUrl')
      await page.getByText('Zenon').click()
      await page.getByRole('button', { name: 'like' }).click()
      await expect(page.getByText('likes 1')).toBeVisible()
    })

    test('and commented', async ({ page }) => {
      await createBlog(page, 'another blog', 'Zenon', 'noUrl')
      await page.getByText('Zenon').click()
      await commentBlog(page, 'a nice comment')
      await expect(page.getByText('a nice comment')).toBeVisible()
    })

    test('and deleted', async ({ page }) => {
      await createBlog(page, 'yet another blog', 'Zenon', 'noUrl')
      await page.getByText('Zenon').click()
      page.on('dialog', dialog => dialog.accept()) // handles the windows.confirm dialog in the delete operation
      await page.getByRole('button', { name: 'remove' }).click()
      await expect(page.getByText('Zenon')).toBeHidden()
    })

    test('but only by the creator of the blog', async ({ page }) => {
      await createBlog(page, 'blog created by Thomas', 'Democrites', 'someUrl')
      await page.getByText('Democrites').click()
      await expect(page.getByText('remove')).toBeVisible()
      await page.getByRole('button', { name: 'log out' }).click()
      await loginWith(page, 'ayame', 'AhGgD')
      await expect(page.getByText('Democrites')).toBeVisible()
      await page.getByText('Democrites').click()
      await expect(page.getByText('remove')).toBeHidden()
    })

    test('blogs are arranged in the order corresponding to the likes', async ({ page }) => {
      await createBlog(page, 'first blog', 'panem', 'url1')
      await page.getByText('panem').click()
      await page.getByRole('button', { name: 'like' }).click()
      await page.goto('/blogs')
      await createBlog(page, 'second blog', 'circenses', 'url2')
      const pAbove = page.locator('p:above(:text("circenses"))')
      await expect(pAbove.getByText('panem')).toBeVisible()

      const second = page.getByText('circenses')
      await second.click()
      const likeButton = page.getByRole('button', { name: 'like' })
      await likeButton.click()
      await page.getByText('likes 1').waitFor()
      await likeButton.click()
      await page.getByText('likes 2').waitFor()
      await page.goto('/blogs')
      // await page.pause()
      const newPAbove = page.locator('p:above(:text("panem"))')
      await expect(newPAbove.getByText('circenses')).toBeVisible()
    })

    describe('users ', () => {
      beforeEach(async ({ page, request }) => {
        await createBlog(page, 'first blog', 'panem', 'url1')
        await page.getByText('panem').waitFor()
        await page.goto('/users')
      })

      test('list is shown with appropriate numbers of blogs but without details', async ({ page }) => { 
        await expect(page.getByText('Thomas Bost 1')).toBeVisible()
        await expect(page.getByText('Ayame Bost 0')).toBeVisible()
        await expect(page.getByText('first blog')).toBeHidden()
      })

      test('details can be displayed if clicked on user', async ({ page }) => { 
        await page.getByText('Thomas Bost 1').click()
        await expect(page.getByText('first blog')).toBeVisible()
      })
    })
  })
})
