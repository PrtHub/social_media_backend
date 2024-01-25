import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(404, "Invalid video id");
  }

  try {
    const existingLike = await Like.findOne({
      video: videoId,
      likedBy: req.user?._id,
    });
    if (existingLike) {
      const unlike = await Like.findByIdAndDelete(existingLike._id);
      return res
        .status(200)
        .json(new ApiResponse(200, unlike, "Video unliked successfully"));
    } else {
      const like = new Like({ video: videoId, likedBy: req.user?._id });
      await like.save({ validateBeforeSave: false });
      return res
        .status(200)
        .json(new ApiResponse(200, like, "Video liked successfully"));
    }
  } catch (error) {
    throw new ApiError(500, "Error while toggle video like");
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(404, "Invalid comment id");
  }

  try {
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id,
      });
      if (existingLike) {
        const unlike = await Like.findByIdAndDelete(existingLike._id);
        return res
          .status(200)
          .json(new ApiResponse(200, unlike, "Comment unliked successfully"));
      } else {
        const like = new Like({ comment: commentId, likedBy: req.user?._id });
        await like.save({ validateBeforeSave: false });
        return res
          .status(200)
          .json(new ApiResponse(200, like, "Comment liked successfully"));
      }
  } catch (error) {
    throw new ApiError(500, "Error while toggle comment like");
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(404, "Invalid tweet id");
  }

  try {
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id,
      });
      if (existingLike) {
        const unlike = await Like.findByIdAndDelete(existingLike._id);
        return res
          .status(200)
          .json(new ApiResponse(200, unlike, "Tweet unliked successfully"));
      } else {
        const like = new Like({ tweet: tweetId, likedBy: req.user?._id });
        await like.save({ validateBeforeSave: false });
        return res
          .status(200)
          .json(new ApiResponse(200, like, "Tweet liked successfully"));
      }
  } catch (error) {
    throw new ApiError(500, "Error while toggle tweet like");
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
      {
        $match: { likedBy: req.user?._id, video: { $exists: true } },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "videoDetails",
        },
      },
      { $unwind: "$videoDetails" },
      {
        $project: {
          _id: 1,
          video: {
            _id: "$videoDetails._id",
            title: "$videoDetails.title",
            videoFile: "$videoDetails.videoFile",
            thumbnail: "$videoDetails.thumbnail",
            description: "$videoDetails.description",
            views: "$videoDetails.views",
          },
        },
      },
    ]);
  
    if (!likedVideos) {
      throw new ApiError(404, "There are no liked videos");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
  });
  

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
