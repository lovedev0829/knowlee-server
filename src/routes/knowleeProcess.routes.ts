import express from "express";
import { errorWrap } from "../utils/errors.util";
import { checkJwt } from "../middleware/auth";
import { checkUser } from "../middleware/checkUser";
import { withTransaction } from "../utils/transactionHelper";
import {
    getUserProcessesController,
    createUserProcessController,
    deleteUserProcessController,
    retrieveUserProcessController,
    updateUserProcessController,
    manuallyRunUserProcessController,
    getDefaultProcessesController,
    getMessagesOfUserProcessThreadController,
    getRunsOfUserProcessThreadController,
    addDefaultProcess,
} from "../controllers/knowleeProcess.controller";
import { checkUserUsage } from "../middleware/subscription";

const router = express.Router();
router.use(errorWrap(checkJwt, "Could not verify jwt"));
router.use(errorWrap(checkUser, "Could not verify user"));

router.post(
    "/user-process/manual-run/:processId",
    errorWrap(manuallyRunUserProcessController, "Could not run process manually")
);

router.post(
    "/user-process/:processId",
    withTransaction(
        errorWrap(updateUserProcessController, "Could not update user process")
    )
);

router.post(
    "/",
    withTransaction(
        errorWrap(createUserProcessController, "Could not create user process")
    )
);

router.delete(
    "/user-process/:processId",
    withTransaction(
        errorWrap(deleteUserProcessController, "Could not delete assistant")
    )
);

router.get(
    "/user-processes",
    errorWrap(getUserProcessesController, "Could not get user processes")
);

router.get(
    "/user-process/threads/:threadId/messages",
    errorWrap(getMessagesOfUserProcessThreadController, "Could not get user process thread messages")
);

router.get(
    "/user-process/threads/:threadId/runs",
    errorWrap(getRunsOfUserProcessThreadController, "Could not get user process thread runs")
);

router.get(
    "/user-process/:processId",
    errorWrap(retrieveUserProcessController, "Could not get user process")
);

router.get(
    "/default-processes",
    errorWrap(getDefaultProcessesController, "Could not get default processes")
);

router.post(
    "/default-processes",
    checkUserUsage("maxTokens"),
    errorWrap(addDefaultProcess, "Could not add default process")
);

export default router;
