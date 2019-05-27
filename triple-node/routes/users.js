const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

const { User, validate } = require('../module/user')

router.get('/', async (req, res) => {
    const users = await User.find().sort('name')
    console.log(users)
    res.send(users)
})

router.post('/', async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let user = new User({
        engFirstName: req.body.engFirstName,
        engLastName: req.body.engLastName,
        email: req.body.email,
        disable: req.body.disable
    })

    user = await user.save()

    res.send(user)
})



module.exports = router;