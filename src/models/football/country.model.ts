// models/Country.ts
import { model, Schema, Document } from "mongoose";
import { IFootballCountry } from "../../types/football";

export type IFootballCountryDocument = IFootballCountry & Document;

const FootballCountrySchema = new Schema(
  {
    name: { type: String },
    code: { type: String },
    flag: { type: String },
  },
  { timestamps: false }
);

export const FootballCountryModel = model<IFootballCountry>(
  "FootballCountry",
  FootballCountrySchema
);
