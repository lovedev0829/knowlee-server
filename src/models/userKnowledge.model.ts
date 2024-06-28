import { Document, model, Schema } from "mongoose";
import { entityFindByIdAndUpdate, findEntityDocuments } from "../services/entity.services";
import { isDoubleStepApifyProcess } from "../services/apify.services";
import { findOneUserKnowledge } from "../services/userKnowledge.services";

export interface IUserKnowledge extends Document {
  userId: string;
  entities: string[];
}

const UserKnowledgeSchema = new Schema<IUserKnowledge>({
  userId: { type: String, required: true, unique: true },
  entities: [String],
});

UserKnowledgeSchema.pre("deleteMany", async function (next) {
  const filter = this.getFilter();
  const userKnowledge: IUserKnowledge[] = await this.model.find(filter);
  const promises = [];

  let entitiesIds = [];
  let userKnowledgeIds = [];
  for (const uk of userKnowledge) {
    entitiesIds.push(...uk.entities);
    userKnowledgeIds.push(uk._id);
  }
  entitiesIds = Array.from(new Set(entitiesIds));

  const entities = await findEntityDocuments({ id: { $in: entitiesIds } });

  for (const entity of entities) {

    const { sourceType, subSetType, id, _id: dbEntityId } = entity;
    const isDoubleStep = isDoubleStepApifyProcess({
      sourceType,
      subSetType,
    });
    

    if (isDoubleStep) {
      const isUseful = await findOneUserKnowledge({
        entities: { $in: [id] },
        _id: { $nin: userKnowledgeIds },
      });
      if (!isUseful) {
        promises.push(
          entityFindByIdAndUpdate(dbEntityId, {
            $set: {
              isScheduled: false,
            },
          })
        );
      }
    }
  }

  await Promise.all(promises);
  next();
});

export const UserKnowledgeModel = model<IUserKnowledge>(
  "UserKnowledge",
  UserKnowledgeSchema
);
