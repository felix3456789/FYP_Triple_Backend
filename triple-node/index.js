const debug = require('debug')('app:startup')
const dbDebug = require('debug')('app:db')
const config = require('config')
const express = require("express")
const Joi = require('joi')
const morgan = require('morgan')
const logger = require('./middleware/logger')
const mongoose = require('mongoose')
const app = express()

const home = require('./routes/home')
const courses = require('./routes/courses')


mongoose.connect('mongodb://chuenpidb.tk:27017/triple', { useNewUrlParser: true })
    .then(() => dbDebug('Connected to MongoDB'))
    .catch(err => dbDebug('Could not connect to MongoDB ', err))

app.set('view engine', 'pug')
app.set('views', './views')

debug(`NODE_ENV: ${process.env.NODE_ENV}`)
debug(`app: ${app.get('env')}`)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use('/', home)
app.use('/app/courses', courses)

debug('Application Name: ' + config.get('name'))

if (app.get('env') === 'development') {
    app.use(morgan('common')) //loggin http 
    debug('Morgan enabled')
}

app.use(logger)

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}`))