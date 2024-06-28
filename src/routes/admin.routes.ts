import express, { NextFunction, Request, Response } from "express";
import { checkJwt } from "../middleware/auth";
import { errorWrap } from "../utils/errors.util";
import { checkUser } from "../middleware/checkUser";
import {
  cleanupUserKnowledgesController,
  deleteUnusedVectorsController,
  deleteUserAdminController,
  getAdminDashboardStatsController,
  unscheduleUnusedDoubleStepEntityController,
} from "../controllers/admin.controller";
import { RequestError } from "../utils/globalErrorHandler";
import { withTransaction } from "../utils/transactionHelper";

export async function checkIsSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req?.user?.isSuperAdmin) {
    next();
  } else {
    const error = new RequestError("Unauthorized Access", 401);
    next(error);
  }
}

const router = express.Router();
router.use(errorWrap(checkJwt, "Could not verify user"));
router.use(errorWrap(checkUser, "Could not verify user"));
router.use(checkIsSuperAdmin);

router.get(
  "/dashboard-stats",
  errorWrap(
    getAdminDashboardStatsController,
    "Could not get admin dashboard stats"
  )
);

router.delete(
  "/user/:userId",
  withTransaction(
    errorWrap(
      deleteUserAdminController,
      "Could not delete User"
    )
  )
);

router.post(
  "/entity/unschedule-unused-double-step-entity",
  errorWrap(
    unscheduleUnusedDoubleStepEntityController,
    "Could not unschedule double step entity"
  )
);

router.delete(
  "/unused-vectors",
  errorWrap(
    deleteUnusedVectorsController,
    "Could not delete unused vectors"
  )
);

router.delete(
  "/cleanup-userknowledges",
  errorWrap(
    cleanupUserKnowledgesController,
    "Could not cleanup userknownledges"
  )
);

export default router;
