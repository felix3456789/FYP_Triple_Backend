const mongoose = require('mongoose')
const Joi = require('joi')

mongoose.set('useCreateIndex', true);

const tourSchema = new mongoose.Schema({
    tourID: String,
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
    feature: { type: Boolean, default: false },
    days: [{
        day: String,
        title: String,
        content: String,
        eat: [String],
        stay: String
    }],
    updateBy: Date,
    commentCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
})

tourSchema.index({ title: 'text', tourID: 'text', 'tags.title': 'text', 'hashtags.title': 'text' })

const Tour = mongoose.model('tours', tourSchema)
// function validateCourse(course) {
//     const schema = {
//         name: Joi.string().min(3).required()
//     }
//     return Joi.validate(course, schema)
// }

exports.Tour = Tour
// exports.validate = validateCourse