var persons = require('./data.json')
const express = require('express')
const cors = require('cors')
var morgan = require('morgan')

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
        <p>Phonebook has information for <b>${persons.length}</b> people</p>
        <p>${new Date()}</p>

    </div>
    `)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) response.json(note)
    else response.status(404).end()
    response.json(person)
})

const generateId = () => { return Math.floor(Math.random() * 10000000) }

app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log(body)
    if (!body.name || !body.number) {
      return response.status(400).json({ 
        error: 'name/number missing' 
      })
    }
    
    if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
  
    const person = {
      name: body.name,
      number: body.number,
      id: generateId(),
      visible: true
    }
  
    persons = persons.concat(person)

    console.log(person)
    response.json(person)
  })

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        persons = persons.filter(person => person.id !== id)
        response.status(204).end()
    }
    else response.status(404).end()
})

// middleware, runs last
const unknownEndpoint = (request, response, next) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})