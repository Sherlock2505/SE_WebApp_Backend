const mongoose = require('mongoose')
const https = require('https')
const querystring = require('querystring')
const recommender = require('../utils/recommender')

const blogSchema = new mongoose.Schema({
    title:{type: String, required: true},
    subtitle: {type: String, required: true},
    content: {type: String, required: true},
    thumbnail: {type: String, required: true},
    author: {type: String, required: true},
    owner: {type:mongoose.Schema.Types.ObjectId, required: true, ref:'experts'},
    comments: [{type:mongoose.Schema.Types.ObjectId, ref:'comments'}],
    meta:{
        upv: {type: Number},
        favs: {type: Number}
    },
    tags: [{type:mongoose.Schema.Types.ObjectId, ref:'tags', required: true}]
},{
    timestamps: true
})

const Blog = mongoose.model('blogs', blogSchema)
module.exports = Blog