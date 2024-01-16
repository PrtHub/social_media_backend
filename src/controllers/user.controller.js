import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async(req, res) => {
   // get the user details from frontend
   // valodation - not empty
   // check if the user is already registered
   // check for images, check for avater
   // upload them to cloudinary, avater
   // create user object - create entry in db
   // remove password and refreash token from the response
   // check for user creation
   // return res

   const {fullname, username, email, password} = req.body
   console.log("email: " + email)


   if([fullname, username, email, password].some((field) => field?.trim() === "")){
    throw new ApiError(400, "All fields mustn't be empty")
   }

   const existedUser = User.findOne({
    $or: [{username}, {email}]
   })

   if(existedUser){
    throw new ApiError(409, "User already exists")
   }

   const avatarLocalPath = req.files.avatar[0]?.path;
   const coverImageLocalPath = req.files.coverImage[0]?.path;

   if(!avatarLocalPath){
    throw new ApiError(400, "Avatar is required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage= await uploadOnCloudinary(coverImageLocalPath)

   if(!avatarupload){
     throw new ApiError(400, "Avatar upload is required")
   }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
   })

  const isCreatedUser = await User.findById(user._id).select("-password -refreshToken")

  if(!isCreatedUser){
    throw new ApiError(500, "Something went wrong when registering user")
  }

  return res.status(201).json(
    new ApiResponse(200, isCreatedUser, "User registered successfully")
  )

})

export { registerUser }