import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { response } from "express";

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
      const newSubscription = await Subscription.create({
        channel: channelId,
        subscriber: subscriberId,
      });
      res
        .status(200)
        .json(new ApiResponse(200, newSubscription, "Subscribed successfully"));
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
          from: "users",
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


const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params

  if(!isValidObjectId(subscriberId)){
    throw new ApiError(404, "Invalid subscriberId")
  }

   const subscribedChannels = await Subscription.aggregate([
     { 
      $match: {
        subscriber:  new mongoose.Types.ObjectId(subscriberId),
      }
     },
     {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelDetails"
      }
     },
     {
      $unwind: '$channelDetails'
     },
     {
      $project: {
        _id: 1,
        channel: {
          _id: "$channelDetails._id",
          username: "$channelDetails.username",
          avatar: "$channelDetails.avatar",
        }
      }
     }
   ])  

   if(subscribedChannels.length === 0){
    return res
        .status(200)
        .json(new ApiResponse(200, subscribedChannels, "No channel subscribed yet"));
   }

   return res
   .status(200)
   .json(new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully"));

})

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels};
