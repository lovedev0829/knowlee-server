import { Request, Response } from "express";
import { findOneAndUpdateUserReferral, findOneUserReferral } from "../services/userReferral.services";
import { RequestError } from "../utils/globalErrorHandler";
import { sendResponse } from "../utils/response.utils";
import { MAX_EMAILS_PER_DAY, countInvitesLast24Hours, isMatchingSignUp, validateEmail } from "../utils/userReferral.utils";
import { sendMail } from "../services/sendEmail.services";
import { status } from "../utils/constants";


export const sendReferralMail = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) throw new RequestError("Could not verify user", status.not_registered);

    const { email } = req.body;
    if (!email) throw new RequestError("Could not verify user", status.not_found);

    if (email === user.email) throw new RequestError("You can't invite yourself", status.bad_request);

    // Validated each email address
    const isValidEmail = validateEmail(email);
    if (!isValidEmail) {
        throw new RequestError("Invalid email addresses", status.bad_request);
    }

    // Check if the user has exceeded their limit. MAX_EMAILS_PER_DAY = 3
    const totalInvitesEmailSent = await countInvitesLast24Hours(user.id) || 0;

    if (totalInvitesEmailSent >= MAX_EMAILS_PER_DAY) {
        throw new RequestError("You can invite up to 5 friends daily.", status.bad_request);
    }

    try {
        // Send the email
        const mailOptions = {
            to: email,
            subject: "Join me on Knowlee and unlock rewards!",
            html: `<p>Hi there,</p>
                   <p>I've been using Knowlee and thought you might like it too! Use my referral link to sign up and we'll both get rewards:</p>
                   <a href="https://app.knowlee.ai">Click here to register</a>
                   <p>See you there!</p>`,
        };
        const info = await sendMail(mailOptions);

        if (info && info.messageId) {
            // Update email sent records in the database
            const userReferralAdd = await findOneAndUpdateUserReferral(
                { userId: user.id },
                {
                    $push: {
                        invitedEmails: { email: email },
                    },
                },
                { new: true, upsert: true }
            );
            
            sendResponse(res, status.success, "success", userReferralAdd)
        } else {
            throw new Error("Failed to send email. Message ID not available.");
        }
    } catch (error) {
        console.error("Error sending referral email", error);
        throw new RequestError("Error sending referral email", status.error);
    }
};

export const getReferralDetails = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) throw new RequestError("Could not verify user", status.not_registered);
    const userID = user.id;

    try {
        const userReferral = await findOneUserReferral({ userId: userID });
        await isMatchingSignUp(userID);
        const totalInvites = userReferral?.invitedEmails.length;

        const signedUpInvites = userReferral?.invitedEmails.filter(invite => invite.signedUp).length;

        sendResponse(res, status.success, "success", { totalInvites, signedUpInvites })

    } catch (error) {
        console.error("Error in getSignedUpInvites:", error);
        throw error;
    }
};

