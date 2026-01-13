import { useState, useEffect } from 'react'
import axios from 'axios'
import phonebookService from './services/phonebook.js'
import Notification from './components/Notification'

const Filter = ({handles}) => {
  return(
    <>
      <form onSubmit={handles.onSubmit}>
        <input value={handles.buffer} onChange={handles.onChange}/>
        <button type='submit'> filter </button>
      </form>
    </>
  )
}

const Add = ({handles}) => {
  return(
    <>
      <form onSubmit={handles.onSubmit}>
        <div>
          <input value={handles.nameBuffer} onChange={handles.nameOnChange} /> name
        </div>
        <div>
          <input value={handles.numberBuffer} onChange={handles.numberOnChange} /> number
        </div>
        <button type='submit'> add </button>
      </form>
    </>
  )
}

const Person = ({person, deleteHandle}) =>
  <p> {person.name} {person.number} {' '}
    <button onClick={deleteHandle(person)}>delete</button>
  </p>

const Show = ({persons, deleteHandle}) =>
  persons.map(person =>
    <Person person={person} deleteHandle={deleteHandle} key={person.id} />
  )

const App = () => {
  const [notification, setNotification] = useState({message: null, isAlert: false})
  const [allPersons, setAllPersons] = useState([])
  const [filter, setFilter] = useState('')
  const [filterBuffer, setFilterBuffer] = useState('')
  const [nameBuffer, setNameBuffer] = useState('')
  const [numberBuffer, setNumberBuffer] = useState('')

  const personsToShow = allPersons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase()))

  const notify = (message, isAlert) => {
    setNotification({message: message, isAlert: isAlert}) // this will trigger rendering of Notification()
    setTimeout(() => {
      setNotification({message: null, isAlert: false})
    }, 2000)
  }

  const filterHandles = {
    buffer: filterBuffer,
    onChange: (event) => setFilterBuffer(event.target.value),
    onSubmit: (event) => {
      event.preventDefault()
      setFilter(filterBuffer)
    }
  }

  const addPerson = (event) => {
    event.preventDefault()
    // case 1: this person is already in the phonebook with this number
    if (allPersons.filter(person => (person.name === nameBuffer && person.number === numberBuffer)).length !== 0) {
      notify(`${nameBuffer} is already in phonebook under this number`, true)
    }
    // case 2: this person is already in the phonebook with a different number
    else if (allPersons.filter(person => person.name === nameBuffer).length !== 0) {
      if (window.confirm(`Update ${nameBuffer}'s number ?`)) {
        const personToUpdate = {...allPersons.find(person => person.name === nameBuffer), number: numberBuffer}
        console.log('request from browser, update this object: ', personToUpdate)
        phonebookService
          .updateOne(personToUpdate)
          .then(returnedPerson => {
            setAllPersons(allPersons.map(person => person.id === personToUpdate.id ? returnedPerson : person))
            notify(`${nameBuffer}'s number has been updated`, false)
          })
          .catch(error => {
            console.log(error.status, error.response.status)
            if (error.status === 404) {
              notify(`${nameBuffer} had already been removed from server`, true)
              setAllPersons(allPersons.filter(person => person.id !== personToUpdate.id))
            } else {
              console.log(error)
              notify(error.response.data.error, true)
            }
          })
      }
      else { // do nothing  if user cancels
      }
    }
    // case 3: this person is not yet in the phonebook
    else {
      const newPerson = {
        name: nameBuffer,
        number: numberBuffer,
  //       id: String(allPersons.length + 1) // trust phonebookService to generate id in a reasonable way
      }
      console.log('request from browser, add this object: ', newPerson)
      phonebookService
        .addOne(newPerson)
        .then(returnedPerson => {
          setAllPersons(allPersons.concat(returnedPerson))
          notify(`${returnedPerson.name} has been added to phonebook`, false)
        })
        .catch(error => {
          console.log(error)
          notify(error.response.data.error, true)
        })
    }
    setNameBuffer('')
    setNumberBuffer('')
  }

  const addHandles = {
    nameBuffer: nameBuffer,
    numberBuffer: numberBuffer,
    nameOnChange: (event) => setNameBuffer(event.target.value),
    numberOnChange: (event) => setNumberBuffer(event.target.value),
    onSubmit: addPerson
  }

  const deletePerson = personToDelete => // returns a button onClick Handler of the form () => {}
    () => {
      if (window.confirm(`Delete ${personToDelete.name} ?`)) {
        console.log('request from browser, delete this object: ', personToDelete)
        phonebookService
          .deleteOne(personToDelete.id)
          .then(deletedPerson => {
		          if (!deletedPerson) {
		            console.log('user had already been removed from server. Reset browser state to ', allPersons.filter(person => person.id !== personToDelete.id))
                setAllPersons(allPersons.filter(person => person.id !== personToDelete.id))
                notify(`${personToDelete.name} had been already deleted`, true)
		          } else {
		            console.log('reset browser state to ', allPersons.filter(person => person.id !== deletedPerson.id))
                setAllPersons(allPersons.filter(person => person.id !== deletedPerson.id))
                notify(`${deletedPerson.name} has been deleted`, false)
		          }
          })
          // .catch(error => { // only for part 2
          //   console.log('user had already been removed from server. Reset browser state to ', allPersons.filter(person => person.id !== personToDelete.id))
          //   setAllPersons(allPersons.filter(person => person.id !== personToDelete.id))
          //   notify(`${personToDelete.name} had been already deleted`, true)
          // })
      }
      else {} // do nothing if user cancels
    }

  useEffect( () => {
    phonebookService
      .getAll()
      .then(allPersons => setAllPersons(allPersons))
  }, [])

  return (
    <>
      <h2> Filter persons </h2>
      <Notification notification={notification} />
      <Filter handles={filterHandles} />
      <h2> Add persons </h2>
      <Add handles={addHandles} />
      <h2> Show persons </h2>
      <Show persons={personsToShow} deleteHandle={deletePerson}/>
{/*       <div>(debug) state filter: {filter} </div> */}
    </>
  )
}

export default App
