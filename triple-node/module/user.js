const mongoose = require('mongoose')
const Joi = require('joi')

const userSchema = new mongoose.Schema({
    engFirstName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    engLastName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true
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