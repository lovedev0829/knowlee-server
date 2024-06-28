import mongoose, { Document, Schema } from "mongoose";

export interface LinkedInJobData {
    id: string;
    link: string;
    title: string;
    companyName: string;
    location: string;
    salaryInfo: string[];
    postedAt: string;
    benefits: string[];
    descriptionHtml: string;
    applicantsCount: string;
    applyUrl: string;
    descriptionText: string;
    seniorityLevel: string;
    employmentType: string;
    jobFunction: string;
    industries: string;
    companyWebsite: string;
}

export interface ILinkedInJobDocument extends Document {
    entityId: string;
    jobs: LinkedInJobData[];
    url: string;
}

const LinkedInJobSchema = new Schema<ILinkedInJobDocument>(
    {
        entityId: {
            type: String,
            ref: "Entity",
            required: true,
        },
        jobs: { type: [Schema.Types.Mixed] as any },
        url: {
            type: String,
            required: true,
        },
    },
    {
        strict: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

LinkedInJobSchema.virtual("entity", {
    ref: "Entity",
    localField: "entityId",
    foreignField: "id",
    justOne: true,
});

const LinkedInJobModel = mongoose.model<ILinkedInJobDocument>(
    "LinkedInJob",
    LinkedInJobSchema
);

export default LinkedInJobModel;
