const User = require("../model/user.js")
const Community = require("../model/community.js")
const tokenController = require("../controller/token_controller.js")
const bcrypt = require("../pkg/auth/authorization.js")
const auth = require("../pkg/auth/authentication.js")
const helper = require("../pkg/helper/helper.js")

const register = async (req,res)=>{
    const isValidEmail = await helper.isValidEmail(req.body.email)
    const isValidPhoneNumber = await helper.isValidPhoneNumber(req.body.phoneNumber)
    if(!isValidEmail) return res.status(400).json({
        message: "Invalid email"
    })
    if(!isValidPhoneNumber) return res.status(400).json({
        message: "Invalid phone number"
    })
    var email = req.body.email.toLowerCase()
    const existUser = await User.findOne({
        email: email
    })
    if(existUser) return res.status(400).json({
        message: "Existed email"
    })
    const newUser = new User(req.body)
    newUser.communities = []
    newUser.email = email
    newUser.password =await  bcrypt.hashPassword(newUser.password)
    await newUser.save().catch((err)=>{
        return res.status(400).json({
            message: "Something went wrong"
        })
    })
    const accessToken = await auth.generateToken(newUser, "1h",'access')
    const refreshToken = await auth.generateToken(newUser, "30d", 'refresh')
    tokenController.addNewToken(refreshToken, newUser._id)
    const dataUser = newUser.populate("communities")
    return res.json({
        accessToken: accessToken,
        refreshToken: refreshToken,
        data: newUser
    })

}

const login = async (req,res)=>{
    var email = req.body.email.toLowerCase()
    const existUser = await User.findOne({
        email: email
    })
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })
    const isValidPassword = await bcrypt.comparePassword(req.body.password, existUser.password)
    if(!isValidPassword) return res.status(401).json({
        message: "Unauthorized"
    })
    const user = await User.findOne({
        email: email
    }).select('-password').populate('communities')
    tokenController.revokedAllTokenUser(user._id)
    const accessToken = await auth.generateToken(existUser,"1h", 'access')
    const refreshToken = await auth.generateToken(existUser, "30d", 'refresh')
    tokenController.addNewToken(refreshToken, user._id)
    return res.json({
        access_token: accessToken,
        refresh_token: refreshToken,
        data: user
    })
}

const deleteUser = async (req,res)=>{
    const id = req.params.id
    const isValidId = await helper.isValidObjectID(id)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    await tokenController.deleteTokenByUserID(id)
    await User.findByIdAndDelete(id).catch((err)=>{
        return res.status(400).json({
            message: "Something went wrong"
        })
    })
    return res.json({
        message: "Deleted successfully"
    })

}

const updateUser = async (req,res)=>{
    const id= req.params.id
    const isValidId = await helper.isValidObjectID(id)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    if(req.body.password != null) return res.status(400).json({
        message: "Use changePassword route to change password"
    })
    await User.findByIdAndUpdate(id,req.body).catch((err)=>{
        return res.status(400).json({
            message: "Something went wrong"
        })
    })
    return res.json({
        message: "Updated successfully"
    })
}

const changePassword = async (req,res) =>{
    const isValidEmail = await helper.isValidEmail(req.body.email)
    if(!isValidEmail) return res.status(400).json({
        message: "Invalid email"
    })
    const existUser = await User.findOne({
        email: req.body.email
    })
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })
    const password = req.body.password
    const hashPassword = await bcrypt.hashPassword(password)
    await User.findOneAndUpdate({
        email: req.body.email
    }, {password: hashPassword}).catch((err)=>{
        return res.status(400).json({
            message: "Something went wrong"
        })
    })
    return res.json({
        message: "Updated password successfully"
    })
}

const logOut = async (req,res)=>{
    const header = req.headers.authorization
    const split = header.split(" ")
    const refreshToken = split[1]
    try{
        const tokenFind = await tokenController.revokedToken(refreshToken)
        if(!tokenFind) {
            return res.status(400).json({
                message: "Invalid refresh token"
            })
        }
    }
    catch{
        return res.status(400).json({
            message: "Something went wrong"
        })
    }
    return res.json({
        message: "Log out successfully"
    })
}

///Find user by email
const getUserByEmail = async (req,res) =>{
    const isValidEmail = await helper.isValidEmail(req.body.email)
    if(!isValidEmail) return res.status(400).json({
        message: "Invalid email"
    })
    const existUser = await User.findOne({
        email: req.body.email
    }).select('-password').populate("communities")
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })
    return res.json({
        data: existUser
    })
}

const getAllUser = async (req,res)=>{
    const userList = await User.find().select('-password').populate("communities").catch((err)=>{
        return res.status(400).json({
            message: "Something went wrong"
        })
    })
    return res.json({
        data: userList
    })
}

const getUserById = async(req,res)=>{
    const id = req.params.id
    const isValidId = await helper.isValidObjectID(id)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    const existUser = await User.findById(id).select('-password')
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })
    return res.json({
        data: existUser
    })
}

const JoinCommunity = async(req,res)=>{
    const userId = req.body.userId
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
    const communities = user.communities
    communities.push(communityId)
    existedCommunity.memberCount +=1
    await existedCommunity.save()
    await User.findByIdAndUpdate(userId, communities)
    return res.json({
        message: "Join community successfully"
    })
}

module.exports = {register,login,getUserByEmail,changePassword,deleteUser,updateUser,getAllUser, logOut, getUserById, JoinCommunity}