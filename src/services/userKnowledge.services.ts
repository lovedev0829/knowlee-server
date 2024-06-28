import { FilterQuery, ProjectionType, QueryOptions, UpdateQuery } from "mongoose";
import { IUserKnowledge, UserKnowledgeModel } from "../models/userKnowledge.model";
import { findOneEntity } from "./entity.services";
import { findOneDocRecord } from "./docRecord.services";
import { findOneAndUpdateUserUsageStatDocument } from "./userUsageStat.services";

export async function getUserKnowledgeByEntityId(entityId: string) {
    return await UserKnowledgeModel.find({ entities: entityId });
}

export async function userKnowledgeAddEntities(userIdList: string[], entityIdList: string[]) {
    const userKnowledge = await UserKnowledgeModel.updateMany(
        { userId: { $in: userIdList } },
        { $push: { entities: { $each: entityIdList } } },
        { new: true },
    );
    return userKnowledge;
}


export const deleteManyUserKnowledges = async (
    filter?: FilterQuery<IUserKnowledge>,
    options?: QueryOptions<IUserKnowledge>
) => {
    return await UserKnowledgeModel.deleteMany(filter, options);
};


export async function findUserKnowledge(
    filter: FilterQuery<IUserKnowledge>,
    projection?: ProjectionType<IUserKnowledge>,
    options?: QueryOptions<IUserKnowledge>
) {
    return await UserKnowledgeModel.find(filter, projection, options);
}

export const countUserKnowledge = async (
    filter?: FilterQuery<IUserKnowledge>,
) => {
    return await UserKnowledgeModel.count(filter);
};

export async function recalculateUserUsageEntityCount() {
    // get all userknowledges
    const userKnowledgeList = await findUserKnowledge({});

    // for each userKnowledge
    for (const userKnowledge of userKnowledgeList) {
        const { entities, userId } = userKnowledge;
        const entityCount: { [key: string]: { [key: string]: number } } = {
            youtube: {
                account: 0,
                video: 0,
            },
            twitter: {
                tweet: 0,
                thread: 0,
                profile: 0,
                cashtag: 0,
                hashtag: 0,
            },
            medium: {
                article: 0,
                account: 0,
            },
            news: {
                keyword: 0,
                url: 0,
            },
            pdf: {
                url: 0,
            },
            url: {
                url: 0,
            },
            coda: {
                url: 0,
            },
            reddit: {
                url: 0,
            },
        }
        let localEntityCount = 0;

        // for each entityId in the entities array
        for (const entityId of entities) {
            // get entity document
            const entity = await findOneEntity({ id: entityId });

            if (!entity) {
                // it can be a local entity
                const docRecord = await findOneDocRecord({ entityId: entityId });

                if (!docRecord) {
                    // remove entityId from userKnowledge
                    userKnowledge.$set(
                        "entities",
                        userKnowledge.entities.filter((eId) => eId !== entityId)
                    );
                    console.error(
                        `No entity or docRecord found with entityId: ${entityId}`
                    );
                    await userKnowledge.save();
                    continue;
                }

                // increment localEntity Count
                localEntityCount += 1;
                continue;
            }

            // increment count according to sourceType and subSetType
            const { sourceType, subSetType } = entity;
            if (!entityCount[sourceType]) {
                entityCount[sourceType] = {};
            }
            entityCount[sourceType][subSetType] =
                (entityCount?.[sourceType]?.[subSetType] || 0) + 1;
        }
        //console.log("entityCount----->", userId, entityCount);
        await findOneAndUpdateUserUsageStatDocument(
            { userId: userId },
            {
                $set: {
                    localEntityCount: localEntityCount,
                    entityCount: entityCount,
                },
            },
            { upsert: true, new: true }
        );
    }
    //console.log("DONE: recalculated User Usage for EntityCount");
}

export async function findOneUserKnowledge(
    filter?: FilterQuery<IUserKnowledge>,
    projection?: ProjectionType<IUserKnowledge>,
    options?: QueryOptions<IUserKnowledge>
) {
    return await UserKnowledgeModel.findOne(filter, projection, options);
};

export async function createUserKnowledge(doc: Partial<IUserKnowledge>) {
    return await UserKnowledgeModel.create(doc);
}

export const findOneAndUpdateUserKnowledge = async (
    filter?: FilterQuery<IUserKnowledge>,
    update?: UpdateQuery<IUserKnowledge>,
    options?: QueryOptions<IUserKnowledge>
) => {
    return await UserKnowledgeModel.findOneAndUpdate(filter, update, options);
};
