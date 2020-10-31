const jwt = require('jsonwebtoken')
const Editor = require('../models/Editor.model')
//editor's authentiaction
const auth = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await Editor.findOne({_id: decoded._id, 'tokens.token': token})

        if(!user){
            throw new Error()
        }

        req.editor_user = user
        req.token = token
        next()
    }catch(e){
        res.status(401).send({error: 'Please authenticate as Expert for blogs.' })    
    }
}

module.exports = auth