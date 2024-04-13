const mongoose = require("mongoose")
const Schema = mongoose.Schema

const postSchema = new Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    communityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: [{
        body:{
            type: String,
            required: true
        } ,
        typeContent: {
            type: String,
            enum: ['text', 'image', 'video'],
            default: 'text'
        }
    }],
    interestCount: {
        type: Number,
        default: 0
    },
    disinterestCount: {
        type: Number,
        default: 0
    }

}, {timestamps: true})

const postModel = mongoose.model("Post", postSchema)
module.exports = postModel