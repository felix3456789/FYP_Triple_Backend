const mongoose = require('mongoose')

const purchaseSchema = new mongoose.Schema({
    username: String,
    tourId: String,
    tourName: String,
    departureDate: Date,
    totalPrice: Number,
    numOfAdult: Number,
    numOfChild: Number,
    updateBy: { type: Date, default: Date.now }
})

const Purchase = mongoose.model('Purchase', purchaseSchema)

exports.Purchase = Purchase