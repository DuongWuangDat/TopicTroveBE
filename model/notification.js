const mongoose = require("mongoose")
const Schema = mongoose.Schema
const notificationSchema = new Schema({
    userId :{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    readable:{
        type: Boolean,
        default: false
    }
}, {timestamps: true})

const notificationModel = mongoose.model("Notification", notificationSchema)
module.exports = notificationModel