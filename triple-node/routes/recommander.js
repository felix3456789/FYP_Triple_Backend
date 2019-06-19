const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Joi = require('joi')
const { User } = require('../module/user')
const { Tour } = require('../module/tour')
const _ = require('lodash')

router.post('/insert', auth, async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({ username: req.body.username })
    if (!user) return res.status(400).send('User not found!')

    let newHistoryCounter = user.historyCounter + 1
    let newHistoryArr = user.history

    newHistoryArr.push(req.body.tourId)
    if (newHistoryArr.length > 100) newHistoryArr.shift

    if (newHistoryCounter % 5 == 0) {
        newHistoryCounter = 0
        newRecommandTags = await recommander(newHistoryArr)
        user.set({ recommendTags: newRecommandTags, history: newHistoryArr })
    }
    user.set({ historyCounter: newHistoryCounter })
    await user.save()
    console.log(user.historyCounter)
    res.send("History Updated!")
})



async function recommander(historyArr) {

    let newRecommandTags = []
    const allHashtag = []
    await Promise.all(historyArr.map(async (tour) => {
        const hashtags = await Tour.find({ tourID: tour }, { '_id': 0, 'hashtags': 1 })

        hashtags[0].toObject().hashtags.map(hashtag => {
            allHashtag.push(hashtag.title)
        })
    }))
    const groupTag = _.groupBy(allHashtag)

    for (var tag in groupTag) {
        const newTag = {
            title: tag,
            score: groupTag[tag].length
        }
        newRecommandTags.push(newTag)
    }

    newRecommandTags = _.sortBy(newRecommandTags)
    newRecommandTags = _.take(newRecommandTags, 10)
    console.log(newRecommandTags)
    return newRecommandTags
}


function validate(user) {
    const schema = {
        username: Joi.string().min(5).max(20).required(),
        tourId: Joi.string().required()
    }
    return Joi.validate(user, schema)
}

module.exports = router;
