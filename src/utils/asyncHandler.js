const asyncHandler = (requestHandle) => {
    return (req,res,next) => {
        Promise.resolve(requestHandle(req,res,next)).catch((err) => next(err))
    }
}


export {asyncHandler}


// alternative code of above code

// const asyncHandler = (fn) => async(requestAnimationFrame,resizeBy,next) =>{
//     try{
//   await fn(req,res,next)
//     }
//     catch(err)
//     {
//         res.status(err.code || 500).json({
//             success:false,
//             message:err.message
//         })
//     }
// }
// export {asyncHandler}