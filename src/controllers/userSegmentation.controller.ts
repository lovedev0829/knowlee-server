import { Request, Response } from "express";
import { ClientSession } from "mongoose";
import { UserModel } from "../models/user.model";
import { UserSegmentationModel } from "../models/userSegmentation.model";
import { RequestError } from "../utils/globalErrorHandler";
import { sendResponse } from "../utils/response.utils";
import { brevoGetContact, brevoUpdateContact } from "../services/brevo.service";

export const create = async (req: Request, res: Response) => {
  if (!req.user) throw new RequestError("Could not verify user", 401);
  const session: ClientSession = req.session!;

  let { id: userId, email, username = "" } = req.user;
  const  questions = req.body;

  // check if there is at least one selected for each question
    if (!questions.professions) {
      throw new RequestError(`Please select a value for the section`, 400)
    }
    const hasGoals = Object.values(questions.goals).some((v) => v === true);
    if (!hasGoals) {
      throw new RequestError(`Please select at least one value for the section`, 400)
    }
    const hasSupport = Object.values(questions.support).some((v) => v === true);
    if (!hasSupport) {
      throw new RequestError(`Please select at least one value for the section`, 400)
    }


  try {
    const segmentationAlreadyExists = await UserSegmentationModel.findOne({ userId }).session(session);
    if (segmentationAlreadyExists) {
      throw new RequestError(`Onboarding already done`, 409)
    } 
    const newUserSegmentation = new UserSegmentationModel({
      userId,
      questions: questions,
    });
    const contact = await brevoGetContact(email)
    if(contact) {
      const attributes = {
        ...contact.body.attributes,
        PROFESSION: newUserSegmentation.questions.professions,
      }
      // we need to push also “username” of users collection ONLY IF “FIRSTNAME” is empty on Brevo
      if (!contact?.body?.attributes?.FIRSTNAME) {
        attributes.username = username;
      }
  
      await brevoUpdateContact(email, {
        attributes: attributes
      })
    }
    await newUserSegmentation.save({session});
    await UserModel.findOneAndUpdate({ id: userId }, { isSegmentationCompleted: true }).session(session)
    
    return sendResponse(res, 200, "User segmentation created successfully", newUserSegmentation);

  } catch (error) {
    throw new RequestError(`Something went wrong with onboarding: ${error}`, 500)
  }
};

export const create_new_segmentation = async (req: Request, res: Response) => {
  if (!req.user) throw new RequestError("Could not verify user", 401);
  const session: ClientSession = req.session!;

  let { id: userId, email, username = "" } = req.user;
  const professions = req.body.professions;

  // check if there is at least one selected for each question
    if (!professions) {
      throw new RequestError(`Please select a value for the professions`, 400)
    }

    const questions = {
      professions: professions,
      goals: null,
      support: null
    }
    
  try {
    const segmentationAlreadyExists = await UserSegmentationModel.findOne({ userId }).session(session);
    if (segmentationAlreadyExists) {
      throw new RequestError(`Onboarding already done`, 409)
    } 
    const newUserSegmentation = new UserSegmentationModel({
      userId,
      questions: questions,
    });

    const contact = await brevoGetContact(email)
    if(contact) {
      const attributes = {
        ...contact.body.attributes,
        PROFESSION: newUserSegmentation.questions.professions,
      }
      // we need to push also “username” of users collection ONLY IF “FIRSTNAME” is empty on Brevo
      if (!contact?.body?.attributes?.FIRSTNAME) {
        attributes.username = username;
      }
  
      await brevoUpdateContact(email, {
        attributes: attributes
      })
    }
    
    await newUserSegmentation.save({session});
    
    return sendResponse(res, 200, "", newUserSegmentation);

  } catch (error) {
    throw new RequestError(`Something went wrong with onboarding: ${error}`, 500)
  }
};


