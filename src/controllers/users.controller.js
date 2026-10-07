
import {asyncHandler} from "../utils/asyncHandler.js"

export const registerUser = asyncHandler(async(requestAnimationFrame,res)=>{
     return  res.status(200).json({
        message:"Ok"

    })
})
