const mongoose = require("mongoose")
const Schema = mongoose.Schema
const commentSchema = new Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    interestUserList:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    interestCount: {
        type: Number,
        default: 0
    },
    disinterestCount: {
        type: Number,
        default: 0
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    }
}, {timestamps: true})

const commentModel = mongoose.model("Comment", commentSchema)
module.exports = commentModel