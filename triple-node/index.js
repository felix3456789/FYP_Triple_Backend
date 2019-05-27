const dbDebug = require('debug')('app:db')
const config = require('config')
const express = require("express")
const logger = require('./middleware/logger')
const mongoose = require('mongoose')


const app = express()

const home = require('./routes/home')
const tours = require('./routes/tours')
const users = require('./routes/users')


mongoose.connect('mongodb://chuenpidb.tk:27017/triple', { useNewUrlParser: true })
    .then(() => dbDebug('Connected to MongoDB'))
    .catch(err => dbDebug('Could not connect to MongoDB ', err))

app.set('view engine', 'pug')
app.set('views', './views')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use('/', home)
app.use('/api/tour', tours)
app.use('/api/user', users)

app.use(logger)

const port = process.env.PORT || 3000
app.listen(port, '0.0.0.0', () => console.log(`Listening on port ${port}`))
