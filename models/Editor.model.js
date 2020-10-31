const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
 
const editorSchema = new mongoose.Schema({
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
    verification_url:  {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    age:{type: Number, required: true},
    dp_url:{type: String},
    tokens:[{
        token: {
            type: String,
            required: true
        }
    }],
},{
    timestamps: true,
})

editorSchema.methods.generateAuthToken = async function () {
    const user = this
    // const token = jwt.sign({_id:user._id.toString()}, process.env.JWT_SECRET, {expiresIn: "8 days"})
    const token = jwt.sign({_id:user._id.toString()}, process.env.JWT_SECRET, {expiresIn: "8 days"})

    user.tokens = user.tokens.concat({ token })
    await user.save() 
    return token
}

editorSchema.statics.findByCredentials = async (phone,password) => {
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

//hash the password
editorSchema.pre('save',async function (next) {
    const user = this
    
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const Editor = mongoose.model('experts',editorSchema)
module.exports = Editor