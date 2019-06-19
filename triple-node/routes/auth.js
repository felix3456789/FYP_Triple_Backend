const mongoose = require('mongoose')
const express = require('express')
const _ = require('lodash')
const bcrypt = require('bcrypt')
const Joi = require('joi')


const router = express.Router()
const { User } = require('../module/user')

//Login
router.post('/', async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({ username: req.body.username })
    if (!user) return res.status(400).send('Invalid username or password')

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) return res.status(400).send('Invalid username or password')

    const token = user.generateAuthToken()
    console.log(token)
    res.header('x-auth-token',token).send(token)
})


function validate(user) {
    const schema = {
        username: Joi.string().min(5).max(20).required(),
        password: Joi.string().min(5).max(30).required()
    }
    return Joi.validate(user, schema)
}

module.exports = router;
