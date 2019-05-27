const mongoose = require('mongoose')
const Joi = require('joi')


const tagSchema = new mongoose.Schema({
    title: string,
    updateBy: Date
})

const Tag = mongoose.model('Tag', tagSchema)

exports.Tour = Tour