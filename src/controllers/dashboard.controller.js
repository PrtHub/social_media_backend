import { Like } from "../models/like.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const channelStats = await Promise.all([
    Video.aggregate([
      { $match: { owner: channelId } },
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 },
          totalViews: { $sum: "$views" },
        },
      },
    ]),
    Subscription.countDocuments({ channel: channelId }),
    Like.countDocuments({ video: { $elemMatch: { owner: channelId } } }),
  ]);

  const [videoStats, subscriberCount, totalLikes] = channelStats;

  const response = {
    totalVideos: videoStats?.totalVideos ?? 0,
    totalViews: videoStats?.totalViews ?? 0,
    totalSubscribers: subscriberCount ?? 0,
    totalLikes,
  };
  res.json(
    new ApiResponse(200, response, "Channel stats fetched successfully")
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.params;
  const channelId = req.user?._id;

  try {
    const videos = await Video.find({ owner: channelId })
    //   .sort({ createdAt: -1 })
    //   .skip((page - 1) * limit)
    //   .limit(limit);

    return res.status(200).json(
      new ApiResponse(200, videos, "Channel videos fetched successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Error fetching channel videos");
  }
});

export { getChannelStats, getChannelVideos };
