const mongoose = require('mongoose')
const Joi = require('joi')

const commentSchema = new mongoose.Schema({
    username: String,
    star: Number,
    tourId: String,
    comment: String,
    updateBy: { type: Date, default: Date.now }
})

const Comment = mongoose.model('Comment', commentSchema)

exports.Comment = Comment