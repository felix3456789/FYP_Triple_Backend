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
    var count = Tag.count();
    var random = Math.floor(Math.random() * count);
    limit = parseInt(req.params.count) >= count? 20:parseInt(req.params.count)
    const tags = await Tag.find().limit(limit).skip(random)
    const convTags = tags.map((tag) => { return tag.toObject().title })
    // res.send(JSON.stringify(convTours))
    console.log(new Date())
    res.send(convTags)

})

module.exports = router;