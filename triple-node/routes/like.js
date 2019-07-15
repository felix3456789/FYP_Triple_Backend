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

    console.log(user.username)
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

    let newLikeCount = tour.likeCount
    newLikeCount = same ? newLikeCount - 1 : newLikeCount + 1
    if (newLikeCount < 0) newLikeCount = 0
    tour.set({ likeCount: newLikeCount })
    await tour.save()

    user.set({ like: newLike })
    user.markModified('like')
    await user.save()
    console.log(user.like)
    res.send("Comment Success!")

})


router.get('/', auth, async (req, res) => {
    let user = await User.findOne({ username: req.user.username })
    if (!user) return res.status(400).send('User not found!')
    let newLike = user.like

    res.send(newLike)

})


module.exports = router;