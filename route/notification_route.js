const express = require("express")
const route = express.Router()
const notificationController = require("../controller/notification_controller.js")

route.get("/findall", notificationController.GetAllNotification)
route.get("/findbyuid", notificationController.GetNotificationByUID)
route.post("/create", notificationController.CreateNotification)
route.delete("/delete/:id", notificationController.DeleteNotification)
route.patch("/update/:id", notificationController.UpdateNotification)

module.exports = route