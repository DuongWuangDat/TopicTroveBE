const User = require("../model/user.js")
const Community = require("../model/community.js")
const Post = require("../model/post.js")
const Comment = require("../model/comment.js")
const tokenController = require("../controller/token_controller.js")
const helper = require("../pkg/helper/helper.js")
const CreateComment = async (req,res)=>{
    const comment = new Comment(req.body)
    await comment.save().catch((e)=>{
        return res.status(400).json({
            message: "Something went wrong"
        })
    })
    return res.json({
        message: "Created comment success fully",
        data: comment
    })
}

const GetCommentByPostID = async (req,res)=>{
    const postId = req.query.postId
    const commentData = await getCommentTree(postId)
    return res.json({
        data: commentData
    })
}

const GetCommentByUID = async (req,res)=>{
    const userId = req.query.userId
    const isValidId = await helper.isValidObjectID(userId)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    const comment = await Comment.find({
        author: userId
    }).populate('author', '-password')
    return res.json({
        data: comment
    })
}

const GetAllComment = async(req,res)=>{
    const comments = await Comment.find()
    return res.json({
        data: comments
    })
}

const DeleteComment = async(req,res)=>{
    const curUserId = await tokenController.getUIDfromToken(req)
    const id = await Comment.findById(id)
    const isValidId = await helper.isValidObjectID(id)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    const comment = await Comment.findById(id)
    const post = await Post.findById(comment.post)
    const community = await Community.findById(post.communityId)
    if(comment.author != curUserId && post.author != curUserId && community.owner != curUserId){
        return res.status(401).json({
            message: "Permission denied. Only moderator community, author of post, author of comment can delete this comment"
        })
    }
    await Comment.deleteMany({
        parentComment: id
    })
    await Comment.findByIdAndDelete(id)
    return res.json({
        message: "Deleted successfully"
    })
}


const UpdateComment = async(req,res)=>{
    const id = req.params.id
    const isValidId = await helper.isValidObjectID(id)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    await Comment.findByIdAndUpdate(id, req.body)
    return res.json({
        message: "Updated successfully"
    })
}

const CheckIsOwner = async(req,res)=>{
    const curUserId = await tokenController.getUIDfromToken(req)
    const id = await Comment.findById(id)
    const isValidId = await helper.isValidObjectID(id)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    const post = await Post.findById(comment.post)
    if(curUserId!= post.author){
        return res.status(401).json({
            result: false
        })
    }
    return res.json({
        result: true
    })
}

const GetCommentCountByPostId = async(req,res)=>{
    const postId = req.query.postId
    const isValidId = await helper.isValidObjectID(postId)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    const count = await Comment.find({
        post: postId
    }).countDocuments()
    return res.json({
        numberComment: count
    })
}

const LikeComment= async(req,res)=>{
    const interest= req.body.interest
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
    const comment = await Comment.findById(id)
    const isValid = comment.interestUserList?.some((userID) => userID == userId)
    if(isValid && interest == 1){
        return res.status(400).json({
            message: "User had already liked this comment"
        })
    }
    if(interest==1){
        comment.interestUserList.push(userId)
        comment.interestCount +=1
    }
    else if (interest == -1){
        comment.interestUserList = comment.interestUserList.filter((user)=> user != userId)
        comment.interestCount -= 1
    }
    else{
        return res.status(400).json({
            message: "Interest is not valid"
        })
    }
    
    comment.save()
    return res.json({
        message: "Successfull"
    })
}

module.exports={CreateComment,GetAllComment,GetCommentByPostID,GetCommentByUID,DeleteComment,UpdateComment,CheckIsOwner, GetCommentCountByPostId, LikeComment}

//methods
const getCommentTree = async (postId) => {
    const comments = await Comment.find({ post: postId }).populate("author", '-password');

    const childCommentsMap = {};

    for (let comment of comments) {
        if(!comment.parentComment) continue
        if (!childCommentsMap[comment.parentComment]) {
            childCommentsMap[comment.parentComment] = [];
        }
        childCommentsMap[comment.parentComment].push(comment);
    }

    const commentTree = comments.filter(comment => !comment.parentComment).map(createCommentNode);

    function createCommentNode(comment) {
        return {
            comment,
            children: (childCommentsMap[comment._id] || []).map(createCommentNode)
        };
    }

    return commentTree;
}