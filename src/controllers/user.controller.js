import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return {accessToken, refreshToken}


} catch (error) {
    throw new ApiError(500, "Something went wrong while generating referesh and access token")
}
};

const registerUser = asyncHandler(async (req, res) => {
  // get the user details from frontend
  // valodation - not empty
  // check if the user is already registered
  // check for images, check for avater
  // upload them to cloudinary, avater
  // create user object - create entry in db
  // remove password and refreash token from the response
  // check for user creation
  // return res

  const { fullname, username, email, password } = req.body;
  console.log("email: " + email);

  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields mustn't be empty");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  const avatarLocalPath = req.files.avatar[0]?.path;
  let coverImageLocalPath;

  if (
    res.files &&
    Array.isArray(res.files.coverImage) &&
    res.files.coverImage.length > 0
  ) {
    coverImageLocalPath = res.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar upload is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const isCreatedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!isCreatedUser) {
    throw new ApiError(500, "Something went wrong when registering user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, isCreatedUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // take the data from req body
  // username and password
  // find the user
  // check the password is correct
  //access and refresh token
  // send cookies

  const { username, email, password } = req.body;

  if (!email && !username) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(400, "User doesn't found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

  const logedInUser = await User.findById(user._id).select("-password -refreshToken");

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
          user: logedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
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
  )

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged out "))

});

export { registerUser, loginUser, logoutUser };
