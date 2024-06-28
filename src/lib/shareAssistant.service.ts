
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import {
    findOneUserAgentDocument,
    createOneUserAgentDocument
} from "../services/knowlee-agent/agent.services";
import { findOneAndUpdateUserUsageStatDocument } from "../services/userUsageStat.services";
import { RequestError } from "../utils/globalErrorHandler";

const secretKey = crypto.randomBytes(64).toString("hex");
interface Decoded {
    userId: string;
    assistantId: string;
}
export const generateToken  = ({userId, assistantId}: {
    userId: string, 
    assistantId:string
})  => {

    const payload = {
        userId: userId,
        assistantId: assistantId,
      };
    
      // Define token options, such as expiry
      const options = {
        expiresIn: '1h', // Token expires in 1 hour
      };
    
      // Sign the token with the secret key
      const token = jwt.sign(payload, secretKey, options);
      return token;

}

export const validateToken  = async (token: any)  => {
    try {
        // Verify the token with the same secret key used to sign it
        jwt.verify(token, secretKey) as Decoded;;
        return true; // Return true if verification succeeds
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.error("Token has expired");
        } else if (error instanceof jwt.JsonWebTokenError) {
            console.error("Token is invalid");
        } else {
            console.error("Error verifying token", error);
        }
        return false; // If there is an error, return false
    }
}

export const copyAssistantConfig  = async (token: string, newUserId:string)  => {
    
    // Verify the token with the same secret key used to sign it
    const decoded = jwt.verify(token, secretKey) as Decoded;;
    const { userId, assistantId } = decoded;
   
    const dbAgent = await findOneUserAgentDocument({
       "assistant.id": assistantId,
       creatorId: userId,
    });

    const isExistAgent = await findOneUserAgentDocument({
        "assistant.id": assistantId,
        creatorId: newUserId,
     });

    if (!dbAgent) throw new RequestError("Could not find this assistant", 404);
    
    const metadata =  dbAgent.assistant.metadata as { entityIds: string, creatorId: string };

    const clonedData = {
        creatorId: newUserId,
        avatar: dbAgent.avatar || {},
        assistant: {
          ...dbAgent.assistant,
          metadata: {
            creatorId: newUserId,
            entityIds: metadata.entityIds || "",
          },
        },
        entityIds: dbAgent.entityIds,
        initialPrompts: dbAgent.initialPrompts,
        functionDefinitions: dbAgent.functionDefinitions,
        functionTypes: dbAgent.functionTypes,
    };

    // Creator can not clone own assistant
    if(dbAgent.creatorId === newUserId) {
        return false;
    } 
    
    // Can not clone again if you have one.
    if(isExistAgent){
        return false;
    }

    try {

        await findOneAndUpdateUserUsageStatDocument(
            { userId: newUserId },
            { $inc: { userAgentCount: 1 } },
            { upsert: true, new: true }
        );

        await createOneUserAgentDocument(clonedData);

        return true;
    } catch (error) {
        return false
    }
}