// models/football/OddsModel.ts
import mongoose, { Schema, Document } from "mongoose";
import { IFootballOdds } from "../../types/football";

export type IFootballOddsDocument = IFootballOdds & Document;

const OddsSchema: Schema = new Schema({
  league: Object,
  fixture: Object,
  update: String,
  bookmakers: Array,
});

export const FootballOddsModel = mongoose.model<IFootballOddsDocument>(
  "FootballOdds",
  OddsSchema
);
