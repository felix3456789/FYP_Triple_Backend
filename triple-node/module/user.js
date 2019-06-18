const mongoose = require('mongoose')
const Joi = require('joi')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: 5,
        maxlength: 20,
        required: true
    },
    firstNameEng: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
    },
    lastNameEng: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    title: {
        type: String,
    },
    passportNum: {
        type: String
    },
    passportDate: {
        type: Date
    },
    phoneNum: {
        type: Number
    },
    BOD: {
        type: Date
    },
    Credit: {
        type: Number,
        default: 0
    },
    Friend: {
        type: [Object]
    },
    recommendTags: {
        type: [String]
    },
    history: {
        type: [String]
    },
    historyCounter: {
        type: Number,
        default: 0
    },
    disable: {
        type: Boolean,
        default: false
    }
})

const User = mongoose.model('User', userSchema)

function validateUser(user) {
    const schema = {
        username: Joi.string().min(5).max(20).required(),
        firstNameEng: Joi.string().min(3).max(50).required(),
        lastNameEng: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(3).max(255).required().email(),
        password: Joi.string().min(5).max(30).required(),
        disable: Joi.boolean()
    }
    return Joi.validate(user, schema)
}

exports.User = User
exports.validate = validateUser