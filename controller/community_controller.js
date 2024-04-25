const Community = require("../model/community.js")
const User = require("../model/user.js")
const tokenController = require("../controller/token_controller.js")
const helper = require("../pkg/helper/helper.js")
const Post = require("../model/post.js")
const GetAllCommunity = async (req,res)=>{
    const commnuityList = await Community.find().populate("owner", '-password').catch((e)=>{
        return res.status(400).json({
            message: "Something went wrong"
        })
    });
    return res.json({
        data: commnuityList
    })
}

const CreateCommunity = async (req,res)=>{
    const existUser = await User.findById(req.body.owner)
    if(!existUser) return res.status(400).json({
        message: "User not found"
    })
    const community = new Community(req.body)
    let isSuccess = true
    console.log(community)
    await community.save().catch((e)=>{
        isSuccess= false
        return res.status(400).json({
            message: "Something went wrong"
        })
    })
    if(!isSuccess) return
    return res.json({
        message: "Created community successfully",
        data: community
    })
}

const DeleteCommunity = async (req,res)=>{
    const ownerID = await tokenController.getUIDfromToken(req)
    const id = req.params.id
    const isValidId = await helper.isValidObjectID(id)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    const community = await Community.findById(id)
    if(!community) return res.status(404).json({
        message: "Community not found"
    })
    if(ownerID != community.owner) return res.status(401).json({
        message: "Permission denied. Only owner can delete this community"
    })
    await Post.deleteMany({
        communityId: id
    })
    await Community.findByIdAndDelete(id).catch((e)=>{
        return res.status(400).json({
            message: "Something went wrong"
        })
    })
    return res.json({
        message: "Deleted community successfully"
    })
}

const GetCommunityByOwnerId = async (req,res)=>{
    const ownerId = req.body.ownerId
    const isValidId = await helper.isValidObjectID(ownerId)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    const communities = await Community.find({
        owner: ownerId
    }).populate("owner", '-password')
    return res.json({
        data: communities
    })
}

const GetCommunityByName = async (req,res)=>{
    const name = req.body.name
    const communities = await Community.find({
        communityName: name
    }).populate("owner", '-password')
    return res.json({
        data: communities
    })
}

const UpdateCommunity = async (req,res)=>{
    const ownerID = await tokenController.getUIDfromToken(req)
    const id= req.params.id
    const isValidId = await helper.isValidObjectID(id)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    const community = await Community.findById(id)
    if(!community) return res.status(404).json({
        message: "Community not found"
    })
    if(ownerID != community.owner) return res.status(401).json({
        message: "Permission denied. Only owner can update this community"
    })
    await Community.findByIdAndUpdate(id, req.body).catch((e)=>{
        return res.status(400).json({
            message: "Something went wrong"
        })
    })
    return res.json({
        message: "Updated successfully"
    })
}

const CheckIsOwner = async (req,res)=>{
    const ownerID = await tokenController.getUIDfromToken(req)
    const id= req.params.id
    const isValidId = await helper.isValidObjectID(id)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    const community = await Community.findById(id)
    if(!community) return res.status(404).json({
        message: "Community not found"
    })
    if(ownerID != community.owner) return res.status(401).json({
        result: false
    })
    return res.json({
        result: true
    })
}

module.exports = {GetAllCommunity,GetCommunityByName,GetCommunityByOwnerId,CreateCommunity,DeleteCommunity,UpdateCommunity,CheckIsOwner}