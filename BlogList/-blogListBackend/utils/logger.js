const info = (...params) => {
  // if (process.env.NODE_ENV !== 'test') {
  console.log(...params)
  // }
}

const error = (...params) => {
  // if (process.env.NODE_ENV !== 'test') {
    console.error(...params)
  // }
}

const logger = { info, error } // do in two lines to use "Find All References" on logger
module.exports = logger