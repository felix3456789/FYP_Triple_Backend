const mongoose = require('mongoose')
const express = require('express')
const _ = require('lodash')
const Joi = require('joi')
const auth = require('../middleware/auth')

const router = express.Router()
const { User } = require('../module/user')
const { Purchase } = require('../module/purchase')
const { Tour } = require('../module/tour')

router.post('/', auth, async (req, res) => {

    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({ username: req.user.username })
    if (!user) return res.status(400).send('User not found!')

    let tour = await Tour.findOne({ tourID: req.body.tourId })
    if (!tour) return res.status(404).send('The tour not found')

    let purchase = new Purchase(_.pick(req.body, ['tourId', 'tourName', 'departureDate', 'totalPrice', 'numOfAdult', 'numOfChild']))
    purchase.username = req.user.username

    purchase = await purchase.save()

    res.send(purchase)
})

router.get('/', auth, async (req, res) => {

    let user = await User.findOne({ username: req.user.username })
    if (!user) return res.status(400).send('User not found!')

    const purchaseHistorys = await Purchase.find({ username: req.user.username })

    res.send(purchaseHistorys)
})




function validate(body) {

    const schema = {
        tourId: Joi.string().min(5).max(30).required(),
        tourName: Joi.string().min(5).max(30).required(),
        departureDate: Joi.string().min(5).max(30).required(),
        totalPrice: Joi.number().min(0).required(),
        numOfAdult: Joi.number().min(0).max(30).required(),
        numOfChild: Joi.number().min(0).max(30).required(),
    }
    return Joi.validate(body, schema)
}

module.exports = router;
