const mongoose = require('mongoose')
const express = require('express')
const _ = require('lodash')
const Joi = require('joi')
const bcrypt = require('bcrypt')
const router = express.Router()
const auth = require('../middleware/auth')

const { User, validate } = require('../module/user')

router.get('/', async (req, res) => {
    const users = await User.find().sort('name')
    console.log(users)
    res.send(users)
})

router.get('/me', auth, async (req, res) => {
    // User.req.username

    const users = await User.findOne({ username: req.user.username }, { password: 0 })
    console.log(users)
    res.send(users)
})

router.get('/recommendTag', auth, async (req, res) => {
    const recommendTags = await User.findOne({ username: req.user.username }, { recommendTags: 1, username: 1 })
    console.log(recommendTags)
    res.send(recommendTags)
})

//update Info
router.post('/updateInfo', auth, async (req, res) => {
    const { error } = validateUpdateUserInfo(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({ username: req.user.username }, { password: 0 })

    user.set({
        firstNameEng: req.body.firstNameEng, lastNameEng: req.body.lastNameEng,
        title: req.body.title, BOD: new Date(req.body.BOD), passportNum: req.body.passportNum,
        passportDate: new Date(req.body.passportDate), email: req.body.email, phoneNum: req.body.phoneNum,
    })
    user = await user.save()
    // {
    //     firstNameEng
    //     lastNameEng
    //     title
    //     BOD
    //     passportNum
    //     passportDate
    //     email
    //     phoneNum
    // }

    console.log(user)

    res.send(_.pick(user, ['_id', 'username', 'email']))
})

//add Friend
router.post('/addFriend', auth, async (req, res) => {
    const { error } = validateAddFriend(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({ username: req.user.username }, { password: 0 })
    const userNewFriend = user.Friend
    if (user.Friend.length > 0) {
        let sameName = false
        user.Friend.forEach(friend => {
            if (friend.friendName == req.body.friendName) {
                sameName = true
            }
        });
        if (sameName) return res.status(400).send("There is a friend with same name! Please choose another name.")
    }
    const friend = _.pick(req.body, ['friendName', 'firstNameEng', 'lastNameEng', 'title', 'passportNum', 'email', 'phoneNum'])
    friend.BOD = new Date(req.body.BOD)
    friend.passportDate = new Date(req.body.passportDate)
    console.log(friend)

    userNewFriend.push(friend)
    user.set({ Friend: userNewFriend })
    user.markModified('Friend')
    user = await user.save()

    res.send(_.pick(user, ['_id', 'username', 'email', 'Friend']))
})

//Register
router.post('/', async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({ username: req.body.username })
    if (user) return res.status(400).send('User already register')

    user = new User(_.pick(req.body, ['username', 'email', 'firstNameEng', 'lastNameEng', 'password']))

    //Hashing Password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)
    console.log(user)

    user = await user.save()

    res.send(_.pick(user, ['_id', 'username', 'email']))
})

function validateUpdateUserInfo(user) {
    const schema = {
        firstNameEng: Joi.string().min(3).max(50).required(),
        lastNameEng: Joi.string().min(3).max(50).required(),
        title: Joi.string().min(1).max(50).required(),
        BOD: Joi.string().required(),
        passportNum: Joi.string().min(3).max(50).required(),
        passportDate: Joi.string().required(),
        email: Joi.string().min(3).max(255).required().email(),
        phoneNum: Joi.string().min(5).max(20).required(),
    }

    return Joi.validate(user, schema)
}

function validateAddFriend(user) {
    const schema = {
        friendName: Joi.string().min(3).max(50).required(),
        firstNameEng: Joi.string().min(3).max(50).required(),
        lastNameEng: Joi.string().min(3).max(50).required(),
        title: Joi.string().min(1).max(50).required(),
        BOD: Joi.string().required(),
        passportNum: Joi.string().min(3).max(50).required(),
        passportDate: Joi.string().required(),
        email: Joi.string().min(3).max(255).required().email(),
        phoneNum: Joi.string().min(5).max(20).required(),
    }

    return Joi.validate(user, schema)
}

module.exports = router;
