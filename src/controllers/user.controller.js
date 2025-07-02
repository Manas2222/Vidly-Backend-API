import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (user) => {
  try {
    // const user = await User.findById(userid);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "there was an error generating tokens: " + error);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get details from the frontend
  const { fullName, email, username, password } = req.body;

  // validations - non empty, valid email, password length, etc.
  if (fullName === "") {
    throw new ApiError(400, "Full name is required");
  }
  if (email === "") {
    throw new ApiError(400, "Email is required");
  }
  if (username === "") {
    throw new ApiError(400, "Username is required");
  }
  if (password.length < 8) {
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
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  // upload avatar to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar image");
  }

  // create user in the databasepm
  const createdUser = await User.create({
    fullName: fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email: email,
    username: username.toLowerCase(),
    password: password,
  });

  // remove pwd and other sensitive data from the response
  const isUserCreated = await User.findById(createdUser._id).select(
    "-password -refreshToken"
  );

  // check for user creation
  if (!isUserCreated) {
    throw new ApiError(500, "Failed to create user");
  }

  // send response
  return res
    .status(201)
    .json(new ApiResponse(200, isUserCreated, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // take data from the frontend
  // confirm the user exists
  // validate the password
  // access and refresh token
  // send tokens via cookies
  // login the user

  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required");
  }

  const foundUser = await User.findOne({ $or: [{ username }, { email }] });

  if (!foundUser) {
    throw new ApiError(404, "User not found, Sign up first");
  }

  const isPasswordValid = await foundUser.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(foundUser);

  // try using the above found user

  const loggedInUser = await User.findById(foundUser._id).select(
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
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: "" } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(404, "Invalid refresh token, user not found");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Invalid/Expired refresh token");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { newAccessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user);

    return res
      .status(200)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            newAccessToken,
            newRefreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token");
  }
});

const changeCurrentUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassoword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPwdCorrect = await user.isPasswordCorrect(current);

  if (!isPwdCorrect) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassoword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  // user alr stored in cookies, make sure to run the auth middleware
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "Full name and email are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    { new: true } // gets updated user
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  // save the previous avatar to delete it later
  const previousAvatar = req.user?.avatar;
  const publicId = previousAvatar?.split("/").pop().split(".")[0];

  // upload to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar image to cloudinary");
  }

  // update the user in the database
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  // delete the old avatar from cloudinary
  if (previousAvatar) {
    await deleteFromCloudinary(publicId);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "cover image file is required");
  }

  // save the previous cover image to delete it later
  const previousCoverImage = req.user?.coverImage;
  const publicId = previousCoverImage?.split("/").pop().split(".")[0];

  // upload to cloudinary
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage) {
    throw new ApiError(500, "Failed to upload coverImage image to cloudinary");
  }

  // update the user in the database
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  // delete the old cover image from cloudinary
  if (previousCoverImage) {
    await deleteFromCloudinary(publicId);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User avatar updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentUserPassword,
  getCurrentUser,
  updateUserDetails,
  updateUserAvatar,
  updateUserCoverImage,
};
