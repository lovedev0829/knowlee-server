import express from "express";
import { errorWrap } from "../utils/errors.util";
import { checkJwt } from "../middleware/auth";
import { checkUser } from "../middleware/checkUser";
import {
    addDefaultAgent,
    cancelThreadRunController,
    createAgentController,
    createMessageInUserThreadsController,
    createUserThreadsController,
    createUserThreadsRunController,
    deleteAssistantController,
    deleteUserThreadsController,
    getAssistantsListController,
    getDefaultAgentsController,
    getFilteredUserAgentsWithFunctionTypesController,
    getMessagesInUserThreadsController,
    getThreadRunsController,
    getUserAgentsController,
    getUserThreadsController,
    getUserThreadsRunController,
    retrieveAssistantController,
    threadsRunsStreamController,
    updateAssistantController,
    updateUserThreadsController,
} from "../controllers/knowleeAgent.controller";
import { withTransaction } from "../utils/transactionHelper";
import { checkUserUsage } from "../middleware/subscription";
import { getAvailableFunctionDefinitionController, getAvailableFunctionDefinitionWithGroupingController } from "../controllers/functionDefinition.controller";
import {
    generateAssistantUrl,
    handleShareAssistant
} from "../controllers/shareAssistant.controller"
import multer from "multer";

const router = express.Router();
router.use(errorWrap(checkJwt, "Could not verify jwt"));
router.use(errorWrap(checkUser, "Could not verify user"));

const upload = multer();

router.get("/assistants", errorWrap(getAssistantsListController, "Could not get assistants"));

router.get(
    "/assistants/:assistantId",
    errorWrap(retrieveAssistantController, "Could not get assistant")
);

router.post(
    "/assistants/:assistantId",
    withTransaction(errorWrap(updateAssistantController, "Could not update agent"))
);

router.post(
    "/",
    // checkUserUsage("maxUserAgentCount"),
    checkUserUsage("maxTokens"),
    withTransaction(errorWrap(createAgentController, "Could not create agent"))
);

router.delete(
    "/assistants/:assistantId",
    withTransaction(
        errorWrap(deleteAssistantController, "Could not delete assistant")
    )
);

router.get("/user-agents", errorWrap(getUserAgentsController, "Could not get user agents"));

router.get("/filtered-user-agents", errorWrap(getFilteredUserAgentsWithFunctionTypesController, "Could not get user agents"));

router.get("/user-threads", errorWrap(getUserThreadsController, "Could not get user threads"));

router.post(
    "/user-threads",
    checkUserUsage("maxTokens"),
    errorWrap(createUserThreadsController, "Could not create threads")
);

router.patch(
    "/user-threads/:threadId",
    withTransaction(
        errorWrap(updateUserThreadsController, "Could not update threads")
    )
);

router.delete(
    "/user-threads/:threadId",
    withTransaction(
        errorWrap(deleteUserThreadsController, "Could not delete threads")
    )
);

router.post(
    "/user-threads/run",
    checkUserUsage("maxTokens"),
    errorWrap(createUserThreadsRunController, "Could not run thread")
);

router.get(
  "/user-threads/run",
  checkUserUsage("maxTokens"),
  errorWrap(getUserThreadsRunController, "Could not get run")
);

router.get(
    "/user-threads/:threadId/runs",
    errorWrap(getThreadRunsController, "Could not get thread runs")
);

router.get("/user-threads-message/:threadId", errorWrap(getMessagesInUserThreadsController, "Could not get messages from threads"));

router.post(
    "/user-threads-message",
    checkUserUsage("maxTokens"),
    errorWrap(
        createMessageInUserThreadsController,
        "Could not create message in threads"
    )
);

router.post(
    "/threads/:userThreadId/runs/stream",
    checkUserUsage("maxTokens"),
    errorWrap(
        threadsRunsStreamController,
        "Could not run threads stream"
    )
);

router.get(
  "/default-agents",
  errorWrap(getDefaultAgentsController, "Could not create message in threads")
);

router.post(
  "/default-agents/user-agent",
//   checkUserUsage("maxUserAgentCount"),
    checkUserUsage("maxTokens"),
  errorWrap(addDefaultAgent, "Could not add agent")
);


// function definitions
router.get(
    "/function-definitions",
    errorWrap(getAvailableFunctionDefinitionController, "Could not get function definitions")
);

router.get(
    "/function-definitions-with-grouping",
    errorWrap(getAvailableFunctionDefinitionWithGroupingController, "Could not get function definitions types")
);

// Endpoint to generate a share token and URL
router.post('/share',   errorWrap(generateAssistantUrl, "Could not generate share assistant url"));

// Endpoint to handle the share URL access
router.get('/share', errorWrap(handleShareAssistant, "Could not handle share assistant"));

router.post(
    "/threads/:userThreadId/runs/cancel",
    errorWrap(
        cancelThreadRunController,
        "Could not cancel the run"
    )
);

export default router;
