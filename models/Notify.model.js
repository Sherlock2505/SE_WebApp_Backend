const mongoose = require('mongoose')

const notifySchema = new mongoose.Schema({
    type: {type: String, required: true, enum:["Bid Placed", "Bid Accepted"]},
    msg: {type: String, required: true},
    url: {type: String, required: true},
},{
    timestamps: true
})

const notify = mongoose.model('notifications', notifySchema)
module.exports = notify