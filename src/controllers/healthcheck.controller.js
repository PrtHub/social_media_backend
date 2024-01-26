import connectDB from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  try {
    await connectDB()
    res.status(200).json(new ApiResponse(200, "OK", "Server is up and running"));
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Internal server error");
  }
});

export { healthcheck };
