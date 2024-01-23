import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  // extract the channelId and access the subscriberId
  // checking for existing subscription
  //  If a subscription exists, deletes it
  // If no subscription exists, creates a new one and saves it

  const { channelId } = req.params;
  const subscriberId = req.user?._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }

  try {
    const existingSubscription = await Subscription.findOne({
      channel: channelId,
      subscriber: subscriberId,
    });

    if (existingSubscription) {
      const unsubscribed = await Subscription.findByIdAndDelete(
        existingSubscription._id
      );
      res
        .status(200)
        .json(new ApiResponse(200, unsubscribed, "Unsubscribed successfully"));
    } else {
      const newSubscription = new Subscription({
        channel: channelId,
        subscriber: subscriberId,
      });
      const subscription = await newSubscription.save({
        validateBeforeSave: false,
      });
      res
        .status(200)
        .json(new ApiResponse(200, subscription, "Subscribed successfully"));
    }
  } catch (error) {
    throw new ApiError(500, "Error while changing subscription");
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  //Extracts channelId from request parameters
  //uses $match to filter the subscription for the specified channel
  //uses $lookup to join the user collection and retrieve the subscriber details
  //uses $unwind to flattern the nested array
  //uses $project to specify the fields to includes in the response
  //return the list of subscribers

  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }

  try {
    const subscribers = await Subscription.aggregate([
      {
        $match: {
          channel: new mongoose.Types.ObjectId(channelId),
        },
      },
      {
        $lookup: {
          from: "User",
          localField: "subscriber",
          foreignField: "_id",
          as: "subscriberDetails",
        },
      },
      { $unwind: "$subscriberDetails" },
      {
        $project: {
          _id: 1,
          subscriber: {
            _id: "$subscriberDetails._id",
            username: "$subscriberDetails.username",
            fullname: "$subscriberDetails.fullname",
            avatar: "$subscriberDetails.avatar",
          },
        },
      },
      {
        $count: "totalSubscribers",
      },
    ]);

    if (subscribers.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "No subscriber yet"));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Error while fetching subscribers");
  }
});

export { toggleSubscription, getUserChannelSubscribers };
