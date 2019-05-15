const debug = require('debug')('app:startup')
const dbDebugger = require('debug')('app:db')
const config = require('config')
const express = require("express")
const Joi = require('joi')
const morgan = require('morgan')
const logger = require('./logger')
const app = express()



debug(`NODE_ENV: ${process.env.NODE_ENV}`)
debug(`app: ${app.get('env')}`)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

debug('Application Name: ' + config.get('name'))

if (app.get('env') === 'development') {
    app.use(morgan('common')) //loggin http 
    debug('Morgan enabled')
}


app.use(logger)

app.use(function (req, res, next) {
    console.log('Authenticating')
    next()
})

const courses = [
    { id: 1, name: 'course1' },
    { id: 2, name: 'course2' },
    { id: 3, name: 'course3' },
]

app.get('/', (req, res) => {
    res.send('Hello!')
})

app.get('/api/courses', (req, res) => {
    res.send([1, 2, 3])
})

app.get('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id))
    if (!course) return res.status(404).send('The course not found')
    res.send(course)
})

app.post('/api/courses', (req, res) => {
    const { error } = validateCourse(req.body)

    if (error) return res.status(400).send(error.details[0].message)

    const course = {
        id: courses.length + 1,
        name: req.body.name
    }
    courses.push(course)
    res.send(course)
})

app.put('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id))
    if (!course) return res.status(404).send('The course not found')

    const { error } = validateCourse(req.body)

    if (error) return res.status(400).send(error.details[0].message)

    course.name = req.body.name
    res.send(course)

})

app.delete('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id))
    if (!course) return res.status(404).send('The course not found')

    const index = courses.indexOf(course)
    courses.splice(index, 1)

    res.send(course)
})

function validateCourse(course) {
    const schema = {
        name: Joi.string().min(3).required()
    }
    return Joi.validate(course, schema)
}


const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}`))