// models/football/fixtureStats.model.ts
import { model, Schema, Document } from "mongoose";
import { IFootballFixtureStats } from "../../types/football";

export type IFootballFixtureStatsDocument = IFootballFixtureStats & Document;

const FixtureStatsSchema = new Schema({
  team: {
    id: Number,
    name: String,
    logo: String,
  },
  statistics: [
    {
      type: Schema.Types.Mixed,
      value: Schema.Types.Mixed,
    },
  ],
},{timestamps:true});

export const FixtureStatsModel = model<IFootballFixtureStatsDocument>(
  "FootballFixtureStats",
  FixtureStatsSchema
);
