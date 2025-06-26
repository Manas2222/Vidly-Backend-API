import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get details from the frontend
  const { fullName, email, username, password } = req.body;
  console.log("User registration details:", { email, password });

  // validations - non empty, valid email, password length, etc.
  if (fullName.trim() === "") {
    throw new ApiError(400, "Full name is required");
  }
  if (email.trim() === "") {
    throw new ApiError(400, "Email is required");
  }
  if (username.trim() === "") {
    throw new ApiError(400, "Username is required");
  }
  if (password.trim().length < 8) {
    throw new ApiError(400, "Password must be atleast 8 characters long");
  }

  // check if user alr exists
  const exsitingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (exsitingUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  // check for images and avatars
  const avatarLocalPath = req.files?.avatar[0]?.path;
  console.log(req.files);
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  // upload avatar to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar image");
  }

  // create user in the database
  const createdUser = await User.create({
    fullName: fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email: email,
    username: username.toLowerCase(),
    password: password,
  });

  // remove pwd and other sensitive data from the response
  isUserCreated = User.findById(createdUser._id).select(
    "-password -refreshToken"
  );

  // check for user creation
  if (!isUserCreated) {
    throw new ApiError(500, "Failed to create user");
  }

  // send response
  return res
    .status(201)
    .json(
      new ApiResponse(201, isUserCreated, "User registered successfully", true)
    );
});

export { registerUser };
