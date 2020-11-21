const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
 
const dealerSchema = new mongoose.Schema({
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
    dp_url:{type: String},
    dealertype: {
        type: String,
        required: true,
    },
    bidcrops: [mongoose.Schema.Types.ObjectId],
    location: {type: String, required: true},
    pincode: {type:Number, required: true},
    tokens:[{
        token: {
            type: String,
            required: true
        }
    }],
    notifications: [{type: mongoose.Schema.Types.ObjectId, ref:'notifications'}]
},{
    timestamps: true,
})

dealerSchema.methods.generateAuthToken = async function () {
    const user = this
    // const token = jwt.sign({_id:user._id.toString()}, process.env.JWT_SECRET, {expiresIn: "8 days"})
    const token = jwt.sign({_id:user._id.toString()}, process.env.JWT_SECRET, {expiresIn: "8 days"})

    user.tokens = user.tokens.concat({ token })
    await user.save() 
    return token
}

dealerSchema.statics.findByCredentials = async (phone,password) => {
    const user = await Dealer.findOne({phone})

    if(!user){
        throw new Error('Unable to Login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to Login')
    }

    return user
}

dealerSchema.methods.toMyProfile = function () {
    const user = this

    const userObj = user.toObject()
    delete userObj.password
    delete userObj.tokens

    return userObj
}

//for public profile view
dealerSchema.methods.toPublicProfile = function () {
    const user = this

    const userObj = user.toObject()
    delete userObj.password
    delete userObj.tokens
    
    return userObj
}

//hash the password
dealerSchema.pre('save',async function (next) {
    const user = this
    
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const Dealer = mongoose.model('dealers',dealerSchema)
module.exports = Dealer