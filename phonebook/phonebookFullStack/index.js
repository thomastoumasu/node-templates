let persons = [
  {
    "id": "1",
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": "2",
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": "3",
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": "4",
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

const express = require('express')
const app = express()
app.use(express.json())

app.use(express.static('dist')) // have express check the dict directory for GET-requested files (used for frontend files)

// const cors = require('cors') // uncomment to use this code as backend for PhonebookFrontend (avoids AccessControlAllowOrigin error)
// app.use(cors())

// uncomment to use diy middleware for logging requests
// const requestLogger = (req, res, next) => { // needs use(express.json) called before otherwise no request.body
//   console.log('---request logger start---')
//   console.log('Headers:', req.headers) // it might be useful to log headers for debugging
//   console.log('Method:', req.method)
//   console.log('Path:', req.path)
//   console.log('Body:', req.body)
//   console.log('---request logger end---')
//   next()
// }
// app.use(requestLogger) 

// use morgan instead
const morgan = require('morgan')

// app.use(morgan('tiny', { //  uncomment to use morgan tiny configuration
//   skip: function (req, res) { return res.statusCode < 400 }
// }))

morgan.token('postedData', (req, res) => {  // log data sent in POST requests. 
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  } else {
    return null
  }
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postedData'))

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/info', (req, res) => {
  const date = new Date().toString()
  console.log(`--server: contacted for info on ${date}`)
  const info = `
    <div>
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${date}</p>
    </div>
  `
  res.send(info)
})

app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id
  console.log(`--server: received get request for person with id: ${id}`)
  const person = persons.find(e => e.id === id)
  if (person) {
    console.log(`--server: person found. Responding: ${JSON.stringify(person)}`)
    res.json(person)  
  } else {
    console.log(`--server: no person was found with this id.`)
    res.statusMessage = "id not found"
    res.status(404).end() 
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  console.log(`--server: received delete request for person with id: ${id}`)
  persons = persons.filter(e => e.id !== id)
  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const newPerson = req.body
  console.log(`--server: received post request for: ${JSON.stringify(newPerson)}`)
  if (!newPerson.name || !newPerson.number) {
    console.log('--server: name or number is missing. Cannot create person.')
    return res.status(400).json({
      error: 'content missing'
    })
  } else if (persons.find(e => e.name === newPerson.name)) {
    console.log('--server: person with this name is already in phonebook. Will not create again.')
    return res.status(400).json({
      error: 'name must be unique'
    })
  } else {
    const newId = persons.length > 0
      ? Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
      : 0
    newPerson.id = String(newId)
    console.log(`--server: so creating following person: ${JSON.stringify(newPerson)}`)
    persons = persons.concat(newPerson)
    res.json(newPerson)
  }
})

// middleware to catch requests made to non-existent routes
const unknownEndpoint = (req, res) => { 
  res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`--server: running on port ${PORT}`)
})    