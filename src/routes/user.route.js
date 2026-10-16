import { Router } from "express";
import { generateRefreshToken, loginUser, logoutUser, registerUser } from "../controllers/users.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.post("/register",
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]), 
    registerUser);


router.post("/login",loginUser)

// secure routes
router.post('/logout',verifyJWT,logoutUser)
router.post("/refresh-token",verifyJWT,generateRefreshToken)

export default router;