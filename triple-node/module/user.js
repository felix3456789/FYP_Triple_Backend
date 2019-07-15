const mongoose = require('mongoose')
const Joi = require('joi')
const jwt = require('jsonwebtoken')
const config = require('config')

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
    Payment: {
        type: Object
    },
    Friend: {
        type: [Object]
    },
    EmerContact: {
        type: [Object]
    },
    recommendTags: {
        type: [Object]
    },
    history: {
        type: [String]
    },
    historyCounter: {
        type: Number,
        default: 0
    },
    bookmark: {
        type: [String],
    },
    like: {
        type: [String],
    },
    disable: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: "user"
    }
})

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ username: this.username, role: this.role }, config.get('jwtPrivateKey'))
    return token
}

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