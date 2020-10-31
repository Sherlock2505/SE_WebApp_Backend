const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    body:{type: String, required: true},
    owner: {type:mongoose.Schema.Types.ObjectId, required: true, ref: 'farmers'},
    name: {type: String, required:true}
})

module.exports = commentSchema