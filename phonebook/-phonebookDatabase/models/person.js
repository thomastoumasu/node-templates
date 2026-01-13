const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI
mongoose.connect(url)
console.log('--person.js connecting to', url)
mongoose.connect(url)
  .then( () => {
    console.log('--person.js connected to MongoDB')
  })
  .catch(error => {
    console.log('--person.js error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    validate: {
      validator: v => {
        return v.length >= 3
      },
      message: () => 'should be at least 3 characters long'
    },
    required: [true, 'name required']
  },
  number: {
    type: String,
    validate: [
      {
        validator: v => {
          return /\d{3}-\d+$/.test(v) || /\d{2}-\d+$/.test(v)
        },
        message: () => 'should be of the form XX-XXXXX or XXX-XXXX'
      },
      {
        validator: v => {
          return v.length >= 8 && v.length < 14
        },
        message: () => 'should be between 8 and 13 characters long'
      }
    ],
    required: [true, 'phone number required']
  }
})

const Person = mongoose.model('Person', personSchema)

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = Person