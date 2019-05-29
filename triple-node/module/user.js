const mongoose = require('mongoose')
const Joi = require('joi')

const userSchema = new mongoose.Schema({
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
        required: true
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
    disable: {
        type: Boolean,
        default: false
    }
})

const User = mongoose.model('User', userSchema)

function validateUser(user) {
    const schema = {
        engFirstName: Joi.string().min(3).max(50).required(),
        engLastName: Joi.string().min(3).max(50).required(),
        email: Joi.string().required(),
        disable: Joi.boolean()
    }
    return Joi.validate(user, schema)
}

exports.User = User
exports.validate = validateUser