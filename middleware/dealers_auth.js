const jwt = require('jsonwebtoken')
const Dealer = require('../models/Dealer.model')

const auth = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await Dealer.findOne({_id: decoded._id, 'tokens.token': token})

        if(!user){
            throw new Error()
        }

        req.dealer_user = user
        req.token = token
        next()
    }catch(e){
        res.status(401).send({error: 'Please authenticate as dealer to use this feature.' })    
    }
}

module.exports = auth