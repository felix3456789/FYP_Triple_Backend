const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Joi = require('joi')
const _ = require('lodash')
const { User } = require('../module/user')
const { Tour } = require('../module/tour')

router.post('/:tourId', auth, async (req, res) => {

    let user = await User.findOne({ username: req.user.username })
    if (!user) return res.status(400).send('User not found!')

    let tour = await Tour.findOne({ tourID: req.params.tourId })
    if (!tour) return res.status(404).send('The tour not found')

    const tourID = req.params.tourId
    var same = false
    let newLike = user.like
    console.log(user.like)
    newLike.forEach(tour => {
        if (tour == tourID) same = true
    })
    console.log(newLike)
    same ? _.pull(newLike, tourID) : newLike.push(tourID)
    console.log(newLike)

    user.set({ like: newLike })
    user.markModified('like')
    await user.save()
    console.log(user.like)
    res.send("Comment Success!")

})


module.exports = router;