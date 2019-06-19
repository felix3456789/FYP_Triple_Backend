const mongoose = require('mongoose')
const express = require('express')
const _ = require('lodash')
const bcrypt = require('bcrypt')
const router = express.Router()
const auth = require('../middleware/auth')

const { User, validate } = require('../module/user')

router.get('/', async (req, res) => {
    const users = await User.find().sort('name')
    console.log(users)
    res.send(users)
})

router.get('/me', auth, async (req, res) => {
    // User.req.username

    const users = await User.findOne({ username: req.user.username }, { password: 0 })
    console.log(users)
    res.send(users)
})

//Register
router.post('/', async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({ username: req.body.username })
    if (user) return res.status(400).send('User already register')

    user = new User(_.pick(req.body, ['username', 'email', 'firstNameEng', 'lastNameEng', 'password']))

    //Hashing Password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)
    console.log(user)

    user = await user.save()

    res.send(_.pick(user, ['_id', 'username', 'email']))
})

module.exports = router;
