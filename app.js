const express = require("express")
const app = express()
const mongoose = require("mongoose")
const cors = require("cors")
const morgan = require("morgan")
const authJwt = require("./pkg/middleware/authJwt.js")
require("dotenv").config()
const http = require("http").createServer(app)
const userRoute = require("./route/user_route.js")
const tokenRoute = require("./route/token_route.js")
const communityRoute = require("./route/community_route.js")
const postRoute = require("./route/post_route.js")
const commentRoute = require("./route/comment_route.js")
const notificationRoute = require("./route/notification_route.js")
const uploadRoute = require("./route/upload_route.js")


const port = process.env.PORT
const url = process.env.ATLAS_URI
const api = process.env.API_URL

///Prepare mongoDB and run server///
mongoose.connect(url).then(
    res =>{
        console.log("Connect mongoDB successfully");
        http.listen(port, ()=>{
                console.log("Listen and run at port: " + port)
        })
    }
).catch(
    err=>{
        console.log(err)
    }
)
///Prepare mongoDB and run server///

app.use(morgan('dev'))
app.use(cors())
app.use(express.json())
app.use(authJwt())
app.get("/ping", (req,res)=>{
    return res.status(200).json({
        message: "pong"
    })
})

app.use(`${api}/user`, userRoute)
app.use(`${api}/token`, tokenRoute)
app.use(`${api}/upload`, uploadRoute)
app.use(`${api}/community`, communityRoute)
app.use(`${api}/post`, postRoute)
app.use(`${api}/comment`, commentRoute)
app.use(`${api}/notification`, notificationRoute)