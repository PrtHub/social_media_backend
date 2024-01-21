import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  // retreive all videos from the databases
  // apply the query based filtering if the query is present
  // Sort video besed on sortBy and sortType
  // retrieve the appropriate page of videos based on the page number and the limit

  try {
    let aggregationPipeline = [];

    //filters videos based on a case-insensitive regular expression match in the title field
    if (query) {
      aggregationPipeline.push({
        $match: {
          title: {
            $regex: query,
            $options: "i",
          },
        },
      });
    }

    if (userId) {
      aggregationPipeline.push({
        $match: { userId: userId },
      });
    }

    // arranges videos in a specified order based on a given field and direction.
    if (sortBy) {
      aggregationPipeline.push({
        $sort: { [sortBy]: sortType },
      });
    }

    const videos = await Video.aggregatePaginate({
      pipeline: aggregationPipeline,
      page,
      limit,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, videos, "videos fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Error while fetching videos");
  }
});

export { getAllVideos };
