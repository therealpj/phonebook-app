import { useEffect, useState } from 'react'
import Persons from './components/Persons'
import Field from './components/Field'
import Button from './components/Button'
import personService from './services/persons'
import Notification from './components/Notification'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setNewFilter] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState()

  useEffect(() => {
    personService.getAll()
      .then(persons => setPersons(persons))
      .catch(error => console.log(error))
  }, [])

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setNewFilter(event.target.value)
    setPersons(persons.map(person =>
      !person.name.toLowerCase().includes(filter.toLowerCase())
        ? { ...person, visible: false }
        : { ...person, visible: true }
    ))
  }

  const setNotification = (message, type) => {
    setMessageType(type)
    setMessage(message)
    setTimeout(() => setMessage(null), 5000)
  }

  useEffect(() => {
    setPersons(persons => persons.map(person =>
      !person.name.toLowerCase().includes(filter.toLowerCase())
        ? { ...person, visible: false }
        : { ...person, visible: true }
    ))
  }, [filter])

  const addPerson = (event) => {
    event.preventDefault()
    if (persons.find(person => person.name === newName)) {
      if (window.confirm(`${newName} is already added to phonebook, update replace old number with new one?`)) {
        const person = persons.find(person => person.name === newName)
        personService.update(person.id, { ...person, number: newNumber })
        setPersons(persons => persons.map(person => person.name === newName ? { ...person, number: newNumber } : person))
        setNotification(`${newName}'s number updated to ${newNumber}`, "success")
      }
    } else {
      const person = {
        name: newName,
        number: newNumber,
        visible: true
      }
      personService
      .create(person)
      .then(person => setPersons(persons.concat(person)))
      .catch(error => {
        setNotification(`${error.response.data.error}`, "error")
        console.log(error.response.data.error)
      })

      setNotification(`${newName} added to phonebook`, "success")
      setNewName('')
      setNewNumber('')
    }
  }

  const deletePerson = (id) => {
    const person = persons.find(person => person.id === id)
    if (window.confirm(`Delete ${person.name}?`)) {
      personService.remove(id)
      .catch(error => setNotification(`${person.name} already deleted from phonebook`, "error"))
      setPersons(persons => persons.filter(person => person.id !== id))
    }
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification type={messageType} message={message}/>
      Filter: <input value={filter} onChange={handleFilterChange} />
      <h3>Add new</h3>
      <form>
        <Field name="name" value={newName} onChange={handleNameChange} />
        <Field name="number" value={newNumber} onChange={handleNumberChange} />
        <Button type="submit" onClick={addPerson} name="add" />
      </form>
      <h2>Numbers</h2>
      <Persons persons={persons} onClickDelete={deletePerson} />
    </div>
  )
}

export default App