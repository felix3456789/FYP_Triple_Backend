const mongoose = require('mongoose')


mongoose.connect('mongodb://chuenpidb.tk:27017/triple', { useNewUrlParser: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('Could not connect to MongoDB ', err))

const tourSchema = new mongoose.Schema({
    _id: String,
    title: String,
    day: Number,
    tags: [String],
    price: Number,
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

//Add Docunment
const Tour = mongoose.model('Tour', tourSchema, 'tour')
// const tour = new Tour({
// })


//Get Docunment
async function getTour() {
    try {
        const tours = await Tour.find()
        console.log(tours[0].days)
    } catch (err) {
        throw err
    }
}

getTour()