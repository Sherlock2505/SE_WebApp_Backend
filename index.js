const express = require('express')

//Models exported
const farmerUser = require('./models/Farmer.model')
const dealerUser = require('./models/Dealer.model')
const cropModel = require('./models/Crop.model')

//Routes exported
const farmerRouter = require('./routes/farmer')
const dealerRouter = require('./routes/dealer')
const cropRouter = require('./routes/crop')

const connection = require('./db/mongoose')
const mongoose = require('mongoose')
const app = express()

const Dealer = require('../models/Dealer.model')
const Farmer = require('../models/Farmer.model')

app.use(express.json())
app.use('/farmer', farmerRouter)
app.use('/dealer', dealerRouter)
app.use('/crops',cropRouter)

app.post('/login', async (req, res) => {
	try{
		const farmer_user = await Farmer.findByCredentials(req.body.phone, req.body.password)
		if(farmer_user !== null){
			const token = await farmer_user.generateAuthToken()
	    	res.send({farmer_user, token, userType: "farmer"})
	    	return
		}
	    const dealer_user = await Dealer.findByCredentials(req.body.phone, req.body.password)
	    if(dealer_user !== null){
	    	const token = await dealer_user.generateAuthToken()
        	res.send({dealer_user, token, userType: "dealer"})
        	return
	    }

	    res.status(400).send({msg: "given credentials are incorrect"})
	}
	catch (err){
		res.status(400).send({err})
	}
})

const port = process.env.PORT
app.listen(port, () => {
    console.log('Server is up at port '+port)
})

let gfs
connection.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(connection.db, { bucketName: 'uploads' })
  app.locals.gfs = gfs
})