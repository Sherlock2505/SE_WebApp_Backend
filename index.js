const express = require('express')
const cors = require('cors')

//Models exported
const farmerUser = require('./models/Farmer.model')
const dealerUser = require('./models/Dealer.model')
const cropModel = require('./models/Crop.model')
const editorUser = require('./models/Editor.model')
const blogModel = require('./models/Blog.model')

//Routes exported
const farmerRouter = require('./routes/farmer')
const dealerRouter = require('./routes/dealer')
const cropRouter = require('./routes/crop')
const editorRouter = require('./routes/editor')
const blogRouter = require('./routes/blog')
const imageRouter = require('./routes/supporting/images')

const connection = require('./db/mongoose')
const mongoose = require('mongoose')
const { options } = require('./routes/supporting/images')
const { default: Axios } = require('axios')
const app = express()

app.use(express.json())
app.use(cors())

app.use('/farmer', farmerRouter)
app.use('/dealer', dealerRouter)
app.use('/crops',cropRouter)
app.use('/blogs',blogRouter)
app.use('/editor', editorRouter)
app.use('/images',imageRouter)

app.post('/login', async (req, res) => {
	try{
		const farmer_user = await farmerUser.findByCredentials(req.body.phone, req.body.password)
		if(farmer_user){
			const token = await farmer_user.generateAuthToken()
	    	res.send({user: farmer_user, token, userType: "farmer"})
		}
	}
	catch (err){
		try {
			const dealer_user = await dealerUser.findByCredentials(req.body.phone, req.body.password)
			if(dealer_user){
				const token = await dealer_user.generateAuthToken()
				// console.log(token)
				res.send({user: dealer_user, token, userType: "dealer"})
			}
		} 
		catch (err) {
			try {
				const editor_user = await editorUser.findByCredentials(req.body.phone, req.body.password)
				if(editor_user){
					const token = await editor_user.generateAuthToken()
					// console.log(token)
					res.send({user: editor_user, token, userType: "expert"})
				}
			}
			catch(err){
				res.status(400).send({msg: "wrong credentials"})
			}
		}
	}
})

const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log('Server is up at port '+port)
})

let gfs
connection.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(connection.db, { bucketName: 'uploads' })
  app.locals.gfs = gfs
})
