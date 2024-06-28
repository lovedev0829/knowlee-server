import express from "express";

import { get } from "../controllers/userKnowledge.controller";
import { checkJwt } from "../middleware/auth";
import { errorWrap } from "../utils/errors.util";
import {
  addEntities,
  processBulkUplaodEntities,
  getAllUserEntities,
  removeEntity,
  getEntityScrapedDataController,
  getAllEntitiesController,
  findEntitiesController,
  getAllScrapedUserEntities,
  handleGoogleDriveTextController,
  handleOneDriveFileController
} from "../controllers/entity.controller";
import { withTransaction } from "../utils/transactionHelper";
import { checkUser } from "../middleware/checkUser";
import multer from "multer";
import { checkUserUsage } from "../middleware/subscription";

const upload = multer();

const router = express.Router();

router.get(
  "/all/:userId",
  errorWrap(checkJwt, "Could not verify user"),
  errorWrap(getAllUserEntities, "Could not get userKnowledge")
);


router.get(
  "/all-scraped/:userId",
  errorWrap(checkJwt, "Could not verify user"),
  errorWrap(getAllScrapedUserEntities, "Could not get userKnowledge")
);

router.get(
  "/find-entities",
  errorWrap(checkJwt, "Could not verify user"),
  errorWrap(checkUser, "Could not verify user"),
  errorWrap(findEntitiesController, "Could not get entities")
);

router.get(
  "/",
  errorWrap(checkJwt, "Could not verify user"),
  errorWrap(checkUser, "Could not verify user"),
  errorWrap(getAllEntitiesController, "Could not get entities")
);

router.get(
  "/scraped-data/:entityId",
  errorWrap(checkJwt, "Could not verify user"),
  errorWrap(
    getEntityScrapedDataController,
    "Could not get scraped data of entity"
  )
);

router.get(
  "/:userId/:entityId",
  errorWrap(checkJwt, "Could not verify user"),
  errorWrap(get, "Could not get single entity")
);

router.post(
  "/bulk-upload",
  errorWrap(checkJwt, "Could not verify JWT"),
  errorWrap(checkUser, "Could not verify user"),
  upload.single("file"),
  checkUserUsage("ENTITY_BULK_UPLOAD_VIA_CSV"),
  withTransaction(errorWrap(processBulkUplaodEntities, "Could not process bulk upload"))
);

router.post(
  "/handle-google-drive-text",
  errorWrap(checkJwt, "Could not verify JWT"),
  errorWrap(checkUser, "Could not verify user"),
  errorWrap(handleGoogleDriveTextController, "could not handle google drive text")
);

router.post(
  "/handle-onedrive-file",
  errorWrap(checkJwt, "Could not verify JWT"),
  errorWrap(checkUser, "Could not verify user"),
  errorWrap(handleOneDriveFileController, "could not handle OneDrive file")
);

router.post(
  "/:userId",
  errorWrap(checkJwt, "Could not verify user"),
  errorWrap(checkUser, "Could not verify user"),
  checkUserUsage("MULTIPLE_ENTITIES"),
  withTransaction(errorWrap(addEntities, "Could not add entity"))
);

router.delete(
  "/:userId/:entityId",
  errorWrap(checkJwt, "Could not verify user"),
  withTransaction(errorWrap(removeEntity, "Could not remove entity"))
);

export default router;
