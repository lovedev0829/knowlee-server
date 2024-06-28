import UserReferralModel from "../models/userReferral.model";
import { findUser } from "../services/user.services";
import { findAndUpdateUserReferral, findOneUserReferral } from "../services/userReferral.services";
import { findOneAndUpdateUserUsageStatDocument } from "../services/userUsageStat.services";

export const MAX_EMAILS_PER_DAY = 5;
export const BONUS_CREDIT = 1000;

export function validateEmail(email: string): boolean {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export const countInvitesLast24Hours = async (userId: string) => {
    const userReferral = await findOneUserReferral({ userId });
    if (!userReferral) return 0;

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const countInvitee = userReferral.invitedEmails.filter(invite => invite.sentAt && new Date(invite.sentAt) >= oneDayAgo).length;
    return countInvitee;
}

export const isMatchingSignUp = async (userId: string) => {
    const userReferralInvite = await findOneUserReferral({ userId });
    if (!userReferralInvite) return;

    const invitedEmails = userReferralInvite.invitedEmails.map(inviteeEmail => inviteeEmail.email);
    const userList = await findUser({ email: { $in: invitedEmails } });

    await Promise.all(userList.map(async (matchedUser) => {
        const inviteeEmail = userReferralInvite.invitedEmails.find(emailObj => emailObj.email === matchedUser.email);
        if (inviteeEmail && !inviteeEmail.signedUp && new Date(inviteeEmail.sentAt) <= new Date(matchedUser.createdAt)) {
            await findAndUpdateUserReferral(
                { userId, "invitedEmails.email": inviteeEmail.email },
                {
                    $set: {
                        "invitedEmails.$[elem].signedUp": true,
                        "invitedEmails.$[elem].signedUpAt": matchedUser.createdAt,
                    },
                },
                { new: true, arrayFilters: [{ "elem.email": inviteeEmail.email }] }
            );

            await findOneAndUpdateUserUsageStatDocument(
                { userId },
                { $inc: { "credit.total": BONUS_CREDIT } },
                { upsert: true, new: true }
            );
        }
    }));
}

export const updateSignUpStatus = async (email: string, createdAt: Date) => {
    if (!validateEmail(email)) {
        console.error("Invalid email format:", email);
        return;
    }

    try {
        const userReferral = await findOneUserReferral({ "invitedEmails.email": email });
        if (userReferral) {
            const inviteeEmail = userReferral.invitedEmails.find(emailObj => emailObj.email === email);
            if (inviteeEmail && !inviteeEmail.signedUp && new Date(inviteeEmail.sentAt) <= createdAt) {
                await findAndUpdateUserReferral(
                    { "invitedEmails.email": email },
                    {
                        $set: {
                            "invitedEmails.$[elem].signedUp": true,
                            "invitedEmails.$[elem].signedUpAt": createdAt,
                        },
                    },
                    { arrayFilters: [{ "elem.email": email }], new: true }
                );
            }
        } else {
            //console.log(`User referral not found for email: ${email}`);
        }
    } catch (error) {
        console.error("Error updating sign up status:", error);
    }
};

export const checkingMidnightForInviteeEmail = async () => {
    try {
        const userReferrals = await UserReferralModel.find({});
        const userList = await findUser({});

        const userReferralListWithEmailsInUserList = userReferrals.map(userReferral =>
            userReferral.invitedEmails.map(invitee =>
                userList.some(user => user.email === invitee.email)
            )
        );

        //console.log("User referral list with emails in user list:", userReferralListWithEmailsInUserList);
    } catch (error) {
        console.error("Error during midnight check for invitee emails:", error);
    }
};
