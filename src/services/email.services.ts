import { QueryOptions } from "mongoose";
import { FilterQuery } from "mongoose";
import { EmailModel, IEmail } from "../models/email.model";

export const deleteManyEmailDocuments = async (
    filter?: FilterQuery<IEmail>,
    options?: QueryOptions<IEmail>
) => {
    return await EmailModel.deleteMany(filter, options);
};
