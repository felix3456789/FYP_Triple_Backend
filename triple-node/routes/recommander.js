const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Joi = require('joi')
const { User } = require('../module/user')
const { Tour } = require('../module/tour')
const _ = require('lodash')

router.post('/insert', auth, async (req, res) => {
    res.send("History Updated!")
    const { error } = validate(req.body)
    if (error) return 0

    let user = await User.findOne({ username: req.user.username })
    if (!user) return 0

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

})



async function recommander(historyArr) {

    let newRecommandTags = []
    const allHashtag = []
    const numOfHistory = historyArr.length
    await Promise.all(historyArr.map(async (tour, index) => {
        const hashtags = await Tour.find({ tourID: tour }, { '_id': 0, 'hashtags': 1 })

        hashtags[0].toObject().hashtags.map(hashtag => {
            let ratio = 1
            if (index > Math.floor(0.4 * numOfHistory) && index <= Math.floor(0.6 * numOfHistory)) {
                ratio = 2
            } else if (index > Math.floor(0.6 * numOfHistory) && index <= Math.floor(0.8 * numOfHistory)) {
                ratio = 5
            } else if (index > Math.floor(0.8 * numOfHistory) && index <= Math.floor(0.9 * numOfHistory)) {
                ratio = 10
            } else if (index > Math.floor(0.9 * numOfHistory) && index <= Math.floor(0.95 * numOfHistory)) {
                ratio = 20
            }
            else if (index > Math.floor(0.95 * numOfHistory) && index <= Math.floor(numOfHistory)) {
                ratio = 45
            }

            for (var i = 0; i < ratio; i++) {
                allHashtag.push(hashtag.title)
            }
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

    newRecommandTags = _.orderBy(newRecommandTags, ['score'], ['desc'])
    newRecommandTags = _.take(newRecommandTags, 10)
    console.log(newRecommandTags)
    return newRecommandTags
}


function validate(user) {
    const schema = {
        tourId: Joi.string().required()
    }
    return Joi.validate(user, schema)
}

module.exports = router;
