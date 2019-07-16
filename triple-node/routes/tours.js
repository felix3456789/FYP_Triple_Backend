const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

const { Tour, validate } = require('../module/tour')

router.get('/', async (req, res) => {
    const tours = await Tour.find().limit(20)
    const convTours = tours.map((tour) => { return tour.toObject() })
    // res.send(JSON.stringify(convTours))
    console.log(new Date())
    res.send(convTours)

})

router.get('/search/:keyword', async (req, res) => {
    const searchString = req.params.keyword
    var array = searchString.split("+");
    const regex = array.join("|");
    var query = {
        $or: [
            { title: { $regex: regex, $options: 'i' } },
            { tourID: { $regex: regex, $options: 'i' } },
            { 'hashtags.title': { $regex: regex, $options: 'i' } },
            { 'tags.title': { $regex: regex, $options: 'i' } },
            { 'days.title': { $regex: regex, $options: 'i' } },
            { 'days.content': { $regex: regex, $options: 'i' } },
            { 'days.eat': { $regex: regex, $options: 'i' } },
            { 'days.stay': { $regex: regex, $options: 'i' } }
        ]
    }
    const tours = await Tour.find(query, { prices: 0, availableDate: 0, days: 0, notes: 0 }).limit(10)
    const convTours = tours.map((tour) => { return tour.toObject() })
    console.log(new Date())
    res.send(convTours)
})

router.get('/search/:keyword/:page', async (req, res) => {
    const searchString = req.params.keyword
    const page = req.params.page
    var array = searchString.split("+");
    const regex = array.join("|");
    var query = {
        $or: [
            { title: { $regex: regex, $options: 'i' } },
            { tourID: { $regex: regex, $options: 'i' } },
            { 'hashtags.title': { $regex: regex, $options: 'i' } },
            { 'tags.title': { $regex: regex, $options: 'i' } },
            { 'days.title': { $regex: regex, $options: 'i' } },
            { 'days.content': { $regex: regex, $options: 'i' } },
            { 'days.eat': { $regex: regex, $options: 'i' } },
            { 'days.stay': { $regex: regex, $options: 'i' } }
        ]
    }
    const pageCount = Math.ceil((await Tour.count(query)) / 10)
    const tours = await Tour.find(query, { prices: 0, availableDate: 0, days: 0, notes: 0 }).limit(10).skip((page - 1) * 10)
    const convTours = tours.map((tour) => { return tour.toObject() })
    console.log(new Date())
    res.send({ data: convTours, totalPage: pageCount })
})

router.get('/recommanded/:keyword', async (req, res) => {
    const searchString = req.params.keyword
    const tours = await Tour.aggregate([
        {
            $match: { 'hashtags.title': searchString }
        }, {
            $sample: { size: 5 }
        }, {
            $project: {
                prices: 0,
                days: 0,
                availableDate: 0,
                notes: 0
            }
        }
    ]);
    const convTours = tours
    console.log(new Date())
    res.send(convTours)
})

router.get('/:id', async (req, res) => {
    const tours = await Tour.find({ tourID: req.params.id })
    if (!tours) return res.status(404).send('The tour not found')
    const convTours = tours.map((tour) => { return tour.toObject() })
    console.log(new Date())
    res.send(convTours)
})

router.get('/feature/tour/:count', async (req, res) => {

    const tours = await Tour.aggregate([
        {
            $match: { feature: true }
        }, {
            $sample: { size: parseInt(req.params.count) }
        }, {
            $project: {
                tourID: 1,
                image: 1,
                title: 1,
                tags: 1,
                originalPrice: 1,
                salesPrice: 1,
                likeCount: 1,
                commentCount: 1,
                rating: 1,
            }
        }
    ]);
    const convTours = tours
    console.log(new Date())
    res.send(convTours)
})


// router.post('/', (req, res) => {
//     const { error } = validateCourse(req.body)

//     if (error) return res.status(400).send(error.details[0].message)

//     const course = {
//         id: courses.length + 1,
//         name: req.body.name
//     }
//     courses.push(course)
//     res.send(course)
// })

// router.put('/:id', (req, res) => {
//     const course = courses.find(c => c.id === parseInt(req.params.id))
//     if (!course) return res.status(404).send('The course not found')

//     const { error } = validateCourse(req.body)

//     if (error) return res.status(400).send(error.details[0].message)

//     course.name = req.body.name
//     res.send(course)

// })

// router.delete('/:id', (req, res) => {
//     const course = courses.find(c => c.id === parseInt(req.params.id))
//     if (!course) return res.status(404).send('The course not found')

//     const index = courses.indexOf(course)
//     courses.splice(index, 1)

//     res.send(course)
// })

module.exports = router;
