const { test, describe, expect, beforeEach } = require('@playwright/test')
const { loginWith, createBlog } = require('./test_helper')

describe('BlogList app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset') // api/testing only served when backend is in test mode, so start backend with npm run start:test
    await request.post('/api/users', { // data: see https://playwright.dev/docs/api/class-apirequestcontext#api-request-context-post
      data: {
        name: 'Thomas Bost',
        username: 'thomas',
        password: 'aHgGd'
      }
    })
    await request.post('/api/users', { 
      data: {
        name: 'Ayame Bost',
        username: 'ayame',
        password: 'AhGgD'
      }
    })
    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    const locator = page.getByText('log in to application')
    await expect(locator).toBeVisible()
  })

  describe('Login', () => {

    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'thomas', 'aHgGd')
      await expect(page.getByText('Thomas Bost logged in')).toBeVisible()
    })

    test('fails with incorrect credentials', async ({ page }) => {
      await loginWith(page, 'thomas', 'wrong')

      const errorMessage = page.getByText('Wrong credentials')
      await expect(errorMessage).toBeVisible() 
      const parent = errorMessage.locator('..')
      await expect(parent).toHaveCSS('border-style', 'solid')
      await expect(parent).toHaveCSS('color', 'rgb(255, 0, 0)')
      // or maybe better: check that error message is displayed in the proper component
      const notification = page.locator('_react=Notification')
      await expect(notification).toContainText('Wrong credentials')
      await expect(parent).toHaveCSS('border-style', 'solid')
      await expect(parent).toHaveCSS('color', 'rgb(255, 0, 0)')

      await expect(page.getByText('Thomas Bost logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page, request }) => {
      await loginWith(page, 'thomas', 'aHgGd')
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'nice title for this blog', 'Epicure', 'testUrl')
      await expect(page.getByText('Epicure')).toBeVisible() // do not neet { exact: false } with Playwright
      const blog = page.locator('.blogNoDetails')
      await expect(blog).toContainText('nice title for this blog')
    })

    test("but only with title and url", async ({ page }) => {
      await createBlog(page, "", "Pyrrhon", "someUrl");
      await expect(page.getByText("Pyrrhon")).not.toBeVisible(); 
      const notification = page.locator("_react=Notification");
      await expect(notification).toContainText("title or url missing");
    });

    test('a blog can be liked', async ({ page }) => {
      await createBlog(page, 'another blog', 'Zenon', 'noUrl')
      await page.getByText('Zenon').getByRole('button').click()
      await page.getByRole('button', { name: 'like' }).click()
      await expect(page.getByText('likes 1')).toBeVisible()
    })

    test('and deleted', async ({ page }) => {
      await createBlog(page, 'another blog', 'Zenon', 'noUrl')
      await page.getByText('Zenon').getByRole('button').click()
      page.on('dialog', dialog => dialog.accept()) // handles the windows.confirm dialog in the delete operation
      await page.getByRole('button', { name: 'remove' }).click()
      await expect(page.getByText('Zenon')).not.toBeVisible()
    })

    test('but only by the creator of the blog', async ({ page }) => {
      await createBlog(page, 'blog created by Thomas', 'Democrites', 'someUrl')
      await page.getByText('Democrites').getByRole('button').click()
      await expect(page.getByText('remove')).toBeVisible()
      await page.getByRole('button', { name: 'log out' }).click()
      await loginWith(page, 'ayame', 'AhGgD')
      await page.getByText('Democrites').getByRole('button').click()
      await expect(page.getByText('remove')).not.toBeVisible()
    })

    test('blogs are arranged in the order corresponding to the likes', async ({ page }) => {
      await createBlog(page, 'first blog', 'panem', 'url1')
      await page.getByText('panem').getByRole('button').click()
      await page.getByRole('button', { name: 'like' }).click()
      await createBlog(page, 'second blog', 'circenses', 'url2')

      const parentAboveSecond = page.locator('button:above(:text("circenses"))').locator('..')
      await expect(parentAboveSecond.getByText('panem')).toBeVisible()

      const second = page.getByText('circenses')
      await second.getByRole('button').click()
      const secondParent = second.locator('..')
      await secondParent.getByRole('button', { name: 'like' }).click() // cannot do on page since two blogs are visible with details
      await secondParent.getByText('likes 1').waitFor()
      await secondParent.getByRole('button', { name: 'like' }).click()
      // await page.pause()
      await page.getByText('likes 2').waitFor()

      const parentAboveFirst = page.locator('button:above(:text("panem"))').locator('..')
      await expect(parentAboveFirst.getByText('circenses')).toBeVisible()
    })
  })
})