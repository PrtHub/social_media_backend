import { isValidObjectId } from "mongoose";
import { PlayList } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    throw new ApiError(404, "Please provide a name");
  }

  try {
    const playlist = await PlayList.create({
      name: name,
      description: description,
      videos: [],
      owner: req.user._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "playlist created successfully"));
  } catch (error) {
    throw new ApiError(500, "Error while creating playlist");
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist ID or video ID");
  }

  try {
    const updatedPlaylist = await PlayList.findOneAndUpdate(
      { _id: playlistId, owner: userId }, // Ensure ownership
      { $addToSet: { videos: videoId } },
      { new: true }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedPlaylist,
          "Video added to the playlist successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error while adding video to the playlist");
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist ID or video ID");
  }

  try {
    const updatedPlaylist = await PlayList.findOneAndUpdate(
      { _id: playlistId, owner: userId }, // Ensure ownership
      { $pull: { videos: videoId } },
      { new: true }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedPlaylist,
          "Video removed from playlist successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error while adding video to the playlist");
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  const userId = req.user?._id;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(404, "Invalid playlist id");
  }

  if (!name) {
    throw new ApiError(404, "Please provide a name");
  }

  try {
    const playlist = await PlayList.findByIdAndUpdate(
      { _id: playlistId, owner: userId },
      {
        $set: {
          name: name,
          description: description,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "playlist updated successfully"));
  } catch (error) {
    throw new ApiError(500, "Error while updating playlist");
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(404, "Invalid playlist id");
  }

  try {
    const playlist = await PlayList.findByIdAndDelete({
      _id: playlistId,
      owner: userId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "playlist deleted successfully"));
  } catch (error) {
    throw new ApiError(500, "Error while deleting playlist");
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(404, "Invalid user id");
  }

  const playlist = await PlayList.find({ owner: userId })
    .populate("videos", { _id: 0 })
    .populate("owner", "username fullname avatar");

  if (!playlist) {
    throw new ApiError(404, "No user playlist found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "User playlists fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(404, "Invalid playlist id");
  }

  const playlist = await PlayList.findById(playlistId)
    .populate("videos", { _id: 0 /* Define projection for videos */ })
    .populate("owner", "username fullname avatar");

  if (!playlist) {
    throw new ApiError(404, "No playlist found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlists fetched successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
  deletePlaylist,
};
