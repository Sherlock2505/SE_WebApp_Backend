const mongoose = require('mongoose')
const validator = require('validator')

const url = process.env.DATABASE_URL || 'mongodb://localhost:27017/myproject';

mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})

const connection = mongoose.connection
connection.once('open',() => {
    console.log('Connection to Db is successful')
})

module.exports = connection