const {initializeApp} = require("firebase/app")
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage")
const path = require("path")
const express = require("express")
const route = express.Router()
const multer = require("multer")
const Topic = require("../model/topic.js")
initializeApp({
    apiKey: "AIzaSyCrSV6bWzOSsGaL-lM3BB7AsWOEEBdJpus",
    authDomain: "topictrove-a1b0c.firebaseapp.com",
    projectId: "topictrove-a1b0c",
    storageBucket: "topictrove-a1b0c.appspot.com",
    messagingSenderId: "165872896078",
    appId: "1:165872896078:web:084aaf37c0a5df4d8d9b1f",
    measurementId: "G-7T86MSF6D4"
})

const storage = getStorage();



const uploadOptions = multer({storage: multer.memoryStorage()})

route.post("/image", uploadOptions.single("image"),async (req,res)=>{
    
    const file = req.file;
    if(!file) return res.status(400).send('No image in the request')

    const storageRef = ref(storage, `files/${req.file.originalname}`)

    const metaData= {
        contentType: req.file.mimetype
    }

    const snapShot = await uploadBytesResumable(storageRef,req.file.buffer,metaData)

    const downloadURL = await getDownloadURL(snapShot.ref)
    return res.json({
        image: downloadURL
    })
})

route.post("/file", uploadOptions.single("file"),async(req,res)=>{
    const file = req.file;
    if(!file) return res.status(400).send('No file in the request')
    const curDate = new Date();
    const curMili = curDate.getMilliseconds();
    const fileName = path.basename(req.file.originalname, path.extname(req.file.originalname))
    const extension = path.extname(req.file.originalname)
    const storageRef = ref(storage, `files/${fileName}${extension}`)

    const metaData= {
        contentType: req.file.mimetype
    }

    const snapShot = await uploadBytesResumable(storageRef,req.file.buffer,metaData)
    const downloadURL = await getDownloadURL(snapShot.ref)
    return res.json({
        image: downloadURL,
        fileName: fileName,
        extension: extension
    })
})

route.post("/files", uploadOptions.array("files", 100),async(req,res)=>{
    const files = req.files
    const responseData = []
    await Promise.all(files.map(async (file)=>{
        const curDate = new Date();
    const curMili = curDate.getMilliseconds();
    const fileName = path.basename(file.originalname, path.extname(file.originalname))
    const extension = path.extname(file.originalname)
    const storageRef = ref(storage, `files/${fileName}${extension}`)

    const metaData= {
        contentType: file.mimetype
    }

    const snapShot = await uploadBytesResumable(storageRef,file.buffer,metaData)
    const downloadURL = await getDownloadURL(snapShot.ref)
    responseData.push({
        url: downloadURL,
        name: fileName,
        extension: extension
    })
    }))
    res.json({
        data: responseData
    })
})
module.exports = route