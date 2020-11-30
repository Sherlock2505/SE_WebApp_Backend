const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const farmerSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    phone:{
        type: Number,
        required: true,
        unique: true,
        validate(value){
            if(value.toString().length!==10){
                throw new Error('Phone number provided is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
    },
    age:{type: Number, required: true},
    land_acres:{type: Number, required: true},
    dp_url:{type: String},
    location: {type: String, required: true},
    pincode: {type:Number, required: true},
    tokens:[{
        token: {
            type: String,
            required: true
        }
    }],
    fav_blogs:[{type: mongoose.Schema.Types.ObjectId, ref:'blogs'}],
    notifications: [{type: mongoose.Schema.Types.ObjectId, ref:'notifications'}]
},{
    timestamps: true,
})

farmerSchema.methods.generateAuthToken = async function () {
    const user = this
    // const token = jwt.sign({_id:user._id.toString()}, process.env.JWT_SECRET, {expiresIn: "8 days"})
    const token = jwt.sign({_id:user._id.toString()}, process.env.JWT_SECRET, {expiresIn: "8 days"})

    user.tokens = user.tokens.concat({ token })
    await user.save() 
    return token
}

farmerSchema.statics.findByCredentials = async (phone,password) => {
    const user = await Farmer.findOne({phone})

    if(!user){
        throw new Error('Unable to Login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to Login')
    }

    return user
}

farmerSchema.methods.toMyProfile = function () {
    const user = this

    const userObj = user.toObject()
    delete userObj.password
    delete userObj.tokens

    return userObj
}

//for public profile view
farmerSchema.methods.toPublicProfile = function () {
    const user = this

    const userObj = user.toObject()
    delete userObj.password
    delete userObj.tokens
    delete userObj.fav_blogs
    
    return userObj
}

//hash the password
farmerSchema.pre('save',async function (next) {
    const user = this
    
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const Farmer = mongoose.model('farmers',farmerSchema)
module.exports = Farmer