const express = require("express")
const route = express.Router()
const communityController = require("../controller/community_controller")

route.get("/findall", communityController.GetAllCommunity)
route.get("/findbyownerid", communityController.GetCommunityByOwnerId)
route.get("/findbyname", communityController.GetCommunityByName)
route.get("/findbyid/:id",communityController.GetCommunityByID)
route.post("/create",communityController.CreateCommunity)
route.delete("/delete/:id", communityController.DeleteCommunity)
route.patch("/update/:id",communityController.UpdateCommunity)
route.post("/checkisowner/:id", communityController.CheckIsOwner)
module.exports = route