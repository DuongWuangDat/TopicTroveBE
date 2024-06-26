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
    const ownerId = req.query.ownerId
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
    const name = req.query.name
    const communities = await Community.find({
        communityName: name
    }).populate("owner", '-password')
    return res.json({
        data: communities
    })
}

const CheckIsJoin = async(req,res)=>{
    const uid = req.body.userId
    let isValidId = await helper.isValidObjectID(uid)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    const id = req.params.id
    isValidId = await helper.isValidObjectID(id)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    const community = await Community.findById(id)
    if(!community) return res.status(404).json({
        message: "Community not found"
    })
    const user = await User.findById(uid)
    if(!user) return res.status(404).json({
        message: "User not found"
    })
    const isJoin = user.communities.some((community)=> community == id)
    return res.json({
        result: isJoin
    }
    )
}

const GetCommunityByID = async (req,res)=>{
    const id = req.params.id
    const isValidId = await helper.isValidObjectID(id)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    const community = await Community.findById(id).populate("owner", '-password')
    return res.json({
        data: community
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


const GetJoinedCommunity = async(req,res)=>{
    const ownerID = await tokenController.getUIDfromToken(req)
    const user = await User.findById(ownerID).populate("communities")
    
    if(!user) return res.status(404).json({
        message: "Not found"
    })
    const authorCommunity = await Community.find({owner: ownerID})
    console.log(authorCommunity)
    let dataCommunity = user.communities
    dataCommunity = dataCommunity.concat(authorCommunity)
    return res.json({
        data: dataCommunity
    })
}

module.exports = {GetAllCommunity,GetCommunityByName,GetCommunityByOwnerId,CreateCommunity,DeleteCommunity,UpdateCommunity,CheckIsOwner, GetCommunityByID, CheckIsJoin,GetJoinedCommunity}