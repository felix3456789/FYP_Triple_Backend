const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

const { Tag } = require('../module/tag')

router.get('/', async (req, res) => {
    const tags = await Tag.find().limit(30)
    const convTags = tags.map((tag) => { return tag.toObject().title })
    // res.send(JSON.stringify(convTours))
    console.log(new Date())
    res.send(convTags)

})

router.get('/limit/:count', async (req, res) => {
    var count = await Tag.count();
    const tags = []
    limit = parseInt(req.params.count) >= count ? 20 : parseInt(req.params.count)
    for (let i = 0; i < limit; i++) {
        var random = Math.floor(Math.random() * count);
        const tag = await Tag.findOne().skip(random)
        console.log(tag)
        tags.push(tag)
    }
    const convTags = tags.map((tag) => { return tag.toObject().title })
    // res.send(JSON.stringify(convTours))
    console.log(new Date())
    res.send(convTags)

})

module.exports = router;