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
    let newBookmark = user.bookmark
    newBookmark.forEach(tour => {
        if (tour == tourID) same = true
    })
    same ? _.pull(newBookmark, tourID) : newBookmark.push(tourID)

    user.set({ bookmark: newBookmark })
    user.markModified('bookmark')
    await user.save()
    res.send("Comment Success!")

})

router.get('/', auth, async (req, res) => {
    let user = await User.findOne({ username: req.user.username })
    if (!user) return res.status(400).send('User not found!')
    let newBookmark = user.bookmark

    res.send(newBookmark)

})



module.exports = router;