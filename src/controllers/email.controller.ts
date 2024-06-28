import { Request , Response} from 'express'
import { sendResponse } from '../utils/response.utils'
import { EmailModel } from '../models/email.model';

export const create = async (req: Request, res: Response) => {
  const { email } = req.body;

  // Validate email
  if (!email) return sendResponse(res, 400, 'Email is required');

  // Check if the email exists
  const existingEmail = await EmailModel.findOne({ email });
  if (existingEmail) return sendResponse(res, 400, 'Email already exists');

  try {
    const newEmail = new EmailModel({ email });
    await newEmail.save();
    res.status(201).json(newEmail);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
