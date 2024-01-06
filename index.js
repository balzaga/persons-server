const express = require('express')
const morgan = require('morgan')

const app = express()

app.use(express.json())

const cors = require('cors')

app.use(cors())

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(requestLogger)

morgan.token('body', req => {
    return JSON.stringify(req.body)
  })

app.use(morgan('method: :method url: :url status: :status content-length: :res[content-length] date: :date[web] - response-time: :response-time ms :body'))

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "972558899"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "983558822"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "912456987"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "982147258"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
    let out = `Phonebook has info for ${persons.length} people<br />\n<br />\n`;
    out += `${new Date().toUTCString()}`
    response.send(out)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    if (isNaN(id)) {
        return response.status(400).json({ error: 'person id is not a number' })
    }
    console.log('searching for person ', id)
    const person = persons.find(person => person.id === id)
    if (person) {
        console.log('person found', person)
        response.json(person)
    } else {
        console.log('person', id, 'not found')
        response.status(404).end()
    }
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

const generateId = () => {
    const maxId = persons.length > 0
        ? Math.max(...persons.map(n => n.id))
        : 0
    return maxId + 1
}


app.post('/api/persons', (request, response) => {
    const { body } = request
    if (!body) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const exists = persons.find(n => n.name === body.name)
    if (exists) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }
    persons = persons.concat(person)
    response.json(person)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})