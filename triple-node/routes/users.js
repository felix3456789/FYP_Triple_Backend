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
    res.send(users)
})

router.get('/me', auth, async (req, res) => {
    // User.req.username

    const user = await User.findOne({ username: req.user.username }, { password: 0 })
    res.send(user)
})

router.get('/recommendTag', auth, async (req, res) => {
    const recommendTags = await User.findOne({ username: req.user.username }, { recommendTags: 1, username: 1 })
    console.log(recommendTags)
    res.send(recommendTags)
})

//update Info
router.post('/updateInfo', auth, async (req, res) => {
    const { error } = validateUpdateUserInfo(req.body)
    if (error) {
        console.log(req.body)
        console.log(error.details[0].message)
        return res.status(400).send(error.details[0].message)
    }

    let user = await User.findOne({ username: req.user.username }, { password: 0 })

    console.log("Setting")
    console.log("BOD", req.body.BOD)
    console.log("newPassportDate", req.body.passportDate)
    const newBOD = new Date(req.body.BOD)
    const newPassportDate = new Date(req.body.passportDate)

    user.set({
        firstNameEng: req.body.firstNameEng, lastNameEng: req.body.lastNameEng,
        title: req.body.title, BOD: newBOD, passportNum: req.body.passportNum,
        passportDate: newPassportDate, email: req.body.email, phoneNum: req.body.phoneNum,
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
        userNewFriend.forEach(friend => {
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

//delete Friend
router.post('/delFriend/:name', auth, async (req, res) => {

    let user = await User.findOne({ username: req.user.username }, { password: 0 })
    const userNewFriend = user.Friend

    const temp = _.remove(userNewFriend, function (n) {
        return n.friendName == req.params.name;
    });
    console.log("delete", temp)
    if (temp.length == 0) return res.status(400).send("No such friend!")

    user.set({ Friend: userNewFriend })
    user.markModified('Friend')
    await user.save()

    res.send(`${temp[0].friendName} has been moved!`)
})

//add Payment
router.post('/addPayment', auth, async (req, res) => {
    const { error } = validateAddPayment(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({ username: req.user.username }, { password: 0 })
    const newPayment = user.Payment
    if (user.Payment.length > 0) {
        let sameNum = false
        newPayment.forEach(payment => {
            if (payment.cardNumber == req.body.cardNumber) {
                sameNum = true
            }
        });
        if (sameNum) return res.status(400).send("The card is already add to your account.")
    }
    const card = _.pick(req.body, ['cardNumber', 'cardHolderName'])

    newPayment.push(card)
    user.set({ Payment: newPayment })
    user.markModified('Payment')
    user = await user.save()
    res.send(_.pick(user, ['_id', 'username', 'email', 'Payment']))
})



//delete Payment
router.post('/delPayment/:cardNum', auth, async (req, res) => {

    let user = await User.findOne({ username: req.user.username }, { password: 0 })
    const newPayment = user.Payment

    const temp = _.remove(newPayment, function (n) {
        return n.cardNumber == req.params.cardNum;
    });
    console.log("delete", temp)
    if (temp.length == 0) return res.status(400).send("No such card!")

    user.set({ Payment: newPayment })
    user.markModified('Payment')
    await user.save()

    res.send(`${temp[0].cardNumber} has been removed!`)
})

//add EmerContact
router.post('/addEmerContact', auth, async (req, res) => {
    const { error } = validateAddEmerContact(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({ username: req.user.username }, { password: 0 })
    const newEmerContact = user.EmerContact
    if (user.EmerContact.length > 0) {
        let same = false
        newEmerContact.forEach(contact => {
            if (contact.emerContactName == req.body.emerContactName) {
                same = true
            }
        });
        if (same) return res.status(400).send("This person is already add to your emergency contact.")
    }
    const contact = _.pick(req.body, ['emerContactName', 'relationship', 'email', 'phoneNum'])

    newEmerContact.push(contact)
    user.set({ EmerContact: newEmerContact })
    user.markModified('EmerContact')
    user = await user.save()
    res.send(_.pick(user, ['_id', 'username', 'email', 'EmerContact']))
})

//delete EmerContact
router.post('/delEmerContact/:name', auth, async (req, res) => {

    let user = await User.findOne({ username: req.user.username }, { password: 0 })
    const newEmerContact = user.EmerContact

    const temp = _.remove(newEmerContact, function (n) {
        return n.emerContactName == req.params.name;
    });
    console.log("delete", temp)
    if (temp.length == 0) return res.status(400).send("No such person!")

    user.set({ EmerContact: newEmerContact })
    user.markModified('EmerContact')
    await user.save()

    res.send(`${temp[0].emerContactName} has been removed!`)
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

function validateAddPayment(user) {
    const schema = {
        cardNumber: Joi.string().min(3).max(50).required(),
        cardHolderName: Joi.string().min(3).max(100).required(),
    }

    return Joi.validate(user, schema)
}

function validateAddEmerContact(user) {
    const schema = {
        emerContactName: Joi.string().min(3).max(50).required(),
        relationship: Joi.string().min(1).max(50).required(),
        email: Joi.string().min(3).max(255).required().email(),
        phoneNum: Joi.string().min(5).max(20).required(),
    }

    return Joi.validate(user, schema)
}

module.exports = router;
