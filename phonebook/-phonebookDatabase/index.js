require('dotenv').config()

const Person = require('./models/person')

const express = require('express')
const app = express()
app.use(express.static('dist')) // have express check the dict directory for GET-requested files (used for frontend files)
app.use(express.json())

//const cors = require('cors')
//app.use(cors())

// middleware: use morgan to log requests
const morgan = require('morgan')
morgan.token('postedData', (req) => {// log data sent in POST requests. (req, res)
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  } else {
    return null
  }
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postedData'))

// routes
app.get('/info', (req, res) => {
  const date = new Date().toString()
  console.log(`--server: contacted for info on ${date}`)
  Person.find({})
    .then(persons => {
      console.log('debug:', persons)
      const info = `
      <div>
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${date}</p>
      </div>
      `
      res.send(info)
    })
})

app.get('/api/persons', (req, res) => {
  Person.find({})
    .then(persons => {
      console.log('phonebook:')
      persons.forEach(person => {
        console.log(person.name, person.number)
      })
      res.json(persons)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  console.log(`--server: received get request for person with id: ${id}`)
  Person.findById(id)
    .then(person => {
      if (person) {
        console.log('debug:', person)
        console.log(`--server: person found. Responding: ${JSON.stringify(person)}`)
        res.json(person)
      } else {
        console.log('--server: no person was found with this id.')
        res.statusMessage = 'id not found'
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  console.log('--server: received post request, body is', body)
  const newPerson = new Person({
    name: body.name,
    number: body.number
  })
  newPerson.save()
    .then(savedPerson => {
      console.log(`--server: added following person to phonebook: ${JSON.stringify(savedPerson)}`)
      res.json(savedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  console.log(`--server: received delete request for person with id: ${id}`)
  Person.findByIdAndDelete(id)
    .then(deletedPerson => {
      if (!deletedPerson) {
        console.log('--server: person to delete was not found')
        res.statusMessage = 'id not found'
        res.status(204).end()
      } else {
        console.log('--server: person found and deleted')
        res.json(deletedPerson)
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  console.log(`--server: received update request for person with id: ${id}`)
  Person.findById(id)
    .then(person => {
      if (!person) {
        console.log('--server: person to update was not found')
        res.statusMessage = 'id not found'
        return res.status(404).end()
      } else {
        person.number = req.body.number
        return person.save().then(updatedPerson => {
          console.log(`--server: updated following person: ${JSON.stringify(updatedPerson)}`)
          res.json(updatedPerson)
        })
      }
    })
    .catch(error => next(error))
})

// middleware to catch requests made to non-existent routes
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

// error handler middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' }) // bad request
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message }) // bad request
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`--server: running on port ${PORT}`)
})