const express = require('express')

//Models exported
const farmerUser = require('./models/Farmer.model')
const dealerUser = require('./models/Dealer.model')

//Routes exported
const farmerRouter = require('./routes/farmer')
const dealerRouter = require('./routes/dealer')

const connection = require('./db/mongoose')
const mongoose = require('mongoose')
const app = express()

app.use(express.json())
app.use('/farmer', farmerRouter)
app.use('/dealer', dealerRouter)

const port = process.env.PORT
app.listen(port, () => {
    console.log('Server is up at port '+port)
})

let gfs
connection.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(connection.db, { bucketName: 'uploads' })
  app.locals.gfs = gfs
})
