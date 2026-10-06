import connectDB from "./db/index.js";
// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
dotenv.config({
    path:'./env'
})
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=> {
        console.log(`server is running at port : ${process.env.PORT}`);
    })
})
.catch((err)=>
{
    console.log("MongoDB connection failed !!!",err)
})

























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
