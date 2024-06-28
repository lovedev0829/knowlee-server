import { UserKnowledgeModel } from "../../../models/userKnowledge.model";
import { User } from "../../../models/user.model";

export async function userKnowledgeFunction({ user }: { user: User }) {
    if (!user) return "please provide user";
    const { id: userId } = user;
    try {
        const userKnowledge = await UserKnowledgeModel.findOne({ userId });

        if (!userKnowledge) return 'UserKnowledge does not exist';

       return userKnowledge;
    } catch (error: any) {
        //console.log(error);
        return error?.message;
    }
}
