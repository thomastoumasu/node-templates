const key = 'loggedBlogListUser'

const saveUser = user => {
  localStorage.setItem(key, JSON.stringify(user))
}

const loadUser = () => {
  const user = localStorage.getItem(key)
  console.log('-storageService, user: ', user)
  return user ? JSON.parse(user) : null
}

const eraseUser = () => {
  localStorage.removeItem(key)
}

export default { saveUser, loadUser, eraseUser }