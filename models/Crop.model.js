const mongoose = require('mongoose')
const Farmer = require('./Farmer.model')
const faqschema = require('./faq_schema')

const cropSchema = new mongoose.Schema({
    name:{type: String, required: true},
    quantity:{type: Number, required: true},
    type:{type:String, required: true},
    variety: {type: String, required: true},
    MSP:{type:Number, required:true},
    location:  {type: String, required: true},
    pincode: {type: Number, required: true},
    owner: {type:mongoose.Schema.Types.ObjectId, required: true, ref:'farmers'},
    biddings:[
        {
            dealer: {type:mongoose.Schema.Types.ObjectId, required: true},
            bid_val: {type:Number, required:true},
            status: {type:String, required:true, enum:['active', 'accepted', 'sold'], default:'active'}
        }
    ],
    sold: {type:Boolean, required: true},
    thumbnail: {type:String, required:true},
    snapshots: [String],
    faqs: [faqschema],
})

cropSchema.index({name:'text', variety:'text', type:'text', location:'text', pincode:'text'})
const Crop = mongoose.model('crops', cropSchema)
Crop.createIndexes()

module.exports = Crop