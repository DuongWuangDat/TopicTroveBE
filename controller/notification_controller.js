const Notification = require("../model/notification.js")
const User = require("../model/user.js")
const helper = require("../pkg/helper/helper.js")

const GetAllNotification= async(req,res)=>{
    const notificationList = await Notification.find();
    return res.json({
        data: notificationList
    })
}

const GetNotificationByUID = async (req,res)=>{
    const userId = req.query.userID
    const notificationList = await Notification.find({
        userId: userId
    })
    return res.json({
        data: notificationList
    })
}

const CreateNotification = async (req,res) =>{
    const notification = new Notification(req.body)
    await notification.save().catch((e)=>{
        return res.status(400).json({
            message: "Something went wrong"
        })
    })
    return res.json({
        message: "Created successfully",
        data: notification
    })
}

const DeleteNotification = async (req,res)=>{
    const id = req.params.id
    const isValidId = await helper.isValidObjectID(id)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    await Notification.findByIdAndDelete(id)
    return res.json({
        message: "Deleted successfully"
    })
}

const UpdateNotification = async (req,res) =>{
    const id = req.params.id
    const isValidId = await helper.isValidObjectID(id)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    await Notification.findByIdAndUpdate(id, req.body)
    return res.json({
        message: "Updated successfully"
    })
}

module.exports= {GetAllNotification, GetNotificationByUID,CreateNotification,DeleteNotification,UpdateNotification}