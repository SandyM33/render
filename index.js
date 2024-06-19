const morgan = require('morgan')
const cors = require('cors')

const express = require('express')
const app = express()
app.use(cors())
app.use(express.static('dist'))
app.use(express.json()) //used for parsing json

const Persons = require('./models/person')

//morgan for logging
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'));

morgan.token('content', function(req, res) {
    return JSON.stringify(req.body)
});

app.get('/', (request, response) => {
  response.send("<h1>Hello World<h1>")
})

app.get('/api/persons', (request, response) => {
  Persons.find().then(persons => {
    console.log(persons)
    response.send(persons)
  })
})
 
app.get('/info', (request, response) => {
  Persons.find().then(persons => {
    const res = '<p> PhoneBook has Info for ' + persons.length + ' people</p><p>' + Date().toString() + '</p>'
    response.send(res)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
    Persons.findById(request.params.id).then(person => {
      if(person) {
        response.json(person)
      } else {
        response.status(404).json({ error:  "No record for this Id"})
      }
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
    Persons.findByIdAndDelete(request.params.id).then(person => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const generateId = () => {
  const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
  return id
}

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
    important: Boolean(body.important) || false,
    id: generateId(),
  }

  Persons.create(person).then( person => {
    console.log('note saved!')
    response.json(person)
  })
  .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
    important: Boolean(body.important) || false,
    id: request.params.id
  }
  
  Persons.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const unknownEndpoint = (request, response) => {
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

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)