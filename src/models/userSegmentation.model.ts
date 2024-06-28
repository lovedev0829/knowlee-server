import { Document, InferSchemaType, model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Define an enum for the 'professions' field
enum Professions {
  DigitalMarketer = "digital_marketer",
  ContentCreator = "content_creator",
  Journalist = "journalist",
  ProjectManager = "project_manager",
  Educator = "educator",
  Student = "student",
  SoftwareDeveloper = "software_developer",
  CustomerSupportSpecialist = "customer_support_specialist",
  HRProfessional = "hr_professional",
  FinanceProfessional = "finance_professional",
}

export interface IUserSegmentation extends Document {
  id: string;
  userId: string;
  questions: {
    professions: Professions;
    goals: {
      realtimeInsights: boolean;
      summarizeInformation: boolean;
      generateContent: boolean;
      projectManagement: boolean;
      personalGrowth: boolean;
    };
    support: {
      insights: boolean;
      automation: boolean;
      creativity: boolean;
      summaries: boolean;
    };
  };
}

const UserSegmentationSchema = new Schema<IUserSegmentation>({
  id: {
    type: String,
    default: uuidv4,
    required: true,
    unique: true,
  },
  userId: { type: String, unique: true },
  questions: {
    professions: {
      type: String,
      enum: [
        "digital_marketer",
        "content_creator",
        "journalist",
        "project_manager",
        "educator",
        "student",
        "software_developer",
        "customer_support_specialist",
        "hr_professional",
        "finance_professional",
      ],  
      // default: 'market',
    },
    goals: {
      realtimeInsights: { type: Boolean, default: false },
      summarizeInformation: { type: Boolean, default: false },
      generateContent: { type: Boolean, default: false },
      projectManagement: { type: Boolean, default: false },
      personalGrowth: { type: Boolean, default: false },
    },
    support: {
      insights: { type: Boolean, default: false },
      automation: { type: Boolean, default: false },
      creativity: { type: Boolean, default: false },
      summaries: { type: Boolean, default: false },
    },
  },
});

export type UserSegmentation = InferSchemaType<typeof UserSegmentationSchema>;

export const UserSegmentationModel = model<IUserSegmentation>(
  "UserSegmentation",
  UserSegmentationSchema
);
