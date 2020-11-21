const mongoose = require('mongoose')

const tagSchema = new mongoose.Schema({
    name: {type: String, unique: true, required: true},
})

tagSchema.virtual('blogs',{
    ref: 'blogs',
    localField: '_id',
    foreignField: 'tags'
})

const tags = mongoose.model('tags', tagSchema)
module.exports = tags