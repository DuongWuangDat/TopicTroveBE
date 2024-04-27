const mongoose = require("mongoose")
const Schema = mongoose.Schema
const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    phoneNumber:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    avatar:{
        type: String
    },
    communities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community"
    }],
    post
    
}, {timestamps: true})

userSchema.virtual("id").get(function(){
    return this._id.toHexString
})

userSchema.set('toJSON',{
    "virtuals": true
})
const userModel = mongoose.model("User", userSchema)
module.exports = userModel