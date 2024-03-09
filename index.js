const morgan = require('morgan')
const cors = require('cors')

let persons = [
  {
    id: 1,
    name: "sandip",
    number: "1000",
    important: true
  }
]

const express = require('express')
const app = express()
app.use(cors())
app.use(express.json()) //used for parsing json

//morgan for logging
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'));

morgan.token('content', function(req, res) {
    return JSON.stringify(req.body)
});

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})
 

app.get('/info', (request, response) => {
  const res = '<p> PhoneBook has Info for ' + persons.length + ' people</p><p>' + Date().toString() + '</p>'
  response.send(res)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const p = persons.find(p => p.id === id)

    if (p) {
        response.json(p)
    } else {
      const error = "No record for this " + id
      return response.status(404).json({ 
        error: error
      })
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const exists = persons.some((element) => element.id === id);
    if(exists) {
      persons = persons.filter(p => p.id !== id)
      response.status(204).end()
    } else {
      const error = "No record for this " + id
      return response.status(404).json({ 
        error: error
      })
    }
})

const generateId = () => {
  const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
  return id
}

const isDuplicate = (name) => {
  return persons.some((element) => element.name === name);
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number || isDuplicate(body.name)) {
    return response.status(400).json({ 
      error: 'error in content'
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    important: Boolean(body.important) || false,
    id: generateId(),
  }

  persons = persons.concat(person)

  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)