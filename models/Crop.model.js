const mongoose = require('mongoose')
const Farmer = require('./Farmer.model')

const cropSchema = new mongoose.Schema({
    name:{type: String, required: true},
    quantity:{type: Number, required: true},
    type:{type:String, required: true},
    variety: {type: String, required: true},
    MSP:{type:Number, required:true},
    owner: {type:mongoose.Schema.Types.ObjectId, required: true, ref:'farmers'},
    biddings:[
        {
            dealer: {type:mongoose.Schema.Types.ObjectId, required: true},
            bid_val: {type:Number, required:true},
        }
    ],
    thumbnail: {type:String, required:true},
    snapshots: [String]
})

cropSchema.index({name:'text', variety:'text', type:'text'})
const Crop = mongoose.model('crops', cropSchema)
Crop.createIndexes()

module.exports = Crop