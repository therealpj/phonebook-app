require('dotenv').config()
const express = require('express')
const cors = require('cors')
var morgan = require('morgan')
const Person = require('./models/person')

const app = express()
app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    req.method == 'POST' ? JSON.stringify(req.body) : ''
  ].join(' ')
}))

app.get('/', (request, response) => {
  response.send('<h1>Hello, world!</h1>')
})

app.get('/info', (request, response) => {
  response.send(`
    <div>
        <p>Phonebook has information for <b>${Person.length}</b> people</p>
        <p>${new Date()}</p>

    </div>
    `)

})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

const generateId = () => { return Math.floor(Math.random() * 10000000) }

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number,
    id: generateId(),
    visible: true
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response) => {

  const body = request.body
  const newPerson = {
    name: body.name,
    number: body.number,
    id: generateId(),
    visible: true
  }

  Person.findByIdAndUpdate(request.params.id, newPerson, {new: true, runValidators: true, context: 'query'})
  .then(updatedPerson => {
    response.json(updatedPerson)
  })
  .catch(error => next(error))
})

// middleware, runs last
const unknownEndpoint = (request, response, next) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})