const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Joi = require('joi')
const _ = require('lodash')
const { Comment } = require('../module/comment')
const { User } = require('../module/user')
const { Tour } = require('../module/tour')

router.post('/insert', auth, async (req, res) => {

    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({ username: req.user.username })
    if (!user) return res.status(400).send('User not found!')

    let tour = await Tour.findOne({ tourID: req.body.tourId })
    if (!tour) return res.status(404).send('The tour not found')

    let comment = new Comment(_.pick(req.body, ['tourId', 'star', 'comment']))
    comment.username = req.user.username


    comment = await comment.save()


    const count = await Comment.countDocuments({ tourId: req.body.tourId });
    const newRating = calRating(tour.rating, req.body.star, count)
    tour.set({ commentCount: count, rating: newRating })
    await tour.save()

    res.send("Comment Success!")

})

router.get('/:id/:page', async (req, res) => {
    const tours = await Tour.find({ tourID: req.params.id })
    if (!tours) return res.status(404).send('The tour not found')
    console.log(req.params.page)
    let comments
    if (req.params.page != 1) {
        const skipCount = ((req.params.page - 2) * 5) + 3
        comments = await Comment.find({ tourId: req.params.id }).skip(skipCount).limit(5)
    } else {
        comments = await Comment.find({ tourId: req.params.id }).limit(3)
    }
    res.send(comments)
})

function calRating(oldRating, rating, commentCount) {
    return ((oldRating * commentCount) + rating) / (commentCount + 1)
}

function validate(comment) {
    const schema = {
        tourId: Joi.string().required(),
        star: Joi.number().max(5).required(),
        comment: Joi.string().required()
    }
    return Joi.validate(comment, schema)
}

module.exports = router;