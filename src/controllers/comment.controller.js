import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const comments = await Comment.aggregatePaginate(
      [
        { $match: { video: new mongoose.Types.ObjectId(videoId) } },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ],
      { page, limit, collation: { locale: "en" } }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, comments, "Comments fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Error while fecthing comments");
  }
});

const addComment = asyncHandler(async (req, res) => {
  // add a comment to a video
  const { content } = req.body;
  const { videoId } = req.params;

  try {
    if (!content) {
      throw new ApiError(400, "content is required");
    }
    const comment = new Comment({
      content,
      video: new mongoose.Types.ObjectId(videoId),
      owner: new mongoose.Types.ObjectId(req.user?._id),
    });

    const createdComment = await comment.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, createdComment, "comment is added"));
  } catch (error) {
    throw new ApiError(500, "Error while adding comment");
  }
});

const updateComment = asyncHandler(async (req, res) => {
  // update a comment
  const { content } = req.body;
  const { commentId } = req.params;

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: { content: content },
    },
    { new: true }
  );

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  return res.status(200).json(new ApiResponse(200, comment, "Comment updated"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // delete a comment
  const { commentId } = req.params;

  try {
    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) throw new ApiError(404, "comment not found");

    return res
      .status(200)
      .json(new ApiResponse(200, comment, "comment deleted successfully"));
  } catch (error) {
    throw new ApiError(500, "Error while deleting comment");
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
