import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT);

router.route('/c/:channelId').post(toggleSubscription)
router.route("/u/:channelId").get(getUserChannelSubscribers)

export default router