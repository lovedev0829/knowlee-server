import { Request, Response } from "express";
import { sendResponse } from "../utils/response.utils";
import { RequestError } from "../utils/globalErrorHandler";
import { sendMail } from "../services/sendEmail.services"; 

// send support email
export const sendSupportEmail = async (req: Request, res: Response) => {
  try {
    const { email, object, message } = req.body;
    if (!email) throw new RequestError("email is required", 400);
    if (!object) throw new RequestError("object is required", 400);
    if (!message) throw new RequestError("message is required", 400);

    const info = await sendMail({
      subject: object,
      text: `Sender ${email} - ${message}`,
    });
    return sendResponse(res, 201, "support mail sent", info);
  } catch (error) {
    throw new RequestError("Failed to send support email", 500);
  }
};
