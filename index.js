const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

morgan.token('body', function (req, res) { return JSON.stringify(req.body) })

app.use(morgan('tiny', {
  skip: function (req, res) { return req.method === 'POST' }
}))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', {
  skip: function (req, res) { return req.method !== 'POST' }
}))


let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
  let info = persons.length > 1 
    ? `<p>Phonebook has info for ${persons.length} people</p>`
    : persons.length === 1
      ?  '<p>Phonebook has info for 1 person'
      : '<p>Phonebook is empty</p>'
  
  info += `<p> ${new Date} </p>`
  response.send(info)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  let person = request.body
  const error = !person.name
    ? { error: 'name missing'}
    : !person.number 
      ? { error: 'number missing'}
      : persons.map(person => person.name).includes(person.name)
      ? { error: 'name must be unique'}
      : null
  
  if(!error) {
    person = {id: ~~(Math.random() * 9999), ...person}
    persons=persons.concat(person)
    response.json(person)
  } else {
    response.status(400).json({ 
      error: error
    })
  }

})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})