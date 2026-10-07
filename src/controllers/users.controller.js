import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"
export const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend

  const { fullName, email, userName, password } = req.body;
  
  // validity check
  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "ALl field are required");
  }
  if (!email.includes("@")) {
    throw new ApiError(400, "email are in wrong format @ is missing!");
  }

  //check if user already exists:username,email
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username is existed!");
  }

  //check for images, check for avatar
  const avatarPath = req.files?.avatar?.[0]?.path;
 
const coverImagePath = req.files?.coverImage?.[0]?.path;

  if (!avatarPath) {
    throw new ApiError(400, "avatar is required on local");
  }

  // upload them to cloudinary, check avatar
  const avatar = await uploadOnCloudinary(avatarPath);
  const coverImage = await uploadOnCloudinary(coverImagePath);
  
  if (!avatar) {
    throw new ApiError(400, "avatar is required !!!");
  }

  // create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  // remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user!");
  }
  // return response
  
  return res.status(201).json(
    new ApiResponse(200,createdUser,"User is created"))

   
});
