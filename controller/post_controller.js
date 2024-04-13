const Post = require("../model/post.js")
const User = require("../model/user.js")
const Community = require("../model/community.js")
const tokenController = require("../controller/token_controller.js")
const auth = require()
const CreatePost = async (req,res)=>{
    const post = new Post(req.body)
    await post.save().catch((e)=>{
        return res.status(400).json({
            message: "Something went wrong"
        })
    })
    return res.json({
        message: "Created post successfully",
        data: post
    })
}

const GetAllPost = async (req,res)=>{
    const postList = await Post.find().populate('author', '-password').populate('communityId');
    return res.json({
        data: postList
    })
}

const GetPostByUID = async (req,res)=>{
    const uid = req.body.authorId
    const isValidId = await helper.isValidObjectID(uid)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    const user = await User.findById(uid)
    if(!user){
        return res.status(404).json({
            message: "User not found"
        })
    }
    const postList = await Post.find({
        author: uid
    }).populate('author', '-password').populate('communityId')
    return res.json({
        data: postList
    })
}

const GetPostByCommunityId= async (req,res)=>{
    const communityId = req.body.communityId
    const isValidId = await helper.isValidObjectID(communityId)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    const community = await Community.findById(communityId)
    if(!community) return res.status(404).json({
        message: "Community not found"
    })
    const postList = await Post.find({
        communityId: communityId
    }).populate('author', '-password').populate('communityId')
    return res.json({
        data: postList
    })
}

const GetPostByCommunityIdAndUID = async (req,res)=>{
    const userId = req.body.authorId
    const communityId = req.body.communityId
    const isValidUId = await helper.isValidObjectID(userId)
    const isValidCommunityId = await helper.isValidObjectID(communityId)
    if(!isValidUId || !isValidCommunityId) return res.status(400).json({
        message: "Invalid id"
    })
    const existedCommunity = await Community.findById(communityId)
    if(!existedCommunity) return res.status(400).json({
        message: "Community not found"
    })
    const user = await User.findById(userId)
    if(!user) return res.status(400).json({
        message: "User not found"
    })
    const postList = await Post.find({
        author: userId,
        communityId: communityId
    }).populate('author', '-password').populate('communityId')
    return res.json({
        data: postList
    })
}

const DeletePost = async (req,res)=>{
    const curUserId = await tokenController.getUIDfromToken
    const id = req.params.id
    const isValidId = await helper.isValidObjectID(id)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    const post = await Post.findById(id)
    if(!post){
        return res.status(404).json({
            message: "Post not found"
        })
    }
    const community = await Community.findById(post.communityId)
    if(curUserId != post.author && curUserId != community.owner){
        return res.status(401).json({
            message: "Permission denied. Only author and owner's community can delete this post"
        })
    }
    await Post.findByIdAndDelete(id)
    return res.json({
        message: "Delete successfully"
    })
}

const UpdatePost = async (req,res)=>{
    const id = req.params.id
    const isValidId = await helper.isValidObjectID(id)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    const post = await Post.findById(id)
    if(!post){
        return res.status(404).json({
            message: "Post not found"
        })
    }
    await Post.findByIdAndUpdate(id, req.body)
    return res.json({
        message: "Updated successfully"
    })
}

module.exports = {CreatePost, GetAllPost,GetPostByCommunityId,GetPostByUID,GetPostByCommunityIdAndUID,DeletePost,UpdatePost}