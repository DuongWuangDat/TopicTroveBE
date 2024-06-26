const express = require("express")
const route = express.Router()
const postController = require("../controller/post_controller.js")

route.get("/findall", postController.GetAllPost)
route.get("/findbyuid", postController.GetPostByUID)
route.get("/findbycommunityid", postController.GetPostByCommunityId)
route.get("/findbyuidandcid", postController.GetPostByCommunityIdAndUID)
route.get("/findbyid/:id", postController.GetPostById)
route.post("/create", postController.CreatePost)
route.delete("/delete/:id", postController.DeletePost)
route.patch("/update/:id", postController.UpdatePost)
route.post("/checkisowner/:id", postController.CheckIsOwner)
route.patch("/likepost/:id", postController.LikePost)
route.delete("/deleteall", postController.DeleteAll)
module.exports = route