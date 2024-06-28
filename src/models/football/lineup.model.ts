// models/apisportslineups.model.ts
import { model, Schema, Document } from "mongoose";
import { IFootballLineup } from "../../types/football";

export type IFootballLineupDocument = IFootballLineup & Document;

const FootballLineupsSchema = new Schema({
  team: {
    id: Number,
    name: String,
    logo: String,
    colors: {
      player: {
        primary: String,
        number: String,
        border: String,
      },
      goalkeeper: {
        primary: String,
        number: String,
        border: String,
      },
    },
  },
  formation: String,
  startXI: [
    {
      player: {
        id: Number,
        name: String,
        number: Number,
        pos: String,
        grid: String,
      },
    },
  ],
  substitutes: [
    {
      player: {
        id: Number,
        name: String,
        number: Number,
        pos: String,
        grid: String,
      },
    },
  ],
  coach: {
    id: Number,
    name: String,
    photo: String,
  },
});

export const FootballLineupsModel = model<IFootballLineupDocument>(
  "FootballLineups",
  FootballLineupsSchema
);
