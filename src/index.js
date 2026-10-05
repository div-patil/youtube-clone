import connectDB from "./db/index.js";
// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
dotenv.config({
    path:'./env'
})
connectDB()

























// import mongoose from "mongoose";
// import {DB_NAME} from "./constants"


// ( async () => {
//     try{
//      await mongoose.connect.apply(`${process.env.MONGODB_URL}/${DB_NAME}`)
//     }
//     catch(error)
//     {
//         console.log("Error:",error)
//         throw error
//     }
// } )()
