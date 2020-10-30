const jwt = require('jsonwebtoken')
const Farmer = require('../models/Farmer.model')

const auth = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await Farmer.findOne({_id: decoded._id, 'tokens.token': token})

        if(!user){
            throw new Error()
        }
        
        req.farmer_user = user
        req.token = token
        next()
    }catch(e){
        console.log(e)
        res.status(401).send({error: 'Please authenticate.' })    
    }
}

module.exports = auth