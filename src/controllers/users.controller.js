import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
const generateAccessAndRegreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token generation error:", error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      500,
      "Something went wrong while generating access or refresh tokens."
    );
  }
};

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

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User is created"));
});

export const loginUser = asyncHandler(async (req, res) => {
  //  username or email
  //  find user
  // password check
  // access and refresg token
  // send cookies

  const { username, password, email } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or email is required!!");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user doesn't exist!");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credential!!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRegreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User LoggedIn successfully!"
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = { 
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"));
});

export const generateRefreshToken = asyncHandler(async(req,res)=>{

  const incomingRefreshToken = req.cookies.refreshToken  || req.body.refreshToken

  if(!incomingRefreshToken)
  {
    throw new ApiError(401,"Unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
  
    const user = await User.findById(decodedToken?._id)
  
    if(!user)
    {
      throw new ApiError(401,"Invalid refresh token")
    }
  
    if(incomingRefreshToken !== user?.refreshToken)
    {
      throw new ApiError(401,"Refresh token is expire or used")
    }
  
    const options = {
      httpOnly : true,
      secure : true
    }
  
    const {accessToken,newRefreshToken} =  await generateAccessAndRegreshToken(user?._id)
  
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
      new ApiResponse(200,
        {
          accessToken,newRefreshToken
        },
        "Access token refreshed"
      )
    )
  } catch (error) {
    throw new ApiError(401,error?.message)
  }

})
