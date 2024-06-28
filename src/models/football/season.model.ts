// models/Season.ts
import { model, Schema, Document } from "mongoose";
import { IFootballSeason } from "../../types/football";

export type IFootballSeasonDocument = IFootballSeason & Document;

const SeasonSchema = new Schema(
  {
    year: { type: Number },
  },
  { timestamps: false }
);

export const SeasonModel = model<IFootballSeasonDocument>(
  "FootballSeason",
  SeasonSchema
);
