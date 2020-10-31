const mongoose = require('mongoose')
const comments = require('./comment_schema')

const blogSchema = new mongoose.Schema({
    title:{type: String, required: true},
    subtitle: {type: String, required: true},
    content: {type: String, required: true},
    thumbnail: {type: String, required: true},
    owner: {type:mongoose.Schema.Types.ObjectId, required: true, ref:'experts'},
    comments: [comments],
    meta:{
        upv: {type: Number},
        favs: {type: Number}
    }
})

const Blog = mongoose.model('blogs', blogSchema)

module.exports = Blog