import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllVideos } from "../controllers/video.controller.js";

const router = Router()

router.route(verifyJWT)

router.route('/all-videos').get(getAllVideos)

export default router