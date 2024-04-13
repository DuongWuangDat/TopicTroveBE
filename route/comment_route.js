const express = require("express")
const route = express.Router()
const commentController = require("../controller/comment_controller.js")

route.get("/findall", commentController.GetAllComment)
route.get("/findbypostid", commentController.GetCommentByPostID)
route.get("/findbyuid", commentController.GetCommentByUID)
route.post("/create", commentController.CreateComment)
route.delete("/delete/:id", commentController.DeleteComment)
route.patch("update/:id", commentController.UpdateComment)
route.post("/checkisowner/:id",commentController.CheckIsOwner)

module.exports = route