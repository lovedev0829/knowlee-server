import express from "express";

import userRoutes from "./user.routes";
import dashboardsummaryRoutes from "./dashboardsummary.routes";
import authRoutes from "./auth.routes";
import conversationRoutes from "./conversation.routes";
import userKnowledgeRoutes from "./userKnowledge.routes";
import entityRoutes from "./entity.routes";
import emailRoutes from "./email.routes";
import pineconeRoutes from "./pinecone.routes";
import userSettingRoutes from "./userSetting.routes";
import userSegmentationRoutes from "./userSegmentation.routes";
import playHTRoutes from "./playHT.routes";
import queryMediaRoutes from "./queryMedia.routes";
import queryQuestionRoutes from "./queryQuestion.routes";
import documentChatRoutes from "./documentChat.routes";
import sendEmailRoutes from "./sendEmail.routes";
import uploadRoutes from "./upload.routes";
import nottificationsRoutes from "./notifications.routes";
import stripeRoutes from "./stripe.routes";
import { sendResponse } from "../utils/response.utils";
import contentRoutes from "./content.routes";
import topicRoutes from "./topic.routes";
import tutorialRoutes from "./tutorial.routes";
import knowleeAgentRoutes from "./agent.routes";
import knowleeProcessRoutes from "./knowleeProcess.routes";
import insightCreationRoutes from "./insightCreation.routes";
import adminRoutes from "./admin.routes";
import userUsageRoutes from "./userUsage.routes";
import footballRoutes from "./football.routes";
import videoToVideoRoutes from "./videoToVideo.routes";
import thirdPartyRoutes from "./thirdParty.routes";
import mediumRoutes from "./medium.routes";
import subscriptionRoutes from "./subscription.routes";
import twitterRoutes from "./twitter.routes";
import telegramRoutes from "./telegram.routes";
import userReferralRoutes from "./userReferral.routes";
import carbonAIRoutes from "./carbonAI.routes";

const router = express.Router();

router.get("/", (req, res) => sendResponse(res, 200, `API is running`));
router.use("/api/auth", authRoutes);
router.use("/api/carbon-ai", carbonAIRoutes);
router.use("/api/user", userRoutes);
router.use("/api/dashboardsummary", dashboardsummaryRoutes);
router.use("/api/userKnowledge", userKnowledgeRoutes);
router.use("/api/entity", entityRoutes);
router.use("/api/email", emailRoutes);
router.use("/api/userSetting", userSettingRoutes);
router.use("/api/userSegmentation", userSegmentationRoutes);
router.use("/api/documentChat", documentChatRoutes);
router.use("/api/upload", uploadRoutes);
router.use("/api/notifications", nottificationsRoutes);
router.use("/api/queryMedia", queryMediaRoutes);
router.use("/api/conversation", conversationRoutes);
router.use("/api/query-question", queryQuestionRoutes);
router.use("/api/pinecone", pineconeRoutes);
router.use("/api/send-email", sendEmailRoutes);
router.use("/api/play-ht", playHTRoutes);
router.use("/api/content-creation/content", contentRoutes);
router.use("/api/content-creation/topic", topicRoutes);
router.use("/api/tutorial", tutorialRoutes);
router.use("/api/knowlee-agent", knowleeAgentRoutes);
router.use("/api/knowlee-process", knowleeProcessRoutes);
router.use("/api/insight-creation", insightCreationRoutes);
router.use("/api/admin", adminRoutes);
router.use("/api/user-usage", userUsageRoutes);
router.use("/api/football",footballRoutes)
router.use("/api/video-to-video", videoToVideoRoutes);
router.use("/api/stripe", stripeRoutes);
router.use("/api/medium", mediumRoutes);
router.use("/api/subscriptions", subscriptionRoutes);
router.use("/api/third-party", thirdPartyRoutes);
router.use("/api/twitter", twitterRoutes);
router.use("/api/telegram", telegramRoutes);
router.use("/api/userReferral",userReferralRoutes)

export default router;