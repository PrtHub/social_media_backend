import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (content.trim() === "") {
    throw new ApiError(400, "content required");
  }

  try {
    const tweet = await Tweet.create({
      content: content,
      owner: req.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, tweet, "tweet created successfully"));
  } catch (error) {
    throw new ApiError(500, "error while creating tweet");
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  try {
    const tweets = await Tweet.aggregate(
      [
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        { $sort: { createdAt: -1 } },
      ],
      { collation: { locale: "en" } }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Error while getting userTweets");
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  if (content.trim() === "") {
    throw new ApiError(400, "content required");
  }

  try {
    const tweet = await Tweet.findByIdAndUpdate(
      tweetId,
      {
        $set: {
          content: content,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, tweet, "tweet updated successfully"));
  } catch (error) {
    throw new ApiError(500, "error while updating tweet");
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(404, "Invalid tweet id");
  }

  const tweet = await Tweet.findByIdAndDelete(tweetId);

  if (!tweet) throw new ApiError(404, "twwet not found");

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
