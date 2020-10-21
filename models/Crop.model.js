const mongoose = require('mongoose')
const Farmer = require('./Farmer.model')

const cropSchema = new mongoose.Schema({
    name:{type: String, required: true},
    Quantity:{type: Number, required: true},
    description: {type: String, required: true},
    MSP:{type:Number, required:true},
    owner: {type:mongoose.Schema.Types.ObjectId, required: true},
    biddings:[
        {
            dealer: {type:mongoose.Schema.Types.ObjectId, required: true},
            bid_val: {type:Number, required:true},
        }
    ],
    thumbnail: {type:String, required:true},
    snapshots: [String]
})

const Crop = mongoose.model('crops', cropSchema)
module.exports = Crop