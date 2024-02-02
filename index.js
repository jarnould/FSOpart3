require('dotenv').config()

const express = require('express')
const app = express()
app.use(express.static('dist'))
app.use(express.json())

const cors = require('cors')
app.use(cors())

const morgan = require('morgan')
morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan('tiny', {
  skip: function (req, res) { return req.method === 'POST' }
}))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', {
  skip: function (req, res) { return req.method !== 'POST' }
}))

const Person = require('./models/person.js')

app.get('/api/persons', (request, response) => {
  Person.find({})
  .then (persons => response.json(persons)) 
})

app.get('/info', (request, response) => {
  Person.countDocuments({})
  .then(number => {
    let info = number > 1
      ? `<p>Phonebook has info for ${number} people</p>`
      : number === 1
        ?  '<p>Phonebook has info for 1 person'
        : '<p>Phonebook is empty</p>'
  
  info += `<p> ${new Date} </p>`
  response.send(info)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
  .then(person => {
    console.log(person);
   if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
   })
  .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
  const person = request.body
  
  if (!person.name) 
    response.status(400).json({ error: 'name missing'})
  else if (!person.number)
    response.status(400).json({ error: 'number missing'}) 
  else Person.exists({name: person.name}).then(id => {
    if (id)
      response.status(400).json({ error: 'name must be unique'})
    else
      Person(person).save()
      .then(savedPerson => response.json(savedPerson)) 
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const person = {
    name: request.body.name,
    number: request.body.number
  }
  
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
  .then(()=>response.status(204).end())
  .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})