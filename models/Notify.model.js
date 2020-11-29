const mongoose = require('mongoose')

const notifySchema = new mongoose.Schema({
    type: {type: String, required: true, enum:["Bid Placed", "Bid Accepted", "Blog Recommendation"]},
    msg: {type: String, required: true},
    url: {type: mongoose.Schema.Types.ObjectId, required: true},
    subject: {type: mongoose.Schema.Types.ObjectId, required: true}
},{
    timestamps: true
})

const notify = mongoose.model('notifications', notifySchema)
module.exports = notify