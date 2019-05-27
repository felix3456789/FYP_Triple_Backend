const mongoose = require('mongoose')
const Joi = require('joi')

const tourSchema = new mongoose.Schema({
    tourId: String,
    title: { type: String, required: true },
    day: Number,
    tags: [{
        id: Number,
        title: String,
        updatedBy: Date
    }],
    originalPrice: Number,
    salesPrice: Number,
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

const Tour = mongoose.model('Tour', tourSchema)

// function validateCourse(course) {
//     const schema = {
//         name: Joi.string().min(3).required()
//     }
//     return Joi.validate(course, schema)
// }

exports.Tour = Tour
// exports.validate = validateCourse