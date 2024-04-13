const mongoose = require("mongoose")
const Schema = mongoose.Schema
const communitySchema = new Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    rules: {
        type: String,
        required: true
    },
    communityName: {
        type: String,
        required: true
    },
    memberCount: {
        type: Number,
        default: 0
    }
}, {timestamps: true})

const communityModel = mongoose.model("Community", communitySchema)
module.exports = communityModel