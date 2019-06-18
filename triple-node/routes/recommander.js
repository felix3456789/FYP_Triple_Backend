const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

const { User } = require('../module/user')

router.post('/insert', async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({ username: req.body.username })
    if (!user) return res.status(400).send('User not found!')

    
    
    res.send(token)
})

module.exports = router;
