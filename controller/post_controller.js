const Post = require("../model/post.js")
const User = require("../model/user.js")
const Community = require("../model/community.js")
const tokenController = require("../controller/token_controller.js")
const Comment = require("../model/comment.js")
const helper = require("../pkg/helper/helper.js")
const CreatePost = async (req,res)=>{
    const post = new Post(req.body)
    await post.save()
    return res.json({
        message: "Created post successfully",
        data: post
    })
}

const GetAllPost = async (req,res)=>{
    const postList = await Post.find().populate('author', '-password').populate('communityId').sort({createdAt: -1});
    return res.json({
        data: postList
    })
}

const GetPostByUID = async (req,res)=>{
    const uid = req.query.authorId
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
    }).populate('author', '-password').populate('communityId').sort({createdAt: -1})
    return res.json({
        data: postList
    })
}

const GetPostByCommunityId= async (req,res)=>{
    const communityId = req.query.communityId
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
    }).populate('author', '-password').populate('communityId').sort({createdAt: -1})
    return res.json({
        data: postList
    })
}

const GetPostByCommunityIdAndUID = async (req,res)=>{
    const userId = req.query.authorId
    const communityId = req.query.communityId
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
    }).populate('author', '-password').populate('communityId').sort({createdAt: -1})
    return res.json({
        data: postList
    })
}

const DeletePost = async (req,res)=>{
    const curUserId = await tokenController.getUIDfromToken(req)
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
    await Comment.deleteMany({
        post: id
    })
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

const LikePost = async (req,res)=>{
    const userId = req.body.userId
    const isValidUserId = await helper.isValidObjectID(userId)
    const id = req.params.id
    const isValidId = await helper.isValidObjectID(id)
    if(!isValidId || !isValidUserId) return res.status(400).json({
        message: "Invalid id"
    })
    const user = await User.findById(userId)
    if(!user) return res.status(404).json({
        message: "User not found"
    })
    const post = await Post.findById(id)
    const isValid = post.interestUserList?.some((userID) => userID == userId)
    if(!isValid){
        return res.status(400).json({
            message: "User had already liked this post"
        })
    }
    post.interestUserList.push(userId)
    post.interestCount +=1
    post.save()
    return res.json({
        message: "Successfull"
    })
}

const DeleteAll = async (req,res)=>{
    await Post.deleteMany({})
    return res.json({
        message: "Successfully"
    })
}

const CheckIsOwner = async(req,res)=>{
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
    if(curUserId != post.author){
        return res.status(401).json({
            result: false
        })
    }
    return res.status(401).json({
        result: true
    })
}



module.exports = {CreatePost, GetAllPost,GetPostByCommunityId,GetPostByUID,GetPostByCommunityIdAndUID,DeletePost,UpdatePost,CheckIsOwner, LikePost, DeleteAll}