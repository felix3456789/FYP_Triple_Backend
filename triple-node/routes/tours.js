const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

const { Tour, validate } = require('../module/tour')



router.get('/', async (req, res) => {
    const tours = await Tour.find()
    const convTours = tours.map((tour) => { return tour.toObject() })
    // res.send(JSON.stringify(convTours))
    console.log(convTours)
    res.send(convTours)

})

router.get('/:id', async (req, res) => {
    const tours = await Tour.find({ tourID: req.params.id })
    if (!tours) return res.status(404).send('The course not found')
    const convTours = tours.map((tour) => { return tour.toObject() })
    console.log(convTours)
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
