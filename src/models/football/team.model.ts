// models/Team.ts
import { model, Schema, Document } from "mongoose";
import { IFootballTeam } from "../../types/football";

export type ITeamDocument = IFootballTeam & Document;

const TeamSchema = new Schema(
  {
    id: { type: Number },
    name: { type: String },
    code: { type: String },
    country: { type: String },
    founded: { type: Number },
    national: { type: Boolean },
    logo: { type: String },
  },
  { timestamps: false }
);

export const TeamModel = model<IFootballTeam>("FootballTeam", TeamSchema);
