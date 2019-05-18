const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

const tourSchema = new mongoose.Schema({
    _id: String,
    title: String,
    day: Number,
    tags: [String],
    price: Number,
    availableDate: [Date],
    image: [String],
    detail: String,
    Disable: { type: Boolean, default: false },
    Feature: { type: Boolean, default: false },
    days: [{
        day: String,
        title: String,
        content: String,
        eat: [String],
        stay: String
    }],
    updateBy: Date
})
const Tour = mongoose.model('Tour', tourSchema, 'tour')


router.get('/', async (req, res) => {
    const tours = await Tour.find()
    const convTours = tours.map((tour) => { return tour.toObject() })
    // res.send(JSON.stringify(convTours))
    console.log(tours)
    res.send(tours)
})

// router.get('/:id', (req, res) => {
//     const course = courses.find(c => c.id === parseInt(req.params.id))
//     if (!course) return res.status(404).send('The course not found')
//     res.send(course)
// })

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

// function validateCourse(course) {
//     const schema = {
//         name: Joi.string().min(3).required()
//     }
//     return Joi.validate(course, schema)
// }

module.exports = router;
